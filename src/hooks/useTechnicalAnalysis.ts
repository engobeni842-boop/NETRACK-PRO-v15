/**
 * Professional Technical Analysis Engine
 * Multi-indicator signal generation with confluence scoring
 */

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface SignalResult {
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number; // 0-100
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  indicators: IndicatorScore[];
  reasoning: string[];
  timeframe: string;
  pair: string;
  platform: string;
  timestamp: number;
  expiry?: number; // For binary options
}

export interface IndicatorScore {
  name: string;
  score: number; // -10 to +10
  weight: number;
  detail: string;
}

// ==================== INDICATOR CALCULATIONS ====================

export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }

    const rs = avgGain / (avgLoss || 0.0001);
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
}

export function calculateMACD(
  closes: number[],
  fast: number = 12,
  slow: number = 26,
  signal: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const emaFast = calculateEMA(closes, fast);
  const emaSlow = calculateEMA(closes, slow);
  const macdLine = emaFast.slice(emaFast.length - emaSlow.length).map((v, i) => v - emaSlow[i]);
  const signalLine = calculateEMA(macdLine, signal);
  const histogram = macdLine.slice(macdLine.length - signalLine.length).map((v, i) => v - signalLine[i]);

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[]; bandwidth: number[]; percentB: number[] } {
  const sma = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];
  const percentB: number[] = [];

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const sd = Math.sqrt(variance);

    upper.push(mean + stdDev * sd);
    lower.push(mean - stdDev * sd);
    bandwidth.push((upper[upper.length - 1] - lower[lower.length - 1]) / mean);
    percentB.push((closes[i] - lower[lower.length - 1]) / (upper[upper.length - 1] - lower[lower.length - 1]));
  }

  return { upper, middle: sma, lower, bandwidth, percentB };
}

export function calculateATR(candles: Candle[], period: number = 14): number[] {
  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const highLow = candles[i].high - candles[i].low;
    const highClose = Math.abs(candles[i].high - candles[i - 1].close);
    const lowClose = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(highLow, highClose, lowClose));
  }

  return calculateSMA(tr, period);
}

export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number[]; d: number[] } {
  const kValues: number[] = [];

  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1);
    const highest = Math.max(...slice.map(c => c.high));
    const lowest = Math.min(...slice.map(c => c.low));
    const range = highest - lowest || 0.0001;
    kValues.push(((candles[i].close - lowest) / range) * 100);
  }

  const dValues = calculateSMA(kValues, dPeriod);

  return { k: kValues, d: dValues };
}

export function findSupportResistance(candles: Candle[], lookback: number = 20): {
  supports: number[];
  resistances: number[];
  nearestSupport: number;
  nearestResistance: number;
} {
  const lows = candles.slice(-lookback).map(c => c.low);
  const highs = candles.slice(-lookback).map(c => c.high);
  const currentPrice = candles[candles.length - 1].close;

  // Simple pivot detection
  const supports: number[] = [];
  const resistances: number[] = [];

  for (let i = 2; i < lookback - 2; i++) {
    if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
      supports.push(lows[i]);
    }
    if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
      resistances.push(highs[i]);
    }
  }

  supports.sort((a, b) => b - a); // Descending
  resistances.sort((a, b) => a - b); // Ascending

  return {
    supports,
    resistances,
    nearestSupport: supports.find(s => s < currentPrice) || currentPrice * 0.99,
    nearestResistance: resistances.find(r => r > currentPrice) || currentPrice * 1.01,
  };
}

// ==================== SIGNAL GENERATION ====================

