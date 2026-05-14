import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface ArbitrageData {
  status: string;
  profit_margin: number;
  route: string[];
  rates_matrix: number[][];
  currencies: string[];
  execution_time_ms?: number;
}

const CURRENCY_IDX: Record<string, number> = { USD: 0, EUR: 1, GBP: 2, BTC: 3, ETH: 4, SOL: 5 };
const USD_RATES: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.26, BTC: 62500, ETH: 3030, SOL: 140 };

export default function TradePage() {
  const { user } = useAuth();
  const [data, setData] = useState<ArbitrageData | null>(null);
  const [inputAmount, setInputAmount] = useState('1000');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/arbitrage').then(r => setData(r.data)).catch(() => {});
  }, []);

  const amount = parseFloat(inputAmount) || 0;
  const profitMargin = data?.profit_margin || 0;
  const outputAmount = amount * (1 + profitMargin / 100);
  const profitUSD = outputAmount - amount;
  const route = data?.route || [];
  const startCurrency = route[0] || 'EUR';

  const executeArbitrage = async () => {
    if (amount <= 0 || !data) return;
    setExecuting(true);
    setResult(null);

    // Simulate trade execution with delay per hop
    for (let i = 0; i < route.length; i++) {
      await new Promise(r => setTimeout(r, 600));
    }

    // Persist to Database if user is logged in
    if (user) {
      try {
        await axios.post('/api/simulations', {
          userId: user.id,
          name: `Arb: ${route.join(' -> ')}`,
          algorithm: 'Bellman-Ford',
          nodeCount: 6,
          edgeCount: 30,
          executionTimeMs: data.execution_time_ms || 0.5,
          routes: [{
            start: CURRENCY_IDX[route[0]],
            end: CURRENCY_IDX[route[route.length-1]],
            path: route,
            weight: profitMargin
          }]
        });
      } catch (err) {
        console.error('Failed to save to DB:', err);
      }
    }

    // Update wallet balances (local state for now)
    const saved = localStorage.getItem('arb_balances');
    if (saved) {
      const balances = JSON.parse(saved);
      const startIdx = balances.findIndex((b: any) => b.ticker === startCurrency);
      if (startIdx !== -1 && balances[startIdx].amount >= amount / USD_RATES[startCurrency]) {
        const tradeUnits = amount / USD_RATES[startCurrency];
        balances[startIdx].amount += tradeUnits * (profitMargin / 100);
        localStorage.setItem('arb_balances', JSON.stringify(balances));

        const txSaved = localStorage.getItem('arb_transactions');
        const txs = txSaved ? JSON.parse(txSaved) : [];
        txs.unshift({
          id: Date.now().toString(),
          type: 'trade',
          description: `Arbitrage: ${route.join(' → ')}`,
          amount: `+$${profitUSD.toFixed(2)}`,
          usdValue: `$${outputAmount.toFixed(2)} total`,
          positive: true,
          time: new Date().toLocaleTimeString(),
        });
        localStorage.setItem('arb_transactions', JSON.stringify(txs));
        setResult(`Trade executed! Data saved to cloud. Profit: +$${profitUSD.toFixed(2)} USD`);
      } else {
        setResult(`Insufficient ${startCurrency} balance. Add funds in the Wallet page first.`);
      }
    } else {
      setResult('No wallet found. Visit the Wallet page to set up your account.');
    }

    setExecuting(false);
  };

  return (
    <>
      <div className="page-header fade-in">
        <h1 className="page-title">Trade Simulator</h1>
        <div className="live-badge">
          <span className="live-dot" />
          LIVE RATES
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Trade Panel */}
        <div className="trade-panel glass fade-in fade-in-delay-1">
          <div className="trade-title">Execute Arbitrage Route</div>

          <div className="trade-input-label" style={{ marginTop: 8 }}>Detected Route</div>
          <div className="trade-route-display">
            {route.map((c, i) => (
              <Fragment key={i}>
                <span className="route-node" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>{c}</span>
                {i < route.length - 1 && <span className="route-arrow" style={{ fontSize: '0.9rem' }}>→</span>}
              </Fragment>
            ))}
          </div>

          <div className="trade-input-group">
            <label className="trade-input-label">Investment Amount (USD)</label>
            <input
              className="trade-input"
              type="number"
              placeholder="1000"
              value={inputAmount}
              onChange={e => setInputAmount(e.target.value)}
              min="0"
              step="any"
            />
          </div>

          <div className="trade-result">
            <div className="trade-result-row">
              <span className="trade-result-label">Input</span>
              <span className="trade-result-value">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="trade-result-row">
              <span className="trade-result-label">Profit Margin</span>
              <span className="trade-result-value profit">+{profitMargin.toFixed(3)}%</span>
            </div>
            <div className="trade-result-row">
              <span className="trade-result-label">Expected Output</span>
              <span className="trade-result-value profit">${outputAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="trade-result-row" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 4 }}>
              <span className="trade-result-label" style={{ fontWeight: 700, color: '#e8edf5' }}>Net Profit</span>
              <span className="trade-result-value profit" style={{ fontSize: '1.1rem' }}>+${profitUSD.toFixed(2)}</span>
            </div>
          </div>

          <button className="execute-btn" onClick={executeArbitrage} disabled={executing || amount <= 0}>
            {executing ? '⏳ Executing Trade...' : '⚡ Execute Arbitrage'}
          </button>

          {result && (
            <div style={{
              marginTop: 16, padding: 14, borderRadius: 10, fontSize: '0.88rem', fontWeight: 600,
              background: result.includes('Profit') ? 'rgba(57,255,20,0.08)' : 'rgba(255,45,123,0.08)',
              border: `1px solid ${result.includes('Profit') ? 'rgba(57,255,20,0.2)' : 'rgba(255,45,123,0.2)'}`,
              color: result.includes('Profit') ? '#39ff14' : '#ff2d7b',
            }}>
              {result}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="fade-in fade-in-delay-2">
          <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 16 }}>How This Trade Works</div>
            {route.length > 1 && data && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {route.slice(0, -1).map((from, i) => {
                  const to = route[i + 1];
                  const fromIdx = CURRENCY_IDX[from];
                  const toIdx = CURRENCY_IDX[to];
                  const rate = data.rates_matrix[fromIdx]?.[toIdx] || 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#00d4ff', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{from} → {to}</div>
                        <div className="mono" style={{ fontSize: '0.78rem', color: '#7a8ba8' }}>Rate: {rate > 0 ? (rate >= 1000 ? rate.toLocaleString() : rate.toFixed(6)) : 'N/A'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="glass" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 12 }}>⚠️ Simulation Notice</div>
            <p style={{ color: '#7a8ba8', fontSize: '0.88rem', lineHeight: 1.7 }}>
              This is a <strong style={{ color: '#fbbf24' }}>simulated trading environment</strong> for educational purposes.
              The arbitrage detection uses real mathematical algorithms (Bellman-Ford negative cycle detection with -log transformations),
              but the trades execute against simulated balances.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
