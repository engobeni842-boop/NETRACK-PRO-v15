import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    const { error } = await updatePassword(password);
    if (error) setError(error.message);
    else setDone(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 40, maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>New Password</div>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {!done ? (
          <form onSubmit={handleSubmit}>
            <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              style={{ width: '100%', padding: 12, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              style={{ width: '100%', padding: 12, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: loading ? '#334155' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Password updated!</div>
            <button onClick={() => navigate('/login')} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Go to Login</button>
          </div>
        )}
      </div>
    </div>
  );
}
