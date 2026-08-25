import React, { useMemo } from 'react';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Shield, Target, Crosshair } from 'lucide-react';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SignalResult {
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  recommendedLots: number;
  maxLots: number;
  riskAmount: number;
  indicators: {
    rsi: number;
    rsiSignal: string;
    macd: number;
    macdSignal: string;
    ema9: number;
    ema21: number;
    emaSignal: string;
    bollinger: string;
    stoch: number;
    stochSignal: string;
    sma50: number;
    smaSignal: string;
    srLevels: string;
  };
  reasoning: string[];
  warnings: string[];
}

interface Props {
  data: Candle[];
  symbol: string;
  timeframe: string;
  platform: string;
  balance: number;
  riskPercent: number;
  onSignalGenerated?: (signal: SignalResult) => void;
}

// Real technical indicator calculations
function calculateRSI(data: Candle[], period: number = 14): number {
  if (data.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = data[data.length - i].close - data[data.length - i - 1].close;
    if (change >= 0) gains += change;
    else losses -= change;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = values[0];
  values.forEach((v, i) => {
    if (i === 0) prev = v;
    else prev = v * k + prev * (1 - k);
    ema.push(prev);
  });
  return ema;
}

function calculateMACD(data: Candle[]): { macd: number; signal: number; histogram: number } {
  const closes = data.map(d => d.close);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const idx = closes.length - 1;
  return {
    macd: macdLine[idx],
    signal: signalLine[idx],
    histogram: macdLine[idx] - signalLine[idx]
  };
}

function calculateATR(data: Candle[], period: number = 14): number {
  if (data.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const tr1 = data[i].high - data[i].low;
    const tr2 = Math.abs(data[i].high - data[i - 1].close);
    const tr3 = Math.abs(data[i].low - data[i - 1].close);
    trs.push(Math.max(tr1, tr2, tr3));
  }
  if (trs.length < period) return trs.reduce((a, b) => a + b, 0) / trs.length;
  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }
  return atr;
}

function calculateBollinger(data: Candle[], period: number = 20, mult: number = 2) {
  const closes = data.map(d => d.close);
  const sma: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { sma.push(closes[i]); continue; }
    const slice = closes.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    sma.push(avg);
  }
  const std: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { std.push(0); continue; }
    const slice = closes.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / period;
    std.push(Math.sqrt(variance));
  }
  const idx = closes.length - 1;
  return {
    middle: sma[idx],
    upper: sma[idx] + mult * std[idx],
    lower: sma[idx] - mult * std[idx],
    bandwidth: ((sma[idx] + mult * std[idx]) - (sma[idx] - mult * std[idx])) / sma[idx]
  };
}

function calculateStochastic(data: Candle[], kPeriod: number = 14, dPeriod: number = 3): { k: number; d: number } {
  if (data.length < kPeriod) return { k: 50, d: 50 };
  const highs = data.slice(-kPeriod).map(d => d.high);
  const lows = data.slice(-kPeriod).map(d => d.low);
  const highest = Math.max(...highs);
  const lowest = Math.min(...lows);
  const currentClose = data[data.length - 1].close;
  const k = highest === lowest ? 50 : ((currentClose - lowest) / (highest - lowest)) * 100;
  // Simplified %D
  return { k, d: k };
}

function findSupportResistance(data: Candle[], lookback: number = 20): { supports: number[]; resistances: number[] } {
  const supports: number[] = [];
  const resistances: number[] = [];
  const recent = data.slice(-lookback);

  for (let i = 2; i < recent.length - 2; i++) {
    // Local low = support
    if (recent[i].low < recent[i-1].low && recent[i].low < recent[i-2].low && 
        recent[i].low < recent[i+1].low && recent[i].low < recent[i+2].low) {
      supports.push(recent[i].low);
    }
    // Local high = resistance
    if (recent[i].high > recent[i-1].high && recent[i].high > recent[i-2].high && 
        recent[i].high > recent[i+1].high && recent[i].high > recent[i+2].high) {
      resistances.push(recent[i].high);
    }
  }

  return { supports, resistances };
}

