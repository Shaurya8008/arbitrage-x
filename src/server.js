const express = require('express');
const { execSync } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

// Drizzle & Postgres
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const schema = require('./db/schema.ts');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

const ENGINE_PATH = path.join(__dirname, '..', 'build', 'NetworkRoutingAnalyzer');
const RATES_FILE = path.join(__dirname, '..', 'build', 'live_rates.json');

// DB Connection
const db = drizzle(postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } }), { schema });

// ========== LIVE RATE FETCHING ==========
// ... (fetchJSON logic remains same)
function fetchJSON(url, redirectCount = 0) {
  if (redirectCount > 3) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'ArbitrageX/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location, redirectCount + 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error from ${url}: ${data.slice(0, 100)}`)); }
      });
    }).on('error', reject);
  });
}

let ratesCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30000;

async function fetchLiveRates() {
  const now = Date.now();
  if (ratesCache && (now - cacheTimestamp) < CACHE_TTL_MS) return ratesCache;

  console.log('[LIVE] Fetching real exchange rates from APIs...');
  const currencies = ['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'SOL'];
  const V = 6;
  const rates = Array.from({ length: V }, () => Array(V).fill(0));

  try {
    const fiatData = await fetchJSON(process.env.FRANKFURTER_API_URL || 'https://api.frankfurter.dev/v1/latest?from=USD&to=EUR,GBP');
    const usdToEur = fiatData.rates?.EUR || 0.92;
    const usdToGbp = fiatData.rates?.GBP || 0.79;

    const cryptoData = await fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,eur,gbp');
    const btcUsd = cryptoData.bitcoin?.usd || 62500;
    const btcEur = cryptoData.bitcoin?.eur || 57500;
    const btcGbp = cryptoData.bitcoin?.gbp || 49500;
    const ethUsd = cryptoData.ethereum?.usd || 3030;
    const ethEur = cryptoData.ethereum?.eur || 2790;
    const ethGbp = cryptoData.ethereum?.gbp || 2400;
    const solUsd = cryptoData.solana?.usd || 140;
    const solEur = cryptoData.solana?.eur || 129;
    const solGbp = cryptoData.solana?.gbp || 111;

    // Rates matrix construction
    rates[0][1] = usdToEur; rates[1][0] = 1 / usdToEur;
    rates[0][2] = usdToGbp; rates[2][0] = 1 / usdToGbp;
    rates[1][2] = usdToGbp / usdToEur; rates[2][1] = usdToEur / usdToGbp;
    rates[0][3] = 1 / btcUsd; rates[3][0] = btcUsd;
    rates[0][4] = 1 / ethUsd; rates[4][0] = ethUsd;
    rates[0][5] = 1 / solUsd; rates[5][0] = solUsd;
    rates[1][3] = 1 / btcEur; rates[3][1] = btcEur;
    rates[1][4] = 1 / ethEur; rates[4][1] = ethEur;
    rates[1][5] = 1 / solEur; rates[5][1] = solEur;
    rates[2][3] = 1 / btcGbp; rates[3][2] = btcGbp;
    rates[2][4] = 1 / ethGbp; rates[4][2] = ethGbp;
    rates[2][5] = 1 / solGbp; rates[5][2] = solGbp;
    rates[3][4] = btcUsd / ethUsd; rates[4][3] = ethUsd / btcUsd;
    rates[3][5] = btcUsd / solUsd; rates[5][3] = solUsd / btcUsd;
    rates[4][5] = ethUsd / solUsd; rates[5][4] = solUsd / ethUsd;

    const result = { currencies, rates_matrix: rates, source: 'live', timestamp: new Date().toISOString() };
    ratesCache = result; cacheTimestamp = now;
    return result;
  } catch (err) {
    console.error('[LIVE] API fetch failed:', err.message);
    return ratesCache;
  }
}

// ========== API ENDPOINTS ==========

app.get('/api/arbitrage', async (req, res) => {
  try {
    const liveRates = await fetchLiveRates();
    let result;

    if (liveRates) {
      fs.writeFileSync(RATES_FILE, JSON.stringify(liveRates, null, 2));
      const output = execSync(`"${ENGINE_PATH}" --arbitrage-json --rates-file "${RATES_FILE}"`, { timeout: 10000, encoding: 'utf-8' });
      result = JSON.parse(output);
      result.timestamp = liveRates.timestamp;
      result.data_source = 'live';
    } else {
      const output = execSync(`"${ENGINE_PATH}" --arbitrage-json`, { timeout: 10000, encoding: 'utf-8' });
      result = JSON.parse(output);
      result.data_source = 'demo';
    }
    res.json(result);
  } catch (err) {
    console.error('Engine error:', err.message);
    res.status(500).json({ status: 'error', message: 'Engine execution failed' });
  }
});

// New Endpoint: Save Trade to Database
app.post('/api/simulations', async (req, res) => {
  const { userId, name, algorithm, nodeCount, edgeCount, executionTimeMs, routes } = req.body;
  try {
    const [sim] = await db.insert(schema.simulations).values({
      id: crypto.randomUUID(),
      userId,
      name,
      nodeCount,
      edgeCount,
      algorithmUsed: algorithm,
      executionTimeMs,
    }).returning();

    if (routes && routes.length > 0) {
      const routeValues = routes.map(r => ({
        id: crypto.randomUUID(),
        simulationId: sim.id,
        startNode: r.start,
        endNode: r.end,
        path: JSON.stringify(r.path),
        totalWeight: r.weight,
      }));
      await db.insert(schema.routes).values(routeValues);
    }

    res.json({ status: 'ok', simulationId: sim.id });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save simulation' });
  }
});

// Simple Auth Endpoints (for Demo/Next Level)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // In a real app, use bcrypt. For this "next level" demo, we check against a seeded user.
    const users = await db.select().from(schema.user).where(require('drizzle-orm').eq(schema.user.email, email));
    const user = users[0];

    if (user && password === 'admin123') { // Simple password check for demo
      res.json({ status: 'ok', user: { id: user.id, name: user.name, email: user.email, initials: user.name.split(' ').map(n => n[0]).join('') } });
    } else {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Auth failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email } = req.body;
  try {
    const [newUser] = await db.insert(schema.user).values({
      id: crypto.randomUUID(),
      name,
      email,
      emailVerified: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    res.json({ status: 'ok', user: newUser });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Registration failed' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', engine: 'C++17 Bellman-Ford', uptime: process.uptime() }));

// Catch-all to serve React index.html for any client-side routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ArbitrageX API running on http://localhost:${PORT}`));
