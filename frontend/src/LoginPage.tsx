import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { login, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    const ok = await login(email, password);
    if (!ok) setError('Invalid credentials. Try demo@arbitragex.io / demo');
  };

  return (
    <div className="login-page">
      <div className="login-container glass fade-in">
        <div className="login-header">
          <div style={{ marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="url(#g1)" />
              <path d="M14 34L24 14L34 34H14Z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
              <circle cx="24" cy="28" r="3" fill="#00d4ff" />
              <defs><linearGradient id="g1" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#00d4ff" /><stop offset="1" stopColor="#a855f7" /></linearGradient></defs>
            </svg>
          </div>
          <h1>ArbitrageX</h1>
          <p>Crypto Arbitrage Detection Engine</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input" type="email" placeholder="trader@arbitragex.io"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="login-btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}

        <div className="login-divider">or</div>

        <button className="login-demo" onClick={demoLogin}>
          ⚡ Quick Demo Access
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: '#4a5568' }}>
          Demo: demo@arbitragex.io / demo
        </p>
      </div>
    </div>
  );
}