function generateSignal(data: Candle[], balance: number, riskPercent: number, symbol: string): SignalResult {
  if (data.length < 50) {
    return {
      direction: 'NEUTRAL',
      confidence: 0,
      entryPrice: data[data.length - 1]?.close || 0,
      stopLoss: 0,
      takeProfit: 0,
      riskReward: 0,
      recommendedLots: 0,
      maxLots: 0,
      riskAmount: 0,
      indicators: { rsi: 50, rsiSignal: 'neutral', macd: 0, macdSignal: 'neutral', ema9: 0, ema21: 0, emaSignal: 'neutral', bollinger: 'neutral', stoch: 50, stochSignal: 'neutral', sma50: 0, smaSignal: 'neutral', srLevels: 'neutral' },
      reasoning: ['Insufficient data for analysis'],
      warnings: ['Need at least 50 candles of data']
    };
  }

  const lastClose = data[data.length - 1].close;
  const atr = calculateATR(data, 14);
  const rsi = calculateRSI(data, 14);
  const macdData = calculateMACD(data);
  const bb = calculateBollinger(data, 20, 2);
  const stoch = calculateStochastic(data, 14, 3);
  const ema9 = calculateEMA(data.map(d => d.close), 9);
  const ema21 = calculateEMA(data.map(d => d.close), 21);
  const sma50 = calculateEMA(data.map(d => d.close), 50);
  const { supports, resistances } = findSupportResistance(data, 30);

  const currentEMA9 = ema9[ema9.length - 1];
  const currentEMA21 = ema21[ema21.length - 1];
  const currentSMA50 = sma50[sma50.length - 1];

  // Determine trend
  let bullishScore = 0;
  let bearishScore = 0;
  const reasoning: string[] = [];
  const warnings: string[] = [];

  // RSI Analysis
  let rsiSignal = 'neutral';
  if (rsi < 30) { bullishScore += 2; rsiSignal = 'oversold'; reasoning.push(`RSI oversold (${rsi.toFixed(1)}) - Bullish`); }
  else if (rsi > 70) { bearishScore += 2; rsiSignal = 'overbought'; reasoning.push(`RSI overbought (${rsi.toFixed(1)}) - Bearish`); }
  else if (rsi < 45) { bullishScore += 1; rsiSignal = 'neutral-bullish'; reasoning.push(`RSI neutral-bullish (${rsi.toFixed(1)})`); }
  else if (rsi > 55) { bearishScore += 1; rsiSignal = 'neutral-bearish'; reasoning.push(`RSI neutral-bearish (${rsi.toFixed(1)})`); }
  else { reasoning.push(`RSI neutral (${rsi.toFixed(1)})`); }

  // MACD Analysis
  let macdSignal = 'neutral';
  if (macdData.histogram > 0 && macdData.macd > macdData.signal) {
    bullishScore += 2;
    macdSignal = 'bullish crossover';
    reasoning.push('MACD bullish crossover with increasing histogram');
  } else if (macdData.histogram < 0 && macdData.macd < macdData.signal) {
    bearishScore += 2;
    macdSignal = 'bearish crossover';
    reasoning.push('MACD bearish crossover with decreasing histogram');
  } else if (macdData.histogram > 0) {
    bullishScore += 1;
    macdSignal = 'bullish';
    reasoning.push('MACD bullish histogram');
  } else {
    bearishScore += 1;
    macdSignal = 'bearish';
    reasoning.push('MACD bearish histogram');
  }

  // EMA Analysis
  let emaSignal = 'neutral';
  if (currentEMA9 > currentEMA21 && lastClose > currentEMA9) {
    bullishScore += 2;
    emaSignal = 'uptrend';
    reasoning.push('Price above EMA(9/21) - Uptrend');
  } else if (currentEMA9 < currentEMA21 && lastClose < currentEMA9) {
    bearishScore += 2;
    emaSignal = 'downtrend';
    reasoning.push('Price below EMA(9/21) - Downtrend');
  } else if (currentEMA9 > currentEMA21) {
    bullishScore += 1;
    emaSignal = 'weak uptrend';
    reasoning.push('EMA(9) above EMA(21) - Weak uptrend');
  } else {
    bearishScore += 1;
    emaSignal = 'weak downtrend';
    reasoning.push('EMA(9) below EMA(21) - Weak downtrend');
  }

  // SMA50 Analysis
  let smaSignal = 'neutral';
  if (lastClose > currentSMA50) {
    bullishScore += 1;
    smaSignal = 'bullish';
    reasoning.push('Price above SMA(50) - Bullish trend');
  } else {
    bearishScore += 1;
    smaSignal = 'bearish';
    reasoning.push('Price below SMA(50) - Bearish trend');
  }

  // Bollinger Analysis
  let bollingerSignal = 'neutral';
  const bbPosition = (lastClose - bb.lower) / (bb.upper - bb.lower);
  if (bbPosition < 0.1) {
    bullishScore += 1;
    bollingerSignal = 'oversold';
    reasoning.push('Price near lower Bollinger Band - Oversold');
  } else if (bbPosition > 0.9) {
    bearishScore += 1;
    bollingerSignal = 'overbought';
    reasoning.push('Price near upper Bollinger Band - Overbought');
  } else if (bbPosition < 0.4) {
    bullishScore += 0.5;
    bollingerSignal = 'lower half';
    reasoning.push('Price in lower half of Bollinger Bands');
  } else {
    bearishScore += 0.5;
    bollingerSignal = 'upper half';
    reasoning.push('Price in upper half of Bollinger Bands');
  }

  // Stochastic
  let stochSignal = 'neutral';
  if (stoch.k < 20) { bullishScore += 1; stochSignal = 'oversold'; reasoning.push('Stochastic oversold'); }
  else if (stoch.k > 80) { bearishScore += 1; stochSignal = 'overbought'; reasoning.push('Stochastic overbought'); }

  // Support/Resistance
  let srSignal = 'neutral';
  const nearestSupport = supports.length > 0 ? Math.max(...supports.filter(s => s < lastClose)) : null;
  const nearestResistance = resistances.length > 0 ? Math.min(...resistances.filter(r => r > lastClose)) : null;

  if (nearestSupport && Math.abs(lastClose - nearestSupport) / lastClose < 0.002) {
    bullishScore += 1;
    srSignal = 'at support';
    reasoning.push(`Price at support level (${nearestSupport.toFixed(5)})`);
  }
  if (nearestResistance && Math.abs(lastClose - nearestResistance) / lastClose < 0.002) {
    bearishScore += 1;
    srSignal = 'at resistance';
    reasoning.push(`Price at resistance level (${nearestResistance.toFixed(5)})`);
  }

  // Volume analysis
  const avgVolume = data.slice(-20).reduce((a, b) => a + b.volume, 0) / 20;
  const lastVolume = data[data.length - 1].volume;
  if (lastVolume > avgVolume * 1.5) {
    if (bullishScore > bearishScore) { bullishScore += 1; reasoning.push('High volume confirming bullish move'); }
    else if (bearishScore > bullishScore) { bearishScore += 1; reasoning.push('High volume confirming bearish move'); }
  }

  // Determine direction
  let direction: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
  let confidence = 0;

  if (bullishScore >= bearishScore + 3) {
    direction = 'BUY';
    confidence = Math.min(95, Math.round((bullishScore / (bullishScore + bearishScore)) * 100));
  } else if (bearishScore >= bullishScore + 3) {
    direction = 'SELL';
    confidence = Math.min(95, Math.round((bearishScore / (bullishScore + bearishScore)) * 100));
  } else {
    direction = 'NEUTRAL';
    confidence = Math.min(50, Math.round(Math.abs(bullishScore - bearishScore) * 10));
    warnings.push('Mixed signals - Consider waiting for clearer setup');
  }

  // Calculate levels
  const pipValue = symbol.includes('JPY') ? 0.01 : 0.0001;
  const pipMultiplier = symbol.includes('JPY') ? 100 : 10000;

  let entryPrice = lastClose;
  let stopLoss: number;
  let takeProfit: number;

  // Use ATR for SL/TP calculation (proper risk management)
  const atrMultiplierSL = 1.5;
  const atrMultiplierTP = direction === 'BUY' ? 3.0 : 3.0; // 1:2 risk/reward minimum

  if (direction === 'BUY') {
    stopLoss = Math.max(entryPrice - atr * atrMultiplierSL, nearestSupport || 0);
    if (entryPrice - stopLoss < atr * 0.5) stopLoss = entryPrice - atr * 1.2; // Minimum SL
    takeProfit = entryPrice + (entryPrice - stopLoss) * 2;
    // Check resistance for TP
    if (nearestResistance && nearestResistance > entryPrice && nearestResistance < takeProfit) {
      takeProfit = nearestResistance - (2 * pipValue);
      reasoning.push(`TP adjusted to near resistance at ${nearestResistance.toFixed(5)}`);
    }
  } else if (direction === 'SELL') {
    stopLoss = entryPrice + atr * atrMultiplierSL;
    if (stopLoss - entryPrice < atr * 0.5) stopLoss = entryPrice + atr * 1.2;
    takeProfit = entryPrice - (stopLoss - entryPrice) * 2;
    if (nearestSupport && nearestSupport < entryPrice && nearestSupport > takeProfit) {
      takeProfit = nearestSupport + (2 * pipValue);
      reasoning.push(`TP adjusted to near support at ${nearestSupport.toFixed(5)}`);
    }
  } else {
    stopLoss = entryPrice - atr * 1.5;
    takeProfit = entryPrice + atr * 1.5;
  }

  const riskDistance = Math.abs(entryPrice - stopLoss);
  const rewardDistance = Math.abs(takeProfit - entryPrice);
  const riskReward = riskDistance > 0 ? rewardDistance / riskDistance : 0;

  // Position sizing (real calculation)
  const riskAmount = balance * (riskPercent / 100);
  const stopDistancePips = riskDistance * pipMultiplier;

  // For forex: Lot size = Risk Amount / (Stop Distance in Pips * Pip Value per Lot)
  // Standard lot = 100,000 units, pip value ≈ $10 for most pairs (except JPY ≈ $8-9)
  const pipValuePerLot = symbol.includes('JPY') ? 8.5 : 10;
  let recommendedLots = 0;
  if (stopDistancePips > 0) {
    recommendedLots = riskAmount / (stopDistancePips * pipValuePerLot);
  }

  // Cap at reasonable levels
  const maxLots = Math.max(0.01, Math.floor((balance / 1000) * 10) / 10);
  recommendedLots = Math.min(recommendedLots, maxLots);
  recommendedLots = Math.floor(recommendedLots * 100) / 100; // Round to 2 decimals
  if (recommendedLots < 0.01) recommendedLots = 0.01;

  // Warnings
  if (confidence < 60) warnings.push('Low confidence signal - Consider waiting');
  if (riskReward < 1.5) warnings.push(`Poor risk/reward ratio (${riskReward.toFixed(1)}:1) - Minimum 1.5:1 recommended`);
  if (atr < pipValue * 5) warnings.push('Very low volatility - Wider stops may be hit by noise');
  if (bb.bandwidth < 0.001) warnings.push('Bollinger squeeze - Potential breakout incoming, wait for confirmation');
  if (recommendedLots > maxLots * 0.8) warnings.push('Position size near maximum - Consider reducing risk');

  return {
    direction,
    confidence,
    entryPrice,
    stopLoss,
    takeProfit,
    riskReward,
    recommendedLots,
    maxLots,
    riskAmount,
    indicators: {
      rsi,
      rsiSignal,
      macd: macdData.histogram,
      macdSignal,
      ema9: currentEMA9,
      ema21: currentEMA21,
      emaSignal,
      bollinger: bollingerSignal,
      stoch: stoch.k,
      stochSignal,
      sma50: currentSMA50,
      smaSignal,
      srLevels: srSignal
    },
    reasoning,
    warnings
  };
}