export function generateSignal(
  candles: Candle[],
  pair: string,
  platform: string,
  timeframe: string,
  accountBalance: number = 1000
): SignalResult {
  const closes = candles.map(c => c.close);
  const currentPrice = closes[closes.length - 1];
  const prevPrice = closes[closes.length - 2];

  const indicators: IndicatorScore[] = [];
  const reasoning: string[] = [];

  // 1. RSI Analysis
  const rsi = calculateRSI(closes, 14);
  const currentRSI = rsi[rsi.length - 1];
  let rsiScore = 0;
  if (currentRSI < 30) {
    rsiScore = 7;
    reasoning.push(`RSI oversold (${currentRSI.toFixed(1)}) - Bullish`);
  } else if (currentRSI > 70) {
    rsiScore = -7;
    reasoning.push(`RSI overbought (${currentRSI.toFixed(1)}) - Bearish`);
  } else if (currentRSI > 50) {
    rsiScore = -2;
    reasoning.push(`RSI neutral-bullish (${currentRSI.toFixed(1)})`);
  } else {
    rsiScore = 2;
    reasoning.push(`RSI neutral-bearish (${currentRSI.toFixed(1)})`);
  }
  indicators.push({ name: 'RSI(14)', score: rsiScore, weight: 1.0, detail: `Value: ${currentRSI.toFixed(1)}` });

  // 2. MACD Analysis
  const macdData = calculateMACD(closes);
  const macdCurrent = macdData.macd[macdData.macd.length - 1];
  const macdPrev = macdData.macd[macdData.macd.length - 2];
  const signalCurrent = macdData.signal[macdData.signal.length - 1];
  const histCurrent = macdData.histogram[macdData.histogram.length - 1];
  const histPrev = macdData.histogram[macdData.histogram.length - 2];

  let macdScore = 0;
  if (macdCurrent > signalCurrent && histCurrent > histPrev && histCurrent > 0) {
    macdScore = 8;
    reasoning.push('MACD bullish crossover with increasing histogram');
  } else if (macdCurrent < signalCurrent && histCurrent < histPrev && histCurrent < 0) {
    macdScore = -8;
    reasoning.push('MACD bearish crossover with decreasing histogram');
  } else if (macdCurrent > signalCurrent) {
    macdScore = 3;
    reasoning.push('MACD above signal line');
  } else {
    macdScore = -3;
    reasoning.push('MACD below signal line');
  }
  indicators.push({ name: 'MACD', score: macdScore, weight: 1.2, detail: `Hist: ${histCurrent.toFixed(4)}` });

  // 3. EMA Crossover (9 & 21)
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const ema9Current = ema9[ema9.length - 1];
  const ema21Current = ema21[ema21.length - 1];
  const ema9Prev = ema9[ema9.length - 2];
  const ema21Prev = ema21[ema21.length - 2];

  let emaScore = 0;
  if (ema9Current > ema21Current && ema9Prev <= ema21Prev) {
    emaScore = 9;
    reasoning.push('EMA 9/21 golden cross detected');
  } else if (ema9Current < ema21Current && ema9Prev >= ema21Prev) {
    emaScore = -9;
    reasoning.push('EMA 9/21 death cross detected');
  } else if (ema9Current > ema21Current) {
    emaScore = 4;
    reasoning.push('Price above EMA 9/21 - Uptrend');
  } else {
    emaScore = -4;
    reasoning.push('Price below EMA 9/21 - Downtrend');
  }
  indicators.push({ name: 'EMA(9/21)', score: emaScore, weight: 1.3, detail: `9: ${ema9Current.toFixed(5)}, 21: ${ema21Current.toFixed(5)}` });

  // 4. Bollinger Bands
  const bb = calculateBollingerBands(closes);
  const bbCurrent = bb.percentB[bb.percentB.length - 1];
  const bbPrev = bb.percentB[bb.percentB.length - 2];

  let bbScore = 0;
  if (bbCurrent < 0.05 && bbCurrent > bbPrev) {
    bbScore = 6;
    reasoning.push('Price at lower Bollinger Band - Potential bounce');
  } else if (bbCurrent > 0.95 && bbCurrent < bbPrev) {
    bbScore = -6;
    reasoning.push('Price at upper Bollinger Band - Potential reversal');
  } else if (bbCurrent > 0.5) {
    bbScore = -1;
    reasoning.push('Price in upper half of Bollinger Bands');
  } else {
    bbScore = 1;
    reasoning.push('Price in lower half of Bollinger Bands');
  }
  indicators.push({ name: 'Bollinger', score: bbScore, weight: 0.9, detail: `%B: ${bbCurrent.toFixed(2)}` });

  // 5. Stochastic
  const stoch = calculateStochastic(candles);
  const stochK = stoch.k[stoch.k.length - 1];
  const stochD = stoch.d[stoch.d.length - 1];

  let stochScore = 0;
  if (stochK < 20 && stochK > stochD) {
    stochScore = 5;
    reasoning.push('Stochastic oversold with K crossing above D');
  } else if (stochK > 80 && stochK < stochD) {
    stochScore = -5;
    reasoning.push('Stochastic overbought with K crossing below D');
  }
  indicators.push({ name: 'Stoch(14)', score: stochScore, weight: 0.8, detail: `K: ${stochK.toFixed(1)}, D: ${stochD.toFixed(1)}` });

  // 6. Support/Resistance
  const sr = findSupportResistance(candles);
  const srDistanceUp = (sr.nearestResistance - currentPrice) / currentPrice * 100;
  const srDistanceDown = (currentPrice - sr.nearestSupport) / currentPrice * 100;

  let srScore = 0;
  if (srDistanceDown < 0.1) {
    srScore = 5;
    reasoning.push(`Price near support at ${sr.nearestSupport.toFixed(5)}`);
  } else if (srDistanceUp < 0.1) {
    srScore = -5;
    reasoning.push(`Price near resistance at ${sr.nearestResistance.toFixed(5)}`);
  }
  indicators.push({ name: 'S/R Levels', score: srScore, weight: 1.0, detail: `S: ${sr.nearestSupport.toFixed(5)}, R: ${sr.nearestResistance.toFixed(5)}` });

  // 7. Trend Strength (Price vs SMA50)
  const sma50 = calculateSMA(closes, 50);
  const sma50Current = sma50[sma50.length - 1];
  let trendScore = 0;
  if (currentPrice > sma50Current * 1.005) {
    trendScore = 3;
    reasoning.push('Price above SMA 50 - Bullish trend');
  } else if (currentPrice < sma50Current * 0.995) {
    trendScore = -3;
    reasoning.push('Price below SMA 50 - Bearish trend');
  }
  indicators.push({ name: 'SMA(50)', score: trendScore, weight: 0.8, detail: `SMA50: ${sma50Current.toFixed(5)}` });

  // Calculate weighted score
  let totalScore = 0;
  let totalWeight = 0;
  indicators.forEach(ind => {
    totalScore += ind.score * ind.weight;
    totalWeight += Math.abs(ind.weight);
  });

  const normalizedScore = totalScore / totalWeight;

  // Determine signal
  let direction: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
  let confidence = 0;

  if (normalizedScore > 3) {
    direction = 'BUY';
    confidence = Math.min(95, 50 + normalizedScore * 5);
  } else if (normalizedScore < -3) {
    direction = 'SELL';
    confidence = Math.min(95, 50 + Math.abs(normalizedScore) * 5);
  } else {
    confidence = Math.abs(normalizedScore) * 10;
  }

  // Calculate ATR for stop loss
  const atr = calculateATR(candles);
  const currentATR = atr[atr.length - 1] || currentPrice * 0.001;

  // Generate entry, SL, TP
  const spread = currentPrice * 0.0001; // Approximate
  let entry = currentPrice;
  let stopLoss: number;
  let takeProfit: number;
  let rr: number;

  if (direction === 'BUY') {
    entry = currentPrice + spread;
    stopLoss = Math.min(sr.nearestSupport, entry - currentATR * 1.5);
    takeProfit = Math.max(sr.nearestResistance, entry + currentATR * 3);
    rr = (takeProfit - entry) / (entry - stopLoss);
  } else if (direction === 'SELL') {
    entry = currentPrice - spread;
    stopLoss = Math.max(sr.nearestResistance, entry + currentATR * 1.5);
    takeProfit = Math.min(sr.nearestSupport, entry - currentATR * 3);
    rr = (entry - takeProfit) / (stopLoss - entry);
  } else {
    stopLoss = entry - currentATR;
    takeProfit = entry + currentATR;
    rr = 1;
  }

  // Ensure minimum RR
  if (rr < 1.5 && direction !== 'NEUTRAL') {
    if (direction === 'BUY') {
      takeProfit = entry + (entry - stopLoss) * 2;
    } else {
      takeProfit = entry - (stopLoss - entry) * 2;
    }
    rr = 2;
    reasoning.push('Adjusted TP for minimum 1:2 risk/reward');
  }

  // Position sizing
  const slPips = Math.abs(entry - stopLoss);
  const riskPercent = Math.min(2, 1 + confidence / 100); // 1-2% risk based on confidence

  return {
    direction,
    confidence: Math.round(confidence),
    entry,
    stopLoss,
    takeProfit,
    riskReward: parseFloat(rr.toFixed(2)),
    indicators,
    reasoning,
    timeframe,
    pair,
    platform,
    timestamp: Date.now(),
  };
}

