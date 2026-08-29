import { useState, useEffect, useRef, useCallback } from 'react';

export const PLATFORM_SPREADS: Record<string, number> = {
  Binance: 0.01,
  Deriv: 0.15,
  MT4: 0.25,
  MT5: 0.20,
  XM: 0.22,
  'IQ Option': 0.18,
  eToro: 0.35,
  Pocket: 0.20,
};

export const PAIR_CONFIGS: Record<string, Record<string, { symbol: string; category: string; basePrice: number; volatility: number }>> = {
  Binance: {
    'BTC/USD': { symbol: 'btcusdt', category: 'crypto', basePrice: 65400, volatility: 120 },
    'ETH/USD': { symbol: 'ethusdt', category: 'crypto', basePrice: 3480, volatility: 18 },
    'EUR/USD': { symbol: 'eurusdt', category: 'forex', basePrice: 1.0840, volatility: 0.0015 },
    'GBP/USD': { symbol: 'gbpusdt', category: 'forex', basePrice: 1.2650, volatility: 0.0020 },
    'USD/JPY': { symbol: 'usdjpy',   category: 'forex', basePrice: 151.40, volatility: 0.25 },
    'XAU/USD': { symbol: 'xauusdt',  category: 'commodity', basePrice: 2315.50, volatility: 3.5 },
  },
  Deriv: {
    'EUR/USD': { symbol: 'frxEURUSD', category: 'forex', basePrice: 1.0840, volatility: 0.0015 },
    'GBP/USD': { symbol: 'frxGBPUSD', category: 'forex', basePrice: 1.2650, volatility: 0.0020 },
    'USD/JPY': { symbol: 'frxUSDJPY', category: 'forex', basePrice: 151.40, volatility: 0.25 },
    'XAU/USD': { symbol: 'frxXAUUSD', category: 'commodity', basePrice: 2315.50, volatility: 3.5 },
    'BTC/USD': { symbol: 'cryBTCUSD', category: 'crypto', basePrice: 65400, volatility: 120 },
    'ETH/USD': { symbol: 'cryETHUSD', category: 'crypto', basePrice: 3480, volatility: 18 },
  },
  MT4: {
    'EUR/USD': { symbol: 'EURUSD', category: 'forex', basePrice: 1.0840, volatility: 0.0015 },
    'GBP/USD': { symbol: 'GBPUSD', category: 'forex', basePrice: 1.2650, volatility: 0.0020 },
    'USD/JPY': { symbol: 'USDJPY', category: 'forex', basePrice: 151.40, volatility: 0.25 },
    'XAU/USD': { symbol: 'XAUUSD', category: 'commodity', basePrice: 2315.50, volatility: 3.5 },
    'BTC/USD': { symbol: 'BTCUSD', category: 'crypto', basePrice: 65400, volatility: 110 },
    'ETH/USD': { symbol: 'ETHUSD', category: 'crypto', basePrice: 3480, volatility: 18 },
  },
  MT5: {
    'EUR/USD': { symbol: 'EURUSD', category: 'forex', basePrice: 1.0840, volatility: 0.0012 },
    'GBP/USD': { symbol: 'GBPUSD', category: 'forex', basePrice: 1.2650, volatility: 0.0018 },
    'USD/JPY': { symbol: 'USDJPY', category: 'forex', basePrice: 151.40, volatility: 0.20 },
    'XAU/USD': { symbol: 'XAUUSD', category: 'commodity', basePrice: 2315.50, volatility: 3.2 },
    'BTC/USD': { symbol: 'BTCUSD', category: 'crypto', basePrice: 65400, volatility: 110 },
    'ETH/USD': { symbol: 'ETHUSD', category: 'crypto', basePrice: 3480, volatility: 18 },
  },
  XM: {
    'EUR/USD': { symbol: 'EURUSD', category: 'forex', basePrice: 1.0841, volatility: 0.0016 },
    'GBP/USD': { symbol: 'GBPUSD', category: 'forex', basePrice: 1.2651, volatility: 0.0022 },
    'USD/JPY': { symbol: 'USDJPY', category: 'forex', basePrice: 151.41, volatility: 0.26 },
    'XAU/USD': { symbol: 'XAUUSD', category: 'commodity', basePrice: 2315.60, volatility: 3.4 },
    'BTC/USD': { symbol: 'BTCUSD', category: 'crypto', basePrice: 65410, volatility: 115 },
    'ETH/USD': { symbol: 'ETHUSD', category: 'crypto', basePrice: 3485, volatility: 19 },
  },
  'IQ Option': {
    'EUR/USD': { symbol: 'EURUSD', category: 'forex', basePrice: 1.0840, volatility: 0.0014 },
    'GBP/USD': { symbol: 'GBPUSD', category: 'forex', basePrice: 1.2650, volatility: 0.0020 },
    'USD/JPY': { symbol: 'USDJPY', category: 'forex', basePrice: 151.40, volatility: 0.24 },
    'XAU/USD': { symbol: 'XAUUSD', category: 'commodity', basePrice: 2315.50, volatility: 3.3 },
    'BTC/USD': { symbol: 'BTCUSD', category: 'crypto', basePrice: 65400, volatility: 112 },
    'ETH/USD': { symbol: 'ETHUSD', category: 'crypto', basePrice: 3480, volatility: 18 },
  },
  eToro: {
    'EUR/USD': { symbol: 'EURUSD', category: 'forex', basePrice: 1.0840, volatility: 0.0018 },
    'GBP/USD': { symbol: 'GBPUSD', category: 'forex', basePrice: 1.2650, volatility: 0.0024 },
    'USD/JPY': { symbol: 'USDJPY', category: 'forex', basePrice: 151.40, volatility: 0.28 },
    'XAU/USD': { symbol: 'XAUUSD', category: 'commodity', basePrice: 2315.50, volatility: 3.6 },
    'BTC/USD': { symbol: 'BTCUSD', category: 'crypto', basePrice: 65400, volatility: 125 },
    'ETH/USD': { symbol: 'ETHUSD', category: 'crypto', basePrice: 3480, volatility: 20 },
  },
  Pocket: {
    'EUR/USD': { symbol: 'EURUSD', category: 'forex', basePrice: 1.0840, volatility: 0.0015 },
    'GBP/USD': { symbol: 'GBPUSD', category: 'forex', basePrice: 1.2650, volatility: 0.0020 },
    'USD/JPY': { symbol: 'USDJPY', category: 'forex', basePrice: 151.40, volatility: 0.25 },
    'XAU/USD': { symbol: 'XAUUSD', category: 'commodity', basePrice: 2315.50, volatility: 3.5 },
    'BTC/USD': { symbol: 'BTCUSD', category: 'crypto', basePrice: 65400, volatility: 120 },
    'ETH/USD': { symbol: 'ETHUSD', category: 'crypto', basePrice: 3480, volatility: 18 },
  },
};

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Platform = 'Binance' | 'Deriv' | 'MT4' | 'MT5' | 'XM' | 'IQ Option' | 'eToro' | 'Pocket';