const SignalEngine: React.FC<Props> = ({ data, symbol, timeframe, platform, balance, riskPercent, onSignalGenerated }) => {
  const signal = useMemo(() => {
    return generateSignal(data, balance, riskPercent, symbol);
  }, [data, balance, riskPercent, symbol]);

  useMemo(() => {
    if (onSignalGenerated) onSignalGenerated(signal);
  }, [signal, onSignalGenerated]);

  const directionColors = {
    BUY: 'text-green-400 bg-green-400/10 border-green-400/30',
    SELL: 'text-red-400 bg-red-400/10 border-red-400/30',
    NEUTRAL: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
  };

  const directionIcons = {
    BUY: <TrendingUp className="w-5 h-5" />,
    SELL: <TrendingDown className="w-5 h-5" />,
    NEUTRAL: <Zap className="w-5 h-5" />
  };

  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-semibold">Signal Engine</h3>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all"
        >
          Generate Signal
        </button>
      </div>

      {/* Main Signal */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${directionColors[signal.direction]}`}>
        <div className="p-2 rounded-lg bg-white/5">
          {directionIcons[signal.direction]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{signal.direction}</span>
            <span className="text-sm text-gray-400">{symbol} • {timeframe} • {platform}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">Confidence:</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${signal.confidence >= 70 ? 'bg-green-500' : signal.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
            <span className="text-sm font-mono font-bold">{signal.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Key Levels */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
            <Crosshair className="w-3 h-3" /> Entry Price
          </div>
          <div className="text-white font-mono font-bold text-sm">{signal.entryPrice.toFixed(5)}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <div className="flex items-center gap-1.5 text-red-400 text-xs mb-1">
            <Shield className="w-3 h-3" /> Stop Loss
          </div>
          <div className="text-red-400 font-mono font-bold text-sm">{signal.stopLoss.toFixed(5)}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <div className="flex items-center gap-1.5 text-green-400 text-xs mb-1">
            <Target className="w-3 h-3" /> Take Profit
          </div>
          <div className="text-green-400 font-mono font-bold text-sm">{signal.takeProfit.toFixed(5)}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs mb-1">
            <TrendingUp className="w-3 h-3" /> R:R
          </div>
          <div className={`font-mono font-bold text-sm ${signal.riskReward >= 2 ? 'text-green-400' : signal.riskReward >= 1.5 ? 'text-yellow-400' : 'text-red-400'}`}>
            1:{signal.riskReward.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Position Size */}
      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs">Recommended Size</span>
          <span className="text-white font-mono font-bold">{signal.recommendedLots.toFixed(2)} lots</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Risk: <span className="text-red-400">${signal.riskAmount.toFixed(2)}</span></span>
          <span className="text-gray-500">Max: <span className="text-yellow-400">{signal.maxLots.toFixed(1)} lots</span></span>
        </div>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
          <span className="text-gray-400">RSI(14)</span>
          <span className={`font-mono font-bold ${signal.indicators.rsi < 30 ? 'text-green-400' : signal.indicators.rsi > 70 ? 'text-red-400' : 'text-gray-300'}`}>
            {signal.indicators.rsi.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
          <span className="text-gray-400">MACD</span>
          <span className={`font-mono font-bold ${signal.indicators.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {signal.indicators.macd > 0 ? '+' : ''}{signal.indicators.macd.toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
          <span className="text-gray-400">EMA(9/21)</span>
          <span className={`font-mono font-bold ${signal.indicators.ema9 > signal.indicators.ema21 ? 'text-green-400' : 'text-red-400'}`}>
            {signal.indicators.ema9 > signal.indicators.ema21 ? 'Bull' : 'Bear'}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
          <span className="text-gray-400">Bollinger</span>
          <span className="font-mono font-bold text-gray-300">{signal.indicators.bollinger}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
          <span className="text-gray-400">Stoch(14)</span>
          <span className={`font-mono font-bold ${signal.indicators.stoch < 20 ? 'text-green-400' : signal.indicators.stoch > 80 ? 'text-red-400' : 'text-gray-300'}`}>
            {signal.indicators.stoch.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
          <span className="text-gray-400">SMA(50)</span>
          <span className={`font-mono font-bold ${signal.indicators.sma50 < signal.entryPrice ? 'text-green-400' : 'text-red-400'}`}>
            {signal.indicators.sma50 < signal.entryPrice ? 'Support' : 'Resist'}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <div className="space-y-1">
        {signal.reasoning.map((reason, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span className="text-gray-300">{reason}</span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {signal.warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold mb-2">
            <AlertTriangle className="w-4 h-4" /> Warnings
          </div>
          {signal.warnings.map((warning, i) => (
            <div key={i} className="text-yellow-400/80 text-xs mb-1">• {warning}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SignalEngine;
export type { SignalResult, Candle };
