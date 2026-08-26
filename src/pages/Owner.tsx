import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSignals } from '../hooks/useSignals';

export default function Owner() {
  const { signals, createSignal, generateSignals, fetchSignals } = useSignals();
  const [users, setUsers] = useState<any[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [form, setForm] = useState({
    pair: '', type: 'LONG' as 'LONG' | 'SHORT', entry: '', sl: '', tp: '',
    strength: 'Medium', rationale: '', batch: 'morning' as 'morning' | 'evening'
  });

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => data && setUsers(data));
  }, []);

  const handleCreate = async () => {
    const { error } = await createSignal({
      pair: form.pair,
      type: form.type,
      entry: parseFloat(form.entry),
      sl: parseFloat(form.sl),
      tp: parseFloat(form.tp),
      strength: form.strength,
      rationale: form.rationale,
      batch: form.batch,
      timeframe: '4H',
      status: 'active'
    });
    if (!error) {
      alert('Signal published!');
      setForm({ pair: '', type: 'LONG', entry: '', sl: '', tp: '', strength: 'Medium', rationale: '', batch: 'morning' });
      fetchSignals();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleGenerate = async (batch: 'morning' | 'evening') => {
    setGenLoading(true);
    const { error } = await generateSignals(batch);
    setGenLoading(false);
    if (!error) {
      alert(`Generated 2 ${batch} signals!`);
    } else {
      alert('Error generating: ' + error.message);
    }
  };

  const activeCount = signals.filter(s => s.status === 'active').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>👑 Owner Portal</div>
          <a href="#/dashboard" style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', textDecoration: 'none', fontSize: 12 }}>Exit Portal</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📡 Create Signal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input placeholder="Pair (e.g. BTC/USD)" value={form.pair} onChange={e => setForm({...form, pair: e.target.value})} style={{ padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 12 }} />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} style={{ padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 12 }}><option>LONG</option><option>SHORT</option></select>
              <input type="number" placeholder="Entry" value={form.entry} onChange={e => setForm({...form, entry: e.target.value})} style={{ padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 12 }} />
              <input type="number" placeholder="Stop Loss" value={form.sl} onChange={e => setForm({...form, sl: e.target.value})} style={{ padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 12 }} />
              <input type="number" placeholder="Take Profit" value={form.tp} onChange={e => setForm({...form, tp: e.target.value})} style={{ padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 12 }} />
              <select value={form.batch} onChange={e => setForm({...form, batch: e.target.value as any})} style={{ padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 12 }}><option value="morning">Morning</option><option value="evening">Evening</option></select>
              <textarea placeholder="Rationale" value={form.rationale} onChange={e => setForm({...form, rationale: e.target.value})} style={{ padding: 8, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 12, minHeight: 50 }} />
              <button onClick={handleCreate} style={{ padding: 10, borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Publish Signal</button>
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🤖 Auto Generate</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Generate 2 random signals for a batch</div>
              <button onClick={() => handleGenerate('morning')} disabled={genLoading} style={{ padding: 12, borderRadius: 6, border: 'none', background: genLoading ? '#334155' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: 13, cursor: genLoading ? 'not-allowed' : 'pointer' }}>
                {genLoading ? 'Generating...' : '🌅 Generate Morning Batch'}
              </button>
              <button onClick={() => handleGenerate('evening')} disabled={genLoading} style={{ padding: 12, borderRadius: 6, border: 'none', background: genLoading ? '#334155' : 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: 'white', fontWeight: 700, fontSize: 13, cursor: genLoading ? 'not-allowed' : 'pointer' }}>
                {genLoading ? 'Generating...' : '🌙 Generate Evening Batch'}
              </button>
            </div>
            <div style={{ marginTop: 14, padding: 10, background: '#0a0e1a', borderRadius: 6, fontSize: 12, color: '#94a3b8' }}>
              4 signals/day • 2 morning, 2 evening<br />Free: 2 views • Premium: 4 views
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📊 Platform Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div style={{ background: '#0a0e1a', padding: 12, borderRadius: 6, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{users.length}</div><div style={{ fontSize: 11, color: '#64748b' }}>Users</div></div>
            <div style={{ background: '#0a0e1a', padding: 12, borderRadius: 6, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{activeCount}</div><div style={{ fontSize: 11, color: '#64748b' }}>Active</div></div>
            <div style={{ background: '#0a0e1a', padding: 12, borderRadius: 6, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{signals.length}</div><div style={{ fontSize: 11, color: '#64748b' }}>Total</div></div>
            <div style={{ background: '#0a0e1a', padding: 12, borderRadius: 6, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>{users.filter((u: any) => u.subscription_tier === 'premium').length}</div><div style={{ fontSize: 11, color: '#64748b' }}>Premium</div></div>
          </div>
        </div>

        <div style={{ marginTop: 14, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📋 All Signals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {signals.slice().reverse().map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 5, background: '#0a0e1a' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: s.type === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: s.type === 'LONG' ? '#22c55e' : '#ef4444' }}>{s.type}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{s.pair}</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>{s.batch}</span>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>${s.entry.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
