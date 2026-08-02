import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface Signal {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  sl: number;
  tp: number;
  rr: string;
  strength: string;
  rationale: string;
  timeframe: string;
  status: string;
  result?: string;
  pnl?: number;
  batch: string;
  signal_date: string;
  created_at: string;
}

export function useSignals() {
  const { user, profile, refreshProfile, canViewSignal } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    fetchSignals();

    channelRef.current = supabase
      .channel('signals-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'signals' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSignals(prev => [payload.new as Signal, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSignals(prev => prev.map(s => s.id === payload.new.id ? payload.new as Signal : s));
          } else if (payload.eventType === 'DELETE') {
            setSignals(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  const fetchSignals = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('signals')
      .select('*')
      .eq('signal_date', today)
      .order('created_at', { ascending: false });

    if (data) {
      setSignals(data);
      if (data.length > 0 && !selectedSignal) setSelectedSignal(data[0]);
    }
    setLoading(false);
  };

  const recordView = async (signalId: string): Promise<boolean> => {
    if (!user || !profile) return false;

    const { data: existing } = await supabase
      .from('signal_views')
      .select('*')
      .eq('user_id', profile.id)
      .eq('signal_id', signalId)
      .single();

    if (existing) return true;
    if (!canViewSignal()) return false;

    await supabase.from('signal_views').insert({ user_id: profile.id, signal_id: signalId });
    await supabase.from('profiles').update({ signals_viewed_today: profile.signals_viewed_today + 1 }).eq('id', profile.id);
    await refreshProfile();
    return true;
  };

  const selectSignal = async (signal: Signal) => {
    const allowed = await recordView(signal.id);
    if (allowed) { setSelectedSignal(signal); return true; }
    return false;
  };

  const createSignal = async (signal: Partial<Signal>) => {
    const { data, error } = await supabase.from('signals').insert({
      ...signal,
      rr: `1:${Math.abs((signal.tp! - signal.entry!) / (signal.entry! - signal.sl!)).toFixed(1)}`,
      signal_date: new Date().toISOString().split('T')[0]
    }).select().single();
    return { data, error };
  };

  // AUTO GENERATE SIGNALS (owner button)
  const generateSignals = async (batch: 'morning' | 'evening') => {
    const pairs = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD', 'LINK/USD', 'DOT/USD', 'MATIC/USD', 'UNI/USD'];
    const types: ('LONG' | 'SHORT')[] = ['LONG', 'SHORT'];
    const strengths = ['Weak', 'Medium', 'Strong'];
    const shuffled = [...pairs].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    const generated = selected.map(pair => {
      const basePrice: Record<string, number> = {
        'BTC/USD': 67000, 'ETH/USD': 3500, 'SOL/USD': 145, 'AVAX/USD': 28,
        'LINK/USD': 14.5, 'DOT/USD': 7.2, 'MATIC/USD': 0.65, 'UNI/USD': 9.8
      };
      const bp = basePrice[pair] || 100;
      const type = types[Math.floor(Math.random() * types.length)];
      const entry = bp + (Math.random() - 0.5) * bp * 0.02;
      const sl = type === 'LONG' ? entry * 0.97 : entry * 1.03;
      const tp = type === 'LONG' ? entry * 1.08 : entry * 0.92;
      const rationales = [
        'Bullish divergence on RSI with volume spike confirmation.',
        'Bearish engulfing pattern at key resistance. MACD crossover.',
        'Double bottom formation with increasing volume.',
        'Head and shoulders breakdown below 50 EMA.',
        'Ascending triangle breakout with strong accumulation.',
        'Rejected at Fibonacci 0.618 level. Divergence forming.'
      ];
      return {
        pair,
        type,
        entry: Math.round(entry * 100) / 100,
        sl: Math.round(sl * 100) / 100,
        tp: Math.round(tp * 100) / 100,
        rr: `1:${Math.abs((tp - entry) / (entry - sl)).toFixed(1)}`,
        strength: strengths[Math.floor(Math.random() * strengths.length)],
        rationale: rationales[Math.floor(Math.random() * rationales.length)],
        timeframe: '4H',
        status: 'active',
        batch,
        signal_date: new Date().toISOString().split('T')[0]
      };
    });

    const { error } = await supabase.from('signals').insert(generated);
    if (!error) await fetchSignals();
    return { error };
  };

  return { signals, selectedSignal, setSelectedSignal, loading, selectSignal, createSignal, generateSignals, fetchSignals, recordView };
}
