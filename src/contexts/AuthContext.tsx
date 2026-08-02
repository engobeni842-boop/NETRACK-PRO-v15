import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: 'free' | 'premium' | 'owner';
  signals_viewed_today: number;
  signals_limit: number;
  is_owner: boolean;
  last_signal_reset: string;
  created_at: string;
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  isOwner: boolean;
  isPremium: boolean;
  canViewSignal: () => boolean;
  viewCount: number;
  viewLimit: number;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      const lastReset = new Date(data.last_signal_reset);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastReset < today) {
        const { data: updated } = await supabase
          .from('profiles')
          .update({ signals_viewed_today: 0, last_signal_reset: new Date().toISOString().split('T')[0] })
          .eq('id', userId)
          .select()
          .single();
        setProfile(updated || data);
      } else {
        setProfile(data);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' }
    });
    return { error };
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id);
  };

  const isOwner = profile?.is_owner ?? false;
  const isPremium = profile?.subscription_tier === 'premium';
  const viewCount = profile?.signals_viewed_today ?? 0;
  const viewLimit = profile?.subscription_tier === 'premium' ? 4 : (profile?.signals_limit ?? 2);

  const canViewSignal = () => {
    if (!profile) return false;
    return viewCount < viewLimit;
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signInWithMagicLink, signInWithPassword, signUp, signOut,
      resetPassword, updatePassword,
      isOwner, isPremium, canViewSignal, viewCount, viewLimit,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
