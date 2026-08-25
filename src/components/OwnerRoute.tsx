import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const OWNER_EMAIL = 'your-email@example.com'; // ← CHANGE THIS TO YOUR EMAIL

export default function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.email !== OWNER_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}