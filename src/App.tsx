import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import TradingDashboard from './components/TradingDashboard';
import './index.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full" />
          <span className="text-gray-400 text-sm">Loading NETRACK PRO...</span>
        </div>
      </div>
    );
  }

  // If you have auth pages, render them here based on user state
  // For now, we render the dashboard directly
  return <TradingDashboard />;
}

export default App;
