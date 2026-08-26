import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (!error) setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 40, maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Reset Password</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>We'll send you a reset link</div>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: 12, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: loading ? '#334155' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📧</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Check your inbox!</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>Click the link to reset your password.</div>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#64748b' }}>
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Back to login</Link>
        </div>
      </div>
    </div>
  );
}
