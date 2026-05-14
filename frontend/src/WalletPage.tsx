import { useState } from 'react';

interface WalletBalance {
  currency: string;
  ticker: string;
  amount: number;
  usdRate: number;
  color: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'trade' | 'withdrawal';
  description: string;
  amount: string;
  usdValue: string;
  positive: boolean;
  time: string;
}

const INITIAL_BALANCES: WalletBalance[] = [
  { currency: 'US Dollar', ticker: 'USD', amount: 10000, usdRate: 1, color: '#39ff14' },
  { currency: 'Euro', ticker: 'EUR', amount: 0, usdRate: 1.08, color: '#00d4ff' },
  { currency: 'British Pound', ticker: 'GBP', amount: 0, usdRate: 1.26, color: '#a855f7' },
  { currency: 'Bitcoin', ticker: 'BTC', amount: 0, usdRate: 62500, color: '#f7931a' },
  { currency: 'Ethereum', ticker: 'ETH', amount: 0, usdRate: 3030, color: '#627eea' },
  { currency: 'Solana', ticker: 'SOL', amount: 0, usdRate: 140, color: '#9945ff' },
];

export default function WalletPage() {
  const [balances, setBalances] = useState<WalletBalance[]>(() => {
    const saved = localStorage.getItem('arb_balances');
    return saved ? JSON.parse(saved) : INITIAL_BALANCES;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('arb_transactions');
    return saved ? JSON.parse(saved) : [
      { id: '1', type: 'deposit', description: 'Initial USD Deposit', amount: '+$10,000.00', usdValue: '$10,000.00', positive: true, time: 'Account creation' },
    ];
  });
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addCurrency, setAddCurrency] = useState('USD');
  const [addAmount, setAddAmount] = useState('');

  const saveState = (newBal: WalletBalance[], newTx: Transaction[]) => {
    localStorage.setItem('arb_balances', JSON.stringify(newBal));
    localStorage.setItem('arb_transactions', JSON.stringify(newTx));
  };

  const totalUSD = balances.reduce((sum, b) => sum + b.amount * b.usdRate, 0);
  const initialUSD = 10000;
  const pnl = totalUSD - initialUSD;
  const pnlPercent = ((pnl / initialUSD) * 100).toFixed(2);

  const handleAddFunds = () => {
    const amt = parseFloat(addAmount);
    if (!amt || amt <= 0) return;
    const newBal = balances.map(b =>
      b.ticker === addCurrency ? { ...b, amount: b.amount + amt } : b
    );
    const curr = balances.find(b => b.ticker === addCurrency)!;
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      description: `Deposit ${amt.toLocaleString()} ${addCurrency}`,
      amount: `+${amt.toLocaleString()} ${addCurrency}`,
      usdValue: `$${(amt * curr.usdRate).toLocaleString()}`,
      positive: true,
      time: new Date().toLocaleTimeString(),
    };
    const updatedTx = [newTx, ...transactions];
    setBalances(newBal);
    setTransactions(updatedTx);
    saveState(newBal, updatedTx);
    setShowAddFunds(false);
    setAddAmount('');
  };

  return (
    <>
      <div className="page-header fade-in">
        <h1 className="page-title">Wallet</h1>
        <button
          className="login-btn"
          style={{ width: 'auto', padding: '10px 24px', fontSize: '0.88rem' }}
          onClick={() => setShowAddFunds(true)}
        >
          + Add Funds
        </button>
      </div>

      {/* Total Portfolio Value */}
      <div className="wallet-total glass fade-in fade-in-delay-1">
        <div className="wallet-total-label">Total Portfolio Value</div>
        <div className="wallet-total-value">
          ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`wallet-pnl ${pnl >= 0 ? 'up' : 'down'}`}>
          {pnl >= 0 ? '↑' : '↓'} {pnl >= 0 ? '+' : ''}{pnlPercent}% ({pnl >= 0 ? '+' : ''}${pnl.toFixed(2)})
        </div>
      </div>

      {/* Currency Balances */}
      <div className="section-title fade-in fade-in-delay-2">💰 Currency Balances</div>
      <div className="balances-grid fade-in fade-in-delay-2">
        {balances.map(b => (
          <div key={b.ticker} className="balance-card glass">
            <div className="balance-header">
              <div className="balance-currency">
                <div className="balance-icon" style={{ background: `${b.color}18`, color: b.color }}>{b.ticker}</div>
                <div>
                  <div className="balance-name">{b.currency}</div>
                  <div className="balance-ticker">{b.ticker}</div>
                </div>
              </div>
            </div>
            <div className="balance-amount">{b.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
            <div className="balance-usd">≈ ${(b.amount * b.usdRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="section-title fade-in fade-in-delay-3">📋 Transaction History</div>
      <div className="glass fade-in fade-in-delay-3" style={{ padding: 20 }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#4a5568' }}>No transactions yet</div>
        ) : (
          <div className="tx-list">
            {transactions.slice(0, 15).map(tx => (
              <div key={tx.id} className="tx-item">
                <div className="tx-left">
                  <div className={`tx-icon ${tx.positive ? 'buy' : 'sell'}`}>
                    {tx.type === 'deposit' ? '↓' : tx.type === 'trade' ? '⇄' : '↑'}
                  </div>
                  <div className="tx-details">
                    <div className="tx-type">{tx.description}</div>
                    <div className="tx-time">{tx.time}</div>
                  </div>
                </div>
                <div className="tx-amount">
                  <div className={`tx-value ${tx.positive ? 'positive' : 'negative'}`}>{tx.amount}</div>
                  <div className="tx-usd">{tx.usdValue}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="modal-overlay" onClick={() => setShowAddFunds(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button className="modal-close" onClick={() => setShowAddFunds(false)}>✕</button>
            <h2 className="modal-title">Add Funds</h2>
            <div className="trade-input-label">Select Currency</div>
            <div className="currency-select">
              {balances.map(b => (
                <div
                  key={b.ticker}
                  className={`currency-option ${addCurrency === b.ticker ? 'selected' : ''}`}
                  onClick={() => setAddCurrency(b.ticker)}
                >
                  {b.ticker}
                </div>
              ))}
            </div>
            <div className="trade-input-group">
              <label className="trade-input-label">Amount</label>
              <input className="trade-input" type="number" placeholder="0.00" value={addAmount} onChange={e => setAddAmount(e.target.value)} min="0" step="any" />
            </div>
            <button className="login-btn" onClick={handleAddFunds} style={{ marginTop: 4 }}>
              Deposit {addCurrency}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Export for use in trade simulator
export function useWallet() {
  const getBalances = (): WalletBalance[] => {
    const saved = localStorage.getItem('arb_balances');
    return saved ? JSON.parse(saved) : INITIAL_BALANCES;
  };
  const setBalances = (b: WalletBalance[]) => localStorage.setItem('arb_balances', JSON.stringify(b));
  const addTransaction = (tx: Transaction) => {
    const saved = localStorage.getItem('arb_transactions');
    const txs: Transaction[] = saved ? JSON.parse(saved) : [];
    localStorage.setItem('arb_transactions', JSON.stringify([tx, ...txs]));
  };
  return { getBalances, setBalances, addTransaction };
}
