import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await signUp(email, password, fullName);
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 40, maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Create Account</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Start trading with NETRACK signals</div>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required
              style={{ width: '100%', padding: 12, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: 12, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              style={{ width: '100%', padding: 12, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: loading ? '#334155' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Account created!</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>Check your email to confirm, then sign in.</div>
            <button onClick={() => navigate('/login')} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Go to Login</button>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
