/**
 * Live Price Simulation Hook
 * Simulates realistic price movements per platform with proper spreads
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PAIRS, PLATFORM_CONFIGS, getPlatformPrice } from '../lib/platformFormatters';

export interface LivePrice {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: number;
  direction: 'up' | 'down' | 'flat';
}

export function useLivePrices(platform: string, selectedPair: string) {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.deriv;

  const updatePrices = useCallback(() => {
    setPrices(prev => {
      const next: Record<string, LivePrice> = { ...prev };

      PAIRS.forEach(pair => {
        const prevPrice = next[pair.symbol];
        const basePrice = prevPrice ? prevPrice.bid : pair.basePrice;

        // Realistic volatility based on pair
        const volatility = pair.volatility / 100;
        const timeFactor = 0.05; // 5% of hourly vol per tick
        const drift = (Math.random() - 0.5) * 2 * volatility * timeFactor;

        const newBase = basePrice * (1 + drift);
        const { bid, ask, spread } = getPlatformPrice(newBase, platform, pair.symbol);

        const change = prevPrice ? newBase - prevPrice.bid : 0;
        const changePercent = prevPrice ? (change / prevPrice.bid) * 100 : 0;

        next[pair.symbol] = {
          symbol: pair.symbol,
          bid,
          ask,
          spread,
          change,
          changePercent,
          high24h: prevPrice ? Math.max(prevPrice.high24h, ask) : ask * 1.002,
          low24h: prevPrice ? Math.min(prevPrice.low24h, bid) : bid * 0.998,
          volume24h: (prevPrice?.volume24h || 0) + Math.random() * 1000,
          lastUpdate: Date.now(),
          direction: change > 0.000001 ? 'up' : change < -0.000001 ? 'down' : 'flat',
        };
      });

      return next;
    });
    setTick(t => t + 1);
  }, [platform]);

  useEffect(() => {
    // Initial population
    updatePrices();

    // Update frequency based on platform
    const interval = platform === 'binance' ? 500 : platform === 'deriv' ? 800 : 1000;
    intervalRef.current = setInterval(updatePrices, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [platform, updatePrices]);

  const currentPrice = prices[selectedPair];

  return { prices, currentPrice, tick };
}

export function usePriceHistory(pair: string, timeframe: string, platform: string) {
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial history
    const pairConfig = PAIRS.find(p => p.symbol === pair);
    if (!pairConfig) return;

    const points = 50;
    const hist: number[] = [];
    let price = pairConfig.basePrice;

    for (let i = 0; i < points; i++) {
      const vol = pairConfig.volatility / 100;
      price = price * (1 + (Math.random() - 0.5) * vol * 0.1);
      hist.push(price);
    }

    setHistory(hist);
  }, [pair, timeframe]);

  return history;
}
