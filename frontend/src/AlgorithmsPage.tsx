

const ALGORITHMS = [
  {
    name: 'Bellman-Ford (Arbitrage Core)',
    desc: 'The core of our arbitrage engine. Detects negative-weight cycles in the -log(rate) transformed graph, which correspond to profitable trading loops.',
    complexity: 'O(V × E)',
    highlight: true,
  },
  {
    name: 'Dijkstra (Binary Heap)',
    desc: 'Single-source shortest path using a binary min-heap priority queue. Efficient for non-negative weighted graphs.',
    complexity: 'O((V + E) log V)',
  },
  {
    name: 'Dijkstra (Fibonacci Heap)',
    desc: 'Theoretically optimal variant using Fibonacci heaps for decrease-key operations in O(1) amortized time.',
    complexity: 'O(V log V + E)',
  },
  {
    name: 'Floyd-Warshall',
    desc: 'All-pairs shortest path algorithm using dynamic programming. Computes distances between every pair of vertices simultaneously.',
    complexity: 'O(V³)',
  },
];

const MATH_STEPS = [
  { step: 1, title: 'Exchange Rate Matrix', desc: 'Construct a V×V matrix where M[i][j] represents the exchange rate from currency i to currency j.' },
  { step: 2, title: 'Logarithmic Transform', desc: 'Transform each edge weight: w(i,j) = -log(rate[i][j]). This converts multiplicative relationships to additive ones.' },
  { step: 3, title: 'Negative Cycle Detection', desc: 'Run Bellman-Ford for V-1 iterations. If any edge can still be relaxed on the V-th iteration, a negative cycle exists.' },
  { step: 4, title: 'Cycle Extraction', desc: 'Trace back through predecessor array to extract the exact sequence of currencies forming the arbitrage opportunity.' },
  { step: 5, title: 'Profit Calculation', desc: 'Compute profit = (∏ rates along cycle) − 1. A positive value means starting with $1 yields more than $1 after the loop.' },
];

export default function AlgorithmsPage() {
  return (
    <>
      <div className="page-header fade-in">
        <h1 className="page-title">Algorithms</h1>
      </div>

      <div className="section-title fade-in">🧮 How Arbitrage Detection Works</div>
      <div className="glass fade-in" style={{ padding: 28, marginBottom: 28 }}>
        {MATH_STEPS.map(s => (
          <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: s.step < 5 ? 20 : 0, alignItems: 'flex-start' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#00d4ff', fontSize: '0.85rem',
            }}>
              {s.step}
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
              <div style={{ color: '#7a8ba8', fontSize: '0.88rem', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title fade-in fade-in-delay-1">⚙️ Implemented Graph Algorithms</div>
      <div className="algo-grid fade-in fade-in-delay-2">
        {ALGORITHMS.map(a => (
          <div key={a.name} className="algo-card glass" style={a.highlight ? { borderColor: 'rgba(57,255,20,0.3)' } : {}}>
            <div className="algo-name" style={a.highlight ? { color: '#39ff14' } : {}}>{a.name}</div>
            <div className="algo-desc">{a.desc}</div>
            <div className="algo-complexity">{a.complexity}</div>
          </div>
        ))}
      </div>
    </>
  );
}
