/**
 * Platform-Specific Price Formatters
 * Each platform has different tick sizes, decimal precision, and display rules
 */

export interface PlatformConfig {
  name: string;
  tickSize: number;
  decimals: number;
  spreadMultiplier: number;
  commission: number; // per lot
  minLot: number;
  maxLot: number;
  leverageCap: number;
  pipValue: number;
  displayFormat: 'standard' | 'fractional' | 'crypto';
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  deriv: {
    name: 'Deriv',
    tickSize: 0.00001,
    decimals: 5,
    spreadMultiplier: 1.2,
    commission: 0,
    minLot: 0.01,
    maxLot: 50,
    leverageCap: 1000,
    pipValue: 10,
    displayFormat: 'standard',
  },
  mt4: {
    name: 'MetaTrader 4',
    tickSize: 0.00001,
    decimals: 5,
    spreadMultiplier: 1.5,
    commission: 7, // per lot round turn
    minLot: 0.01,
    maxLot: 100,
    leverageCap: 500,
    pipValue: 10,
    displayFormat: 'standard',
  },
  mt5: {
    name: 'MetaTrader 5',
    tickSize: 0.00001,
    decimals: 5,
    spreadMultiplier: 1.4,
    commission: 6,
    minLot: 0.01,
    maxLot: 100,
    leverageCap: 500,
    pipValue: 10,
    displayFormat: 'standard',
  },
  xm: {
    name: 'XM',
    tickSize: 0.00001,
    decimals: 5,
    spreadMultiplier: 1.3,
    commission: 0,
    minLot: 0.01,
    maxLot: 50,
    leverageCap: 888,
    pipValue: 10,
    displayFormat: 'standard',
  },
  binance: {
    name: 'Binance',
    tickSize: 0.01,
    decimals: 2,
    spreadMultiplier: 1.0,
    commission: 0.04, // 0.04% taker
    minLot: 0.001,
    maxLot: 1000,
    leverageCap: 125,
    pipValue: 1,
    displayFormat: 'crypto',
  },
  iqoption: {
    name: 'IQ Option',
    tickSize: 0.00001,
    decimals: 5,
    spreadMultiplier: 1.8,
    commission: 0,
    minLot: 1,
    maxLot: 1000,
    leverageCap: 1000,
    pipValue: 1,
    displayFormat: 'standard',
  },
  etoro: {
    name: 'eToro',
    tickSize: 0.0001,
    decimals: 4,
    spreadMultiplier: 2.0,
    commission: 0,
    minLot: 0.01,
    maxLot: 100,
    leverageCap: 400,
    pipValue: 10,
    displayFormat: 'standard',
  },
  pocketoption: {
    name: 'Pocket Option',
    tickSize: 0.00001,
    decimals: 5,
    spreadMultiplier: 1.6,
    commission: 0,
    minLot: 1,
    maxLot: 1000,
    leverageCap: 1, // binary options
    pipValue: 1,
    displayFormat: 'standard',
  },
};

export interface PairConfig {
  symbol: string;
  group: 'Forex' | 'Crypto' | 'Gold' | 'Indices' | 'Synthetic';
  basePrice: number;
  volatility: number; // hourly volatility %
  spread: number; // base spread in price units
  pipSize: number;
  tickValue: number;
  tradingHours: string;
}

