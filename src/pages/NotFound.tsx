export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#1e293b' }}>404</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Page Not Found</div>
        <a href="#/dashboard" style={{ display: 'inline-block', marginTop: 20, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>Back to Dashboard</a>
      </div>
    </div>
  );
}
