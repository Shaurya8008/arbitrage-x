import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const COLORS: Record<string, string> = {
  USD: '#39ff14', EUR: '#00d4ff', GBP: '#a855f7', BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff',
};

interface ArbitrageData {
  status: string;
  profit_margin: number;
  route: string[];
  rates_matrix: number[][];
  currencies: string[];
}

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<ArbitrageData | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    axios.get('/api/arbitrage').then(r => setData(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * 0.32;
    const N = data.currencies.length;
    let tick = 0;

    // Node positions in a circle
    const nodes = data.currencies.map((name, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      return { name, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, color: COLORS[name] || '#fff' };
    });

    // Build edges from matrix
    const edges: { from: number; to: number; rate: number; inRoute: boolean }[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i !== j && data.rates_matrix[i][j] > 0) {
          const inRoute = data.route.some((c, idx) =>
            idx < data.route.length - 1 && data.currencies[i] === c && data.currencies[j] === data.route[idx + 1]
          );
          edges.push({ from: i, to: j, rate: data.rates_matrix[i][j], inRoute });
        }
      }
    }

    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = 'rgba(100,180,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Draw edges
      edges.forEach(e => {
        const a = nodes[e.from];
        const b = nodes[e.to];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        if (e.inRoute) {
          const pulse = 0.4 + 0.3 * Math.sin(tick * 0.05);
          ctx.strokeStyle = `rgba(57, 255, 20, ${pulse})`;
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
        } else {
          ctx.strokeStyle = 'rgba(100, 180, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        if (e.inRoute) {
          const angle = Math.atan2(b.y - a.y, b.x - a.x);
          const arrowLen = 12;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          ctx.beginPath();
          ctx.moveTo(mx + arrowLen * Math.cos(angle), my + arrowLen * Math.sin(angle));
          ctx.lineTo(mx - arrowLen * Math.cos(angle - Math.PI / 6), my - arrowLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(mx - arrowLen * Math.cos(angle + Math.PI / 6), my - arrowLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fillStyle = 'rgba(57, 255, 20, 0.6)';
          ctx.fill();
        }
      });

      // Draw nodes
      nodes.forEach(n => {
        const isInRoute = data!.route.includes(n.name);
        const nodeRadius = isInRoute ? 32 : 26;

        // Glow
        if (isInRoute) {
          const glow = 0.15 + 0.1 * Math.sin(tick * 0.04);
          ctx.beginPath();
          ctx.arc(n.x, n.y, nodeRadius + 12, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(57, 255, 20, ${glow})`;
          ctx.fill();
        }

        // Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isInRoute ? 'rgba(57, 255, 20, 0.15)' : 'rgba(15, 25, 55, 0.8)';
        ctx.fill();
        ctx.strokeStyle = isInRoute ? '#39ff14' : n.color + '60';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = `700 ${isInRoute ? 13 : 11}px "JetBrains Mono", monospace`;
        ctx.fillStyle = isInRoute ? '#39ff14' : n.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.name, n.x, n.y);
      });

      // Title overlay
      ctx.font = '600 13px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(122, 139, 168, 0.6)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('CURRENCY EXCHANGE NETWORK', 16, 16);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [data]);

  return (
    <>
      <div className="page-header fade-in">
        <h1 className="page-title">Graph Visualizer</h1>
      </div>

      <div className="graph-canvas-wrap glass fade-in fade-in-delay-1">
        <canvas ref={canvasRef} className="graph-canvas" />
      </div>

      <div className="glass fade-in fade-in-delay-2" style={{ padding: 20 }}>
        <div className="graph-legend">
          {data?.currencies.map(c => (
            <div key={c} className="legend-item">
              <div className="legend-dot" style={{ background: COLORS[c] || '#fff' }} />
              <span style={{ fontWeight: data.route.includes(c) ? 700 : 400, color: data.route.includes(c) ? '#39ff14' : undefined }}>
                {c} {data.route.includes(c) ? '(in route)' : ''}
              </span>
            </div>
          ))}
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#39ff14' }} />
            <span style={{ color: '#39ff14', fontWeight: 700 }}>Arbitrage Path</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }} className="fade-in fade-in-delay-3">
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>📐 Graph Properties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a8ba8', fontSize: '0.88rem' }}>Vertices (Currencies)</span>
              <span className="mono" style={{ fontWeight: 600 }}>{data?.currencies.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a8ba8', fontSize: '0.88rem' }}>Edges (Exchange Pairs)</span>
              <span className="mono" style={{ fontWeight: 600 }}>{data?.rates_matrix.flat().filter(r => r > 0).length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a8ba8', fontSize: '0.88rem' }}>Graph Type</span>
              <span className="mono" style={{ fontWeight: 600 }}>Directed Weighted</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a8ba8', fontSize: '0.88rem' }}>Edge Weights</span>
              <span className="mono" style={{ fontWeight: 600 }}>-log(rate)</span>
            </div>
          </div>
        </div>
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>🔄 Detected Cycle</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a8ba8', fontSize: '0.88rem' }}>Cycle Length</span>
              <span className="mono" style={{ fontWeight: 600, color: '#00d4ff' }}>{data?.route.length || 0} nodes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a8ba8', fontSize: '0.88rem' }}>Negative Weight Sum</span>
              <span className="mono" style={{ fontWeight: 600, color: '#39ff14' }}>Yes (profitable)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a8ba8', fontSize: '0.88rem' }}>Profit Factor</span>
              <span className="mono" style={{ fontWeight: 600, color: '#39ff14' }}>{(1 + (data?.profit_margin || 0) / 100).toFixed(6)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7a8ba8', fontSize: '0.88rem' }}>Algorithm</span>
              <span className="mono" style={{ fontWeight: 600 }}>Bellman-Ford</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
