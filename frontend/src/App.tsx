import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import AlgorithmsPage from './AlgorithmsPage';
import WalletPage from './WalletPage';
import TradePage from './TradePage';
import GraphPage from './GraphPage';

type Page = 'dashboard' | 'wallet' | 'trade' | 'graph' | 'algorithms' | 'settings';

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id: 'wallet', label: 'Wallet', icon: 'M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a1 1 0 100 2 1 1 0 000-2z' },
  { id: 'trade', label: 'Trade', icon: 'M22 12l-4 4-4-4M18 16V4M2 12l4-4 4 4M6 8v12' },
  { id: 'graph', label: 'Graph', icon: 'M12 2a4 4 0 014 4c0 1.1-.5 2.1-1.2 2.8l3.8 3.8M12 2a4 4 0 00-4 4c0 1.1.5 2.1 1.2 2.8L5.4 12.6M12 22a4 4 0 01-4-4c0-1.1.5-2.1 1.2-2.8M12 22a4 4 0 004-4c0-1.1-.5-2.1-1.2-2.8' },
  { id: 'algorithms', label: 'Algorithms', icon: 'M22 12l-4-4v3H8V8l-4 4 4 4v-3h10v3z' },
  { id: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' },
];

function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="url(#lg)" />
          <path d="M14 34L24 14L34 34H14Z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
          <circle cx="24" cy="28" r="3" fill="#00d4ff" />
          <defs><linearGradient id="lg" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#00d4ff" /><stop offset="1" stopColor="#a855f7" /></linearGradient></defs>
        </svg>
        <h2>ArbitrageX</h2>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <a key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.initials || '?'}</div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'Unknown'}</div>
          <div className="user-email">{user?.email || ''}</div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign Out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  );
}

function SettingsPage() {
  const { user } = useAuth();
  const resetWallet = () => {
    localStorage.removeItem('arb_balances');
    localStorage.removeItem('arb_transactions');
    window.location.reload();
  };
  return (
    <>
      <div className="page-header fade-in"><h1 className="page-title">Settings</h1></div>
      <div className="glass fade-in" style={{ padding: 28 }}>
        <div className="section-title" style={{ marginBottom: 20 }}>👤 Account</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div><div style={{ fontSize: '0.78rem', color: '#7a8ba8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>Full Name</div><div style={{ fontWeight: 600 }}>{user?.name}</div></div>
          <div><div style={{ fontSize: '0.78rem', color: '#7a8ba8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>Email</div><div style={{ fontWeight: 600 }}>{user?.email}</div></div>
          <div><div style={{ fontSize: '0.78rem', color: '#7a8ba8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>Engine</div><div className="mono" style={{ fontWeight: 600, color: '#00d4ff' }}>C++17 Bellman-Ford</div></div>
          <div><div style={{ fontSize: '0.78rem', color: '#7a8ba8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>API Status</div><div style={{ fontWeight: 600, color: '#39ff14' }}>● Connected</div></div>
        </div>
      </div>
      <div className="glass fade-in fade-in-delay-1" style={{ padding: 28, marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 20 }}>🔧 System</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div><div style={{ fontSize: '0.78rem', color: '#7a8ba8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>Backend</div><div className="mono" style={{ fontSize: '0.88rem' }}>Express.js → C++ Engine</div></div>
          <div><div style={{ fontSize: '0.78rem', color: '#7a8ba8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>Database</div><div className="mono" style={{ fontSize: '0.88rem' }}>Neon PostgreSQL</div></div>
          <div><div style={{ fontSize: '0.78rem', color: '#7a8ba8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>Frontend</div><div className="mono" style={{ fontSize: '0.88rem' }}>React + Vite + TypeScript</div></div>
          <div><div style={{ fontSize: '0.78rem', color: '#7a8ba8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>Algorithm</div><div className="mono" style={{ fontSize: '0.88rem' }}>Bellman-Ford (Neg. Cycle)</div></div>
        </div>
      </div>
      <div className="glass fade-in fade-in-delay-2" style={{ padding: 28, marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>⚠️ Danger Zone</div>
        <button onClick={resetWallet} style={{ padding: '12px 24px', borderRadius: 10, background: 'rgba(255,45,123,0.1)', border: '1px solid rgba(255,45,123,0.3)', color: '#ff2d7b', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.3s ease' }}>
          Reset Wallet & Transactions
        </button>
      </div>
    </>
  );
}

function AuthenticatedApp() {
  const [page, setPage] = useState<Page>('dashboard');
  return (
    <div className="app-container">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        {page === 'dashboard' && <Dashboard />}
        {page === 'wallet' && <WalletPage />}
        {page === 'trade' && <TradePage />}
        {page === 'graph' && <GraphPage />}
        {page === 'algorithms' && <AlgorithmsPage />}
        {page === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="login-page">
      <div className="loading-container">
        <div className="spinner" />
        <div className="loading-text mono">Initializing ArbitrageX...</div>
      </div>
    </div>
  );
  return user ? <AuthenticatedApp /> : <LoginPage />;
}