interface MarketDataState {
  data: Candle[];
  currentPrice: number;
  spread: number;
  isLoading: boolean;
  refresh: () => void;
}

function generateInitialCandles(basePrice: number, volatility: number, count: number = 100): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Date.now();

  for (let i = count; i > 0; i--) {
    const open = price;
    const change = (Math.random() - 0.5) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;
    const volume = Math.round(Math.random() * 1000 + 100);

    candles.push({
      time: now - i * 60000,
      open,
      high,
      low,
      close,
      volume,
    });
    price = close;
  }
  return candles;
}

function simulateNextTick(last: Candle, volatility: number, spread: number): Candle {
  const change = (Math.random() - 0.48) * volatility * 0.4;
  const close = last.close + change;
  const high = Math.max(last.close, close) + Math.random() * spread;
  const low = Math.min(last.close, close) - Math.random() * spread;
  const volume = Math.round(Math.random() * 50 + 10);

  return {
    time: Date.now(),
    open: last.close,
    high,
    low,
    close,
    volume,
  };
}

function createBinanceWebSocket(
  symbol: string,
  onTick: (price: number) => void,
  onCandle: (candle: Candle) => void
): WebSocket | null {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.k) {
      const k = msg.k;
      onTick(parseFloat(k.c));
      onCandle({
        time: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
      });
    }
  };

  ws.onerror = () => console.error('Binance WS error');
  return ws;
}

export function useMarketData(
  symbol: string,
  timeframe: string = '1m',
  platform: string = 'MT4',
  refreshTrigger: number = 0
): MarketDataState {
  const [data, setData] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const config = PAIR_CONFIGS[platform]?.[symbol];
  const spread = PLATFORM_SPREADS[platform] || 0.2;

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    cleanup();
    window.dispatchEvent(new CustomEvent('netrack-refresh', { detail: { symbol, platform } }));
  }, [cleanup, symbol, platform]);

  useEffect(() => {
    if (!config) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    cleanup();

    const initial = generateInitialCandles(config.basePrice, config.volatility);
    setData(initial);
    setCurrentPrice(initial[initial.length - 1].close);
    setIsLoading(false);

    if (platform === 'Binance') {
      wsRef.current = createBinanceWebSocket(
        config.symbol,
        (price) => setCurrentPrice(price),
        (candle) => {
          setData((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.time === candle.time) {
              return [...prev.slice(0, -1), candle];
            }
            return [...prev.slice(-199), candle];
          });
        }
      );
    } else {
      const tickInterval = platform === 'Deriv' || platform === 'MT4' || platform === 'MT5' ? 1000 : 2000;

      intervalRef.current = setInterval(() => {
        setData((prev) => {
          const last = prev[prev.length - 1];
          const next = simulateNextTick(last, config.volatility, spread);
          setCurrentPrice(next.close);
          return [...prev.slice(-199), next];
        });
      }, tickInterval);
    }

    return cleanup;
  }, [symbol, platform, refreshTrigger, cleanup, config, spread]);

  return { data, currentPrice, spread, isLoading, refresh };
}