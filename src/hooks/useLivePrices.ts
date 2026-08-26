/**
 * Live Price Hook
 * Real data for Crypto (Binance) and Forex (exchangerate.host).
 * Gold and Indices remain simulated — no free no-key real-time source exists for them.
 * Falls back to simulation automatically if a real fetch fails (e.g. offline, rate-limited).
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
  isSimulated?: boolean;
}

const BINANCE_SYMBOLS: Record<string, string> = {
  'BTC/USD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'AVAX/USD': 'AVAXUSDT',
  'SOL/USD': 'SOLUSDT',
};

const FOREX_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
const SIMULATED_ONLY_PAIRS = PAIRS
  .filter(p => p.group === 'Gold' || p.group === 'Indices')
  .map(p => p.symbol);

interface BinanceResult {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

async function fetchBinancePrices(): Promise<Record<string, BinanceResult>> {
  const symbols = Object.values(BINANCE_SYMBOLS);
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`
  );
  if (!res.ok) throw new Error('Binance fetch failed');
  const data = await res.json();

  const out: Record<string, BinanceResult> = {};
  for (const item of data) {
    const pairSymbol = Object.keys(BINANCE_SYMBOLS).find(
      key => BINANCE_SYMBOLS[key] === item.symbol
    );
    if (pairSymbol) {
      out[pairSymbol] = {
        price: parseFloat(item.lastPrice),
        change: parseFloat(item.priceChange),
        changePercent: parseFloat(item.priceChangePercent),
        high: parseFloat(item.highPrice),
        low: parseFloat(item.lowPrice),
        volume: parseFloat(item.volume),
      };
    }
  }
  return out;
}

async function fetchForexPrices(): Promise<Record<string, number>> {
  const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP,JPY');
  if (!res.ok) throw new Error('Forex fetch failed');
  const data = await res.json();
  const rates = data.rates;
  return {
    'EUR/USD': 1 / rates.EUR,
    'GBP/USD': 1 / rates.GBP,
    'USD/JPY': rates.JPY,
  };
}

export function useLivePrices(platform: string, selectedPair: string) {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [tick, setTick] = useState(0);
  const prevRawRef = useRef<Record<string, number>>({});

  const cryptoIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const forexIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const simIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const applyRealPrice = useCallback(
    (symbol: string, rawPrice: number, meta?: { high?: number; low?: number; volume?: number }) => {
      setPrices(prev => {
        const prevPrice = prev[symbol];
        const { bid, ask, spread } = getPlatformPrice(rawPrice, platform, symbol);
        const prevRaw = prevRawRef.current[symbol];
        const change = prevRaw ? rawPrice - prevRaw : 0;
        const changePercent = prevRaw ? (change / prevRaw) * 100 : 0;
        prevRawRef.current[symbol] = rawPrice;

        return {
          ...prev,
          [symbol]: {
            symbol,
            bid,
            ask,
            spread,
            change,
            changePercent,
            high24h: meta?.high ?? (prevPrice ? Math.max(prevPrice.high24h, ask) : ask * 1.002),
            low24h: meta?.low ?? (prevPrice ? Math.min(prevPrice.low24h, bid) : bid * 0.998),
            volume24h: meta?.volume ?? prevPrice?.volume24h ?? 0,
            lastUpdate: Date.now(),
            direction: change > 0.000001 ? 'up' : change < -0.000001 ? 'down' : 'flat',
            isSimulated: false,
          },
        };
      });
      setTick(t => t + 1);
    },
    [platform]
  );

  const simulateFallback = useCallback(
    (symbol: string) => {
      const pairConfig = PAIRS.find(p => p.symbol === symbol);
      if (!pairConfig) return;

      setPrices(prev => {
        const prevPrice = prev[symbol];
        const basePrice = prevPrice ? prevPrice.bid : pairConfig.basePrice;
        const volatility = pairConfig.volatility / 100;
        const drift = (Math.random() - 0.5) * 2 * volatility * 0.05;
        const newBase = basePrice * (1 + drift);
        const { bid, ask, spread } = getPlatformPrice(newBase, platform, symbol);
        const change = prevPrice ? newBase - prevPrice.bid : 0;
        const changePercent = prevPrice ? (change / prevPrice.bid) * 100 : 0;

        return {
          ...prev,
          [symbol]: {
            symbol,
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
            isSimulated: true,
          },
        };
      });
      setTick(t => t + 1);
    },
    [platform]
  );

  useEffect(() => {
    let cancelled = false;

    const pollCrypto = async () => {
      try {
        const results = await fetchBinancePrices();
        if (cancelled) return;
        Object.entries(results).forEach(([symbol, data]) => {
          applyRealPrice(symbol, data.price, { high: data.high, low: data.low, volume: data.volume });
        });
      } catch (err) {
        console.warn('Binance fetch failed, using simulated fallback for crypto pairs', err);
        Object.keys(BINANCE_SYMBOLS).forEach(simulateFallback);
      }
    };

    const pollForex = async () => {
      try {
        const results = await fetchForexPrices();
        if (cancelled) return;
        Object.entries(results).forEach(([symbol, price]) => {
          applyRealPrice(symbol, price);
        });
      } catch (err) {
        console.warn('Forex fetch failed, using simulated fallback for forex pairs', err);
        FOREX_PAIRS.forEach(simulateFallback);
      }
    };

    const pollSimulatedOnly = () => {
      SIMULATED_ONLY_PAIRS.forEach(simulateFallback);
    };

    // Initial population
    pollCrypto();
    pollForex();
    pollSimulatedOnly();

    // Binance has generous rate limits — safe to poll every 5s
    cryptoIntervalRef.current = setInterval(pollCrypto, 5000);
    // exchangerate.host free tier — poll less aggressively
    forexIntervalRef.current = setInterval(pollForex, 15000);
    // Gold/Indices simulation ticks faster since it's just local math
    simIntervalRef.current = setInterval(pollSimulatedOnly, 1000);

    return () => {
      cancelled = true;
      if (cryptoIntervalRef.current) clearInterval(cryptoIntervalRef.current);
      if (forexIntervalRef.current) clearInterval(forexIntervalRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [platform, applyRealPrice, simulateFallback]);

  const currentPrice = prices[selectedPair];

  return { prices, currentPrice, tick };
}

export function usePriceHistory(pair: string, timeframe: string, platform: string) {
  // Historical intraday candles require a paid data tier on every free API
  // checked — this stays simulated for now, seeded from the pair's real base price.
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
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