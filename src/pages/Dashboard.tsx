import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSignals } from '../hooks/useSignals';

export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut, isPremium, viewCount, viewLimit } = useAuth();
  const { signals, selectedSignal, selectSignal, loading } = useSignals();
  const [showCompare, setShowCompare] = useState(false);
  const [showGo, setShowGo] = useState(false);
  const [goStep, setGoStep] = useState(1);
  const [positionSize, setPositionSize] = useState(0.25);
  const logoTapCount = useRef(0);
  const lastLogoTap = useRef(0);

  const handleLogoTap = () => {
    const now = Date.now();
    if (now - lastLogoTap.current > 2000) logoTapCount.current = 0;
    logoTapCount.current++;
    lastLogoTap.current = now;
    if (logoTapCount.current >= 9) {
      logoTapCount.current = 0;
      navigate('/owner');
    }
  };

  const handleSignalClick = async (signal: any) => {
    const success = await selectSignal(signal);
    if (!success) alert('Daily limit reached! Upgrade to Premium for 4 signals/day.');
  };

  const openGo = () => setShowGo(true);
  const closeGo = () => { setShowGo(false); setGoStep(1); };

  const calculateRisk = () => {
    if (!selectedSignal) return { risk: 0, profit: 0 };
    const risk = Math.round(positionSize * Math.abs(selectedSignal.entry - selectedSignal.sl));
    const profit = Math.round(positionSize * Math.abs(selectedSignal.tp - selectedSignal.entry));
    return { risk, profit };
  };

  const { risk, profit } = calculateRisk();

  if (loading) return <div style={{ color: '#e2e8f0', textAlign: 'center', padding: 100, background: '#0a0e1a', minHeight: '100vh' }}>Loading signals...</div>;

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1e293b', background: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={handleLogoTap} style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: 'white', cursor: 'pointer', userSelect: 'none' }}>N</div>
          <div><div style={{ fontSize: 16, fontWeight: 700 }}>NETRACK</div><div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Signal Trading</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#22c55e' }}>
            <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>Live
          </div>
          <button onClick={() => setShowCompare(true)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📊 Compare</button>
          <span style={{ padding: '3px 8px', borderRadius: 4, background: '#1e293b', fontSize: 11, color: isPremium ? '#f59e0b' : '#94a3b8' }}>{isPremium ? '⭐ Premium' : 'Free'}</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>{viewCount}/{viewLimit} views</span>
          <button onClick={signOut} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 12, padding: 16, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Today's Signals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 12 }}>No signals yet today. Check back at 8AM or 6PM.</div>
              ) : (
                signals.map(s => (
                  <div key={s.id} onClick={() => handleSignalClick(s)} style={{
                    padding: 10, borderRadius: 6, cursor: 'pointer', borderLeft: `2px solid ${s.type === 'LONG' ? '#22c55e' : '#ef4444'}`,
                    background: selectedSignal?.id === s.id ? '#1e293b' : 'transparent'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{s.pair}</span>
                      <span style={{ fontSize: 10, color: '#64748b' }}>{s.time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: s.type === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: s.type === 'LONG' ? '#22c55e' : '#ef4444' }}>{s.type}</span>
                      <span style={{ fontSize: 10, color: '#3b82f6' }}>{s.batch}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 10, color: '#64748b' }}>
                      <span>Entry: ${s.entry.toLocaleString()}</span>
                      <span>TP: ${s.tp.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Performance</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Win Rate</span><span style={{ color: '#22c55e', fontWeight: 700 }}>78.4%</span></div>
              <div style={{ height: 3, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}><div style={{ width: '78%', height: '100%', background: '#22c55e' }}></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Profit Factor</span><span style={{ color: '#22c55e', fontWeight: 700 }}>2.34</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>P&L</span><span style={{ color: '#22c55e', fontWeight: 700 }}>+$12,847</span></div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedSignal ? (
            <>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedSignal.pair}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{selectedSignal.timeframe} • Strength: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{selectedSignal.strength}</span></div>
                  </div>
                  <button onClick={openGo} style={{ padding: '8px 20px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', fontWeight: 800, fontSize: 12, cursor: 'pointer', boxShadow: '0 3px 12px rgba(34,197,94,0.3)' }}>🚀 GO</button>
                </div>
                <div style={{ background: '#0a0e1a', borderRadius: 6, padding: 16, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>
                  [Chart Placeholder — Add TradingView or lightweight-charts here]
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 11, fontWeight: 600 }}>Entry: ${selectedSignal.entry.toLocaleString()}</span>
                  <span style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 11, fontWeight: 600 }}>SL: ${selectedSignal.sl.toLocaleString()}</span>
                  <span style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 11, fontWeight: 600 }}>TP: ${selectedSignal.tp.toLocaleString()}</span>
                  <span style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', fontSize: 11, fontWeight: 600 }}>{selectedSignal.rr} R:R</span>
                </div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Rationale</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: '#cbd5e1' }}>{selectedSignal.rationale}</div>
              </div>
            </>
          ) : (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 40, textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>No signal selected</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Click a signal from the left panel to view details</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Quick Order</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><label style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Size</label><input type="number" defaultValue="0.25" style={{ width: '100%', marginTop: 2, padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} /></div>
              <div><label style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Leverage</label><select style={{ width: '100%', marginTop: 2, padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }}><option>1x</option><option>5x</option><option>10x</option></select></div>
              <button style={{ width: '100%', padding: 10, borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Place Order</button>
            </div>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Watchlist</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {['BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD'].map(pair => (
                <div key={pair} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: 5, background: '#0a0e1a' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{pair}</span>
                  <span style={{ fontSize: 12, color: '#22c55e' }}>+2.4%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCompare && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, maxWidth: 1000, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 20, position: 'relative' }}>
            <button onClick={() => setShowCompare(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📊 Signal Comparison</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['Signal','Type','Entry','SL','TP','R:R','Str','Batch','Action'].map(h => (
                    <th key={h} style={{ textAlign: 'center', padding: 10, color: '#94a3b8', textTransform: 'uppercase', fontSize: 10 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {signals.filter(s => s.status === 'active').map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: 10 }}><div style={{ fontWeight: 700, fontSize: 12 }}>{s.pair}</div></td>
                      <td style={{ padding: 10, textAlign: 'center' }}><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: s.type === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: s.type === 'LONG' ? '#22c55e' : '#ef4444' }}>{s.type}</span></td>
                      <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>${s.entry.toLocaleString()}</td>
                      <td style={{ padding: 10, textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>${s.sl.toLocaleString()}</td>
                      <td style={{ padding: 10, textAlign: 'center', color: '#22c55e', fontWeight: 600 }}>${s.tp.toLocaleString()}</td>
                      <td style={{ padding: 10, textAlign: 'center', color: '#f59e0b', fontWeight: 700 }}>{s.rr}</td>
                      <td style={{ padding: 10, textAlign: 'center' }}><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: s.strength === 'Strong' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: s.strength === 'Strong' ? '#22c55e' : '#f59e0b' }}>{s.strength}</span></td>
                      <td style={{ padding: 10, textAlign: 'center', color: '#64748b' }}>{s.batch}</td>
                      <td style={{ padding: 10, textAlign: 'center' }}><button onClick={() => { setShowCompare(false); handleSignalClick(s); }} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: '#3b82f6', color: 'white', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showGo && selectedSignal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, maxWidth: 400, width: '100%', padding: 24 }}>
            {goStep === 1 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ width: 50, height: 50, background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 22 }}>🚀</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Ready to Execute?</div>
                </div>
                <div style={{ background: '#0a0e1a', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: '#64748b' }}>Pair</span><span style={{ fontWeight: 700 }}>{selectedSignal.pair}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: '#64748b' }}>Direction</span><span style={{ fontWeight: 700, color: selectedSignal.type === 'LONG' ? '#22c55e' : '#ef4444' }}>{selectedSignal.type}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: '#64748b' }}>Entry</span><span style={{ fontWeight: 700 }}>${selectedSignal.entry.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: '#64748b' }}>SL</span><span style={{ fontWeight: 700, color: '#ef4444' }}>${selectedSignal.sl.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>TP</span><span style={{ fontWeight: 700, color: '#22c55e' }}>${selectedSignal.tp.toLocaleString()}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={closeGo} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                  <button onClick={() => setGoStep(2)} style={{ flex: 1, padding: 10, borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Confirm →</button>
                </div>
              </>
            )}
            {goStep === 2 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Position Size</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Size (BTC)</label>
                  <input type="range" min="0.01" max="2" step="0.01" value={positionSize} onChange={e => setPositionSize(parseFloat(e.target.value))} style={{ width: '100%', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{positionSize} BTC</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>≈ ${Math.round(positionSize * selectedSignal.entry).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ background: '#0a0e1a', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: '#64748b' }}>Max Risk</span><span style={{ color: '#ef4444', fontWeight: 600 }}>${risk.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Potential Profit</span><span style={{ color: '#22c55e', fontWeight: 600 }}>${profit.toLocaleString()}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setGoStep(1)} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>← Back</button>
                  <button onClick={() => setGoStep(3)} style={{ flex: 1, padding: 10, borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Execute →</button>
                </div>
              </>
            )}
            {goStep === 3 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Trade Executed!</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Order #NT-{Math.floor(Math.random() * 9999)} filled at {new Date().toLocaleTimeString()}</div>
                <button onClick={closeGo} style={{ width: '100%', padding: 10, borderRadius: 6, border: 'none', background: '#1e293b', color: '#e2e8f0', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Back to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
