import { useState, useEffect, useCallback, useRef } from 'react';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UseMarketDataReturn {
  data: Candle[];
  currentPrice: number;
  spread: number;
  isLoading: boolean;
  refresh: () => void;
}

// Realistic market parameters for different pairs
const PAIR_CONFIGS: Record<string, { basePrice: number; volatility: number; pipSize: number }> = {
  'EUR/USD': { basePrice: 1.0840, volatility: 0.0008, pipSize: 0.0001 },
  'GBP/USD': { basePrice: 1.2650, volatility: 0.0012, pipSize: 0.0001 },
  'USD/JPY': { basePrice: 151.40, volatility: 0.15, pipSize: 0.01 },
  'XAU/USD': { basePrice: 2315.50, volatility: 8.0, pipSize: 0.01 },
  'BTC/USD': { basePrice: 65400, volatility: 450, pipSize: 0.01 },
  'ETH/USD': { basePrice: 3480, volatility: 35, pipSize: 0.01 },
};

// Platform spreads (in pips)
const PLATFORM_SPREADS: Record<string, number> = {
  'MT4': 0.6,
  'MT5': 0.5,
  'XM': 0.8,
  'Binance': 0.1,
  'IQ Option': 1.2,
  'eToro': 1.5,
  'Pocket': 1.8,
  'Deriv': 0.4,
};

function generateRealisticCandles(
  symbol: string,
  timeframe: string,
  count: number = 150,
  platform: string = 'MT4'
): Candle[] {
  const config = PAIR_CONFIGS[symbol] || { basePrice: 1.0, volatility: 0.001, pipSize: 0.0001 };
  const spreadPips = PLATFORM_SPREADS[platform] || 1.0;
  const spread = spreadPips * config.pipSize;

  // Timeframe in minutes
  const tfMinutes: Record<string, number> = {
    '1m': 1, '5m': 5, '15m': 15, '1h': 60, '4h': 240, '1D': 1440
  };
  const minutes = tfMinutes[timeframe] || 15;

  const candles: Candle[] = [];
  let price = config.basePrice;

  // Generate with realistic market patterns
  let trend = 0;
  let trendStrength = 0;

  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * minutes * 60 * 1000;

    // Trend dynamics
    if (Math.random() < 0.05) {
      trend = (Math.random() - 0.5) * 2; // -1 to 1
      trendStrength = Math.random();
    }

    // Mean reversion component
    const deviation = price - config.basePrice;
    const meanReversion = -deviation * 0.001;

    // Random walk with trend and mean reversion
    const noise = (Math.random() - 0.5) * config.volatility;
    const trendMove = trend * trendStrength * config.volatility * 0.3;
    const change = noise + trendMove + meanReversion;

    const open = price;
    const close = price + change;

    // Realistic high/low based on volatility
    const intrabarVol = config.volatility * (0.3 + Math.random() * 0.7);
    const high = Math.max(open, close) + Math.random() * intrabarVol;
    const low = Math.min(open, close) - Math.random() * intrabarVol;

    // Volume with patterns
    const baseVolume = 1000 + Math.random() * 4000;
    const volumeSpike = Math.abs(change) > config.volatility * 1.5 ? 2.5 : 1.0;
    const volume = Math.round(baseVolume * volumeSpike * (0.8 + Math.random() * 0.4));

    candles.push({
      time,
      open: Number(open.toFixed(symbol.includes('JPY') ? 3 : 5)),
      high: Number(high.toFixed(symbol.includes('JPY') ? 3 : 5)),
      low: Number(low.toFixed(symbol.includes('JPY') ? 3 : 5)),
      close: Number(close.toFixed(symbol.includes('JPY') ? 3 : 5)),
      volume
    });

    price = close;
  }

  // Apply spread to last candle for realism
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close += spread / 2;
    last.high = Math.max(last.high, last.close);
  }

  return candles;
}

export function useMarketData(symbol: string, timeframe: string, platform: string): UseMarketDataReturn {
  const [data, setData] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [spread, setSpread] = useState(0.6);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    const newData = generateRealisticCandles(symbol, timeframe, 150, platform);
    setData(newData);
    if (newData.length > 0) {
      setCurrentPrice(newData[newData.length - 1].close);
      const config = PAIR_CONFIGS[symbol] || { pipSize: 0.0001 };
      setSpread((PLATFORM_SPREADS[platform] || 1.0) * config.pipSize);
    }
    setIsLoading(false);
  }, [symbol, timeframe, platform]);

  useEffect(() => {
    refresh();

    // Simulate live tick updates
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setData(prev => {
        if (prev.length === 0) return prev;
        const last = { ...prev[prev.length - 1] };
        const config = PAIR_CONFIGS[symbol] || { volatility: 0.001 };
        const tickSize = config.volatility * 0.05;
        const change = (Math.random() - 0.5) * tickSize;

        last.close += change;
        if (last.close > last.high) last.high = last.close;
        if (last.close < last.low) last.low = last.close;
        last.volume += Math.round(Math.random() * 50);

        setCurrentPrice(last.close);
        return [...prev.slice(0, -1), last];
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol, timeframe, platform, refresh]);

  return { data, currentPrice, spread, isLoading, refresh };
}

export { PAIR_CONFIGS, PLATFORM_SPREADS };
