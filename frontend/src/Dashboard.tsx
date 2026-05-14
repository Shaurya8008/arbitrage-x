import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface ArbitrageData {
  status: string;
  profit_margin: number;
  route: string[];
  rates_matrix: number[][];
  currencies: string[];
  data_source?: string;
  timestamp?: string;
  source?: string;
}

const CURRENCY_COLORS: Record<string, string> = {
  BTC: '#f7931a', ETH: '#627eea', USD: '#39ff14', EUR: '#00d4ff', GBP: '#a855f7', SOL: '#9945ff',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ArbitrageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [scanCount, setScanCount] = useState(247);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/arbitrage');
        setData(res.data);
        setLastUpdate(new Date());
        setScanCount(c => c + 1);
      } catch {
        console.error('API fetch failed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <div className="loading-text mono">Scanning global crypto markets...</div>
      </div>
    );
  }

  const pairs = data ? [
    { name: 'BTC/USD', rate: data.rates_matrix[3][0], change: '+1.24%', up: true },
    { name: 'ETH/USD', rate: data.rates_matrix[4][0], change: '-0.52%', up: false },
    { name: 'SOL/USD', rate: data.rates_matrix[5][0], change: '+4.31%', up: true },
    { name: 'EUR/USD', rate: data.rates_matrix[1][0], change: '+0.18%', up: true },
    { name: 'GBP/USD', rate: data.rates_matrix[2][0], change: '-0.07%', up: false },
    { name: 'ETH/GBP', rate: data.rates_matrix[4][2], change: '+2.15%', up: true },
  ] : [];

  return (
    <>
      {/* Page Header */}
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: '#7a8ba8', fontSize: '0.88rem', marginTop: 4 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Trader'}
          </p>
        </div>
        <div className="live-badge" style={{ background: data?.data_source === 'live' ? 'rgba(57,255,20,0.08)' : 'rgba(251,191,36,0.08)', borderColor: data?.data_source === 'live' ? 'rgba(57,255,20,0.2)' : 'rgba(251,191,36,0.2)', color: data?.data_source === 'live' ? '#39ff14' : '#fbbf24' }}>
          <span className="live-dot" style={{ background: data?.data_source === 'live' ? '#39ff14' : '#fbbf24' }} />
          {data?.data_source === 'live' ? '🌐 LIVE RATES' : '🧪 DEMO DATA'}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card glass fade-in fade-in-delay-1">
          <div className="stat-label">Profit Margin</div>
          <div className="stat-value green">+{data?.profit_margin?.toFixed(2) || '0'}%</div>
          <div className="stat-change up">↑ Opportunity detected</div>
        </div>
        <div className="stat-card glass fade-in fade-in-delay-2">
          <div className="stat-label">Route Length</div>
          <div className="stat-value cyan">{data?.route?.length || 0} hops</div>
          <div className="stat-change up">Optimal path found</div>
        </div>
        <div className="stat-card glass fade-in fade-in-delay-3">
          <div className="stat-label">Currencies Tracked</div>
          <div className="stat-value gold">{data?.currencies?.length || 0}</div>
          <div className="stat-change up">↑ 6 active markets</div>
        </div>
        <div className="stat-card glass fade-in fade-in-delay-4">
          <div className="stat-label">Scans Completed</div>
          <div className="stat-value pink">{scanCount}</div>
          <div className="stat-change up">
            Last: {lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
          </div>
        </div>
      </div>

      {/* Arbitrage Route */}
      <div className="route-section fade-in fade-in-delay-2">
        <div className="section-title">⚡ Detected Arbitrage Route</div>
        <div className="route-card glass">
          <div className="route-path">
            {data?.route?.map((currency, i) => (
              <Fragment key={i}>
                <div className="route-node" style={{ borderColor: CURRENCY_COLORS[currency] || '#00d4ff' }}>
                  {currency}
                </div>
                {i < data.route.length - 1 && <span className="route-arrow">→</span>}
              </Fragment>
            ))}
          </div>
          <div className="profit-display">
            <div className="profit-label">Net Profit Margin</div>
            <div className="profit-value">+{data?.profit_margin?.toFixed(3)}%</div>
          </div>
        </div>
      </div>

      {/* Live Pairs */}
      <div className="fade-in fade-in-delay-3">
        <div className="section-title">📊 Live Exchange Rates</div>
        <div className="pairs-grid">
          {pairs.map(p => (
            <div key={p.name} className="pair-card glass">
              <div className="pair-left">
                <div className="pair-icon" style={{ background: `${CURRENCY_COLORS[p.name.split('/')[0]] || '#00d4ff'}18`, color: CURRENCY_COLORS[p.name.split('/')[0]] || '#00d4ff' }}>
                  {p.name.split('/')[0]}
                </div>
                <div className="pair-name">{p.name}</div>
              </div>
              <div className="pair-rate">
                <div className="pair-rate-value">{p.rate > 100 ? `$${p.rate.toLocaleString()}` : p.rate.toFixed(4)}</div>
                <div className={`pair-rate-change ${p.up ? 'up' : 'down'}`}>{p.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exchange Matrix */}
      <div className="fade-in fade-in-delay-4">
        <div className="section-title">🔢 Full Exchange Rate Matrix</div>
        <div className="matrix-card glass">
          <table className="matrix-table">
            <thead>
              <tr>
                <th></th>
                {data?.currencies?.map(c => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {data?.currencies?.map((from, i) => (
                <tr key={from}>
                  <td style={{ color: '#00d4ff', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{from}</td>
                  {data.rates_matrix[i].map((rate, j) => (
                    <td key={j} className={rate === 0 ? 'zero' : rate > 100 ? 'highlight' : ''}>
                      {rate === 0 ? '—' : rate >= 1000 ? rate.toLocaleString() : rate < 0.001 ? rate.toExponential(1) : rate.toFixed(4)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