// Generate realistic synthetic candle data for demo
export function generateCandles(
  pair: string,
  timeframe: string,
  count: number = 100,
  seedPrice?: number
): Candle[] {
  const pairConfig = [
    { symbol: 'EUR/USD', vol: 0.0008 },
    { symbol: 'GBP/USD', vol: 0.001 },
    { symbol: 'USD/JPY', vol: 0.1 },
    { symbol: 'XAU/USD', vol: 2.5 },
    { symbol: 'BTC/USD', vol: 150 },
    { symbol: 'ETH/USD', vol: 12 },
    { symbol: 'AVAX/USD', vol: 0.8 },
    { symbol: 'SOL/USD', vol: 3 },
  ].find(p => p.symbol === pair) || { vol: 0.001 };

  const candles: Candle[] = [];
  let price = seedPrice || 1.0845;

  // Timeframe multipliers
  const tfMultipliers: Record<string, number> = {
    '1m': 1, '5m': 2.2, '15m': 3.5, '1h': 6, '4h': 10, '1D': 20
  };
  const mult = tfMultipliers[timeframe] || 1;

  for (let i = 0; i < count; i++) {
    const volatility = pairConfig.vol * mult * (0.5 + Math.random());
    const trend = Math.sin(i * 0.1) * volatility * 2; // Add some trend structure

    const open = price;
    const change = (Math.random() - 0.48) * volatility + trend * 0.1;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(1000 + Math.random() * 5000);

    candles.push({
      open,
      high,
      low,
      close,
      volume,
      timestamp: Date.now() - (count - i) * 60000 * (timeframe === '1m' ? 1 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '1h' ? 60 : timeframe === '4h' ? 240 : 1440),
    });

    price = close;
  }

  return candles;
}

export function validateSignal(signal: SignalResult): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (signal.confidence < 60) {
    warnings.push('Low confidence signal - Consider waiting');
  }
  if (signal.riskReward < 1.5) {
    warnings.push('Poor risk/reward ratio - Signal rejected');
  }
  if (Math.abs(signal.entry - signal.stopLoss) / signal.entry < 0.0002) {
    warnings.push('Stop loss too tight - Will likely get stopped out');
  }

  return {
    valid: warnings.length === 0 || (signal.confidence >= 60 && signal.riskReward >= 1.5),
    warnings,
  };
}