export const PAIRS: PairConfig[] = [
  { symbol: 'EUR/USD', group: 'Forex', basePrice: 1.0845, volatility: 0.08, spread: 0.00003, pipSize: 0.0001, tickValue: 10, tradingHours: '24H' },
  { symbol: 'GBP/USD', group: 'Forex', basePrice: 1.2670, volatility: 0.10, spread: 0.00004, pipSize: 0.0001, tickValue: 10, tradingHours: '24H' },
  { symbol: 'USD/JPY', group: 'Forex', basePrice: 151.42, volatility: 0.09, spread: 0.003, pipSize: 0.01, tickValue: 10, tradingHours: '24H' },
  { symbol: 'XAU/USD', group: 'Gold', basePrice: 2324.50, volatility: 0.45, spread: 0.15, pipSize: 0.01, tickValue: 1, tradingHours: '24H' },
  { symbol: 'BTC/USD', group: 'Crypto', basePrice: 67432.00, volatility: 2.5, spread: 12.0, pipSize: 0.01, tickValue: 1, tradingHours: '24H' },
  { symbol: 'ETH/USD', group: 'Crypto', basePrice: 3521.40, volatility: 3.2, spread: 0.85, pipSize: 0.01, tickValue: 1, tradingHours: '24H' },
  { symbol: 'AVAX/USD', group: 'Crypto', basePrice: 36.25, volatility: 4.5, spread: 0.04, pipSize: 0.01, tickValue: 1, tradingHours: '24H' },
  { symbol: 'SOL/USD', group: 'Crypto', basePrice: 148.30, volatility: 3.8, spread: 0.12, pipSize: 0.01, tickValue: 1, tradingHours: '24H' },
  { symbol: 'US30', group: 'Indices', basePrice: 38920.00, volatility: 0.35, spread: 2.0, pipSize: 1.0, tickValue: 1, tradingHours: 'Mon-Fri 9:30-16:00 EST' },
  { symbol: 'NAS100', group: 'Indices', basePrice: 16850.00, volatility: 0.42, spread: 1.5, pipSize: 0.1, tickValue: 1, tradingHours: 'Mon-Fri 9:30-16:00 EST' },
];

export function formatPrice(price: number, platform: string, pair: string): string {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.deriv;
  const pairConfig = PAIRS.find(p => p.symbol === pair) || PAIRS[0];

  let decimals = config.decimals;

  // Override decimals based on pair type and platform
  if (pairConfig.group === 'Crypto' && platform === 'binance') {
    if (price > 10000) decimals = 2;
    else if (price > 100) decimals = 3;
    else decimals = 4;
  } else if (pairConfig.group === 'Gold') {
    decimals = 2;
  } else if (pairConfig.symbol === 'USD/JPY') {
    decimals = 3;
  }

  return price.toFixed(decimals);
}

export function formatPipValue(pips: number, platform: string, pair: string): string {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.deriv;
  const pairConfig = PAIRS.find(p => p.symbol === pair) || PAIRS[0];

  if (pairConfig.group === 'Crypto') {
    return pips.toFixed(2) + ' USD';
  }
  return pips.toFixed(1) + ' pips';
}

export function calculateSpread(pair: string, platform: string): number {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.deriv;
  const pairConfig = PAIRS.find(p => p.symbol === pair) || PAIRS[0];
  return pairConfig.spread * config.spreadMultiplier;
}

export function getPlatformPrice(price: number, platform: string, pair: string): { bid: number; ask: number; spread: number } {
  const spread = calculateSpread(pair, platform);
  const halfSpread = spread / 2;
  return {
    bid: price - halfSpread,
    ask: price + halfSpread,
    spread,
  };
}

export function calculatePositionSize(
  accountBalance: number,
  riskPercent: number,
  stopLossPips: number,
  platform: string,
  pair: string
): { lots: number; riskAmount: number; maxLots: number } {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.deriv;
  const pairConfig = PAIRS.find(p => p.symbol === pair) || PAIRS[0];

  const riskAmount = accountBalance * (riskPercent / 100);
  const pipValue = pairConfig.tickValue;
  const riskPerLot = stopLossPips * pipValue;

  let lots = riskAmount / riskPerLot;
  lots = Math.max(config.minLot, Math.min(lots, config.maxLot));
  lots = Math.floor(lots / config.minLot) * config.minLot; // Round to min lot size

  return {
    lots,
    riskAmount,
    maxLots: config.maxLot,
  };
}

export function estimateProfit(
  entry: number,
  target: number,
  lots: number,
  platform: string,
  pair: string
): { grossProfit: number; commission: number; netProfit: number; rr: number } {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.deriv;
  const pairConfig = PAIRS.find(p => p.symbol === pair) || PAIRS[0];

  const priceDiff = Math.abs(target - entry);
  const pips = priceDiff / pairConfig.pipSize;
  const grossProfit = pips * pairConfig.tickValue * lots;
  const commission = config.commission * lots;
  const netProfit = grossProfit - commission;

  return {
    grossProfit,
    commission,
    netProfit,
    rr: 0, // Will be calculated with SL
  };
}
