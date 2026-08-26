import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signInWithMagicLink, signInWithPassword } = useAuth();
  const [mode, setMode] = useState<'magic' | 'password'>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await signInWithMagicLink(email);
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await signInWithPassword(email, password);
    if (error) setError(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 40, maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 900, fontSize: 24, color: 'white' }}>N</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Welcome Back</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Sign in to access your signals</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button onClick={() => setMode('magic')} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', background: mode === 'magic' ? '#3b82f6' : '#1e293b', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Magic Link</button>
          <button onClick={() => setMode('password')} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', background: mode === 'password' ? '#3b82f6' : '#1e293b', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Password</button>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {!sent ? (
          <form onSubmit={mode === 'magic' ? handleMagicLink : handlePassword}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: 12, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            {mode === 'password' && (
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', padding: 12, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: loading ? '#334155' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Processing...' : mode === 'magic' ? 'Send Magic Link ✨' : 'Sign In'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📧</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Check your inbox!</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>Click the magic link to sign in.</div>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#64748b' }}>
          <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none' }}>Create account</Link> • 
          <Link to="/forgot-password" style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: 8 }}>Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
