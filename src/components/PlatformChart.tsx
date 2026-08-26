import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IndicatorPoint {
  time: number;
  value: number;
}

interface ChartProps {
  data: Candle[];
  symbol: string;
  timeframe: string;
  platform: string;
  signals?: {
    entry?: number;
    stopLoss?: number;
    takeProfit?: number;
    direction?: 'BUY' | 'SELL' | 'NEUTRAL';
  };
}

const PlatformChart: React.FC<ChartProps> = ({ data, symbol, timeframe, platform, signals }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [hoverData, setHoverData] = useState<{ x: number; y: number; candle?: Candle } | null>(null);

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate EMA
  const calculateEMA = (data: Candle[], period: number, field: 'close' = 'close'): IndicatorPoint[] => {
    const k = 2 / (period + 1);
    const result: IndicatorPoint[] = [];
    let ema = data[0]?.[field] || 0;

    data.forEach((candle, i) => {
      if (i === 0) {
        ema = candle[field];
      } else {
        ema = candle[field] * k + ema * (1 - k);
      }
      result.push({ time: candle.time, value: ema });
    });
    return result;
  };

  // Calculate SMA
  const calculateSMA = (data: Candle[], period: number, field: 'close' = 'close'): IndicatorPoint[] => {
    const result: IndicatorPoint[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push({ time: data[i].time, value: data[i][field] });
        continue;
      }
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j][field];
      }
      result.push({ time: data[i].time, value: sum / period });
    }
    return result;
  };

  // Calculate Bollinger Bands
  const calculateBollinger = (data: Candle[], period: number = 20, mult: number = 2) => {
    const sma = calculateSMA(data, period);
    const upper: IndicatorPoint[] = [];
    const lower: IndicatorPoint[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push({ time: data[i].time, value: data[i].high });
        lower.push({ time: data[i].time, value: data[i].low });
        continue;
      }
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += Math.pow(data[i - j].close - sma[i].value, 2);
      }
      const std = Math.sqrt(sum / period);
      upper.push({ time: data[i].time, value: sma[i].value + mult * std });
      lower.push({ time: data[i].time, value: sma[i].value - mult * std });
    }
    return { sma, upper, lower };
  };

  // Calculate ATR
  const calculateATR = (data: Candle[], period: number = 14): IndicatorPoint[] => {
    const trs: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        trs.push(data[i].high - data[i].low);
      } else {
        const tr1 = data[i].high - data[i].low;
        const tr2 = Math.abs(data[i].high - data[i - 1].close);
        const tr3 = Math.abs(data[i].low - data[i - 1].close);
        trs.push(Math.max(tr1, tr2, tr3));
      }
    }

    const atr: IndicatorPoint[] = [];
    let atrVal = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        atr.push({ time: data[i].time, value: atrVal });
      } else {
        atrVal = (atrVal * (period - 1) + trs[i]) / period;
        atr.push({ time: data[i].time, value: atrVal });
      }
    }
    return atr;
  };

  const indicators = useMemo(() => {
    if (data.length < 50) return null;
    return {
      ema9: calculateEMA(data, 9),
      ema21: calculateEMA(data, 21),
      sma50: calculateSMA(data, 50),
      bb: calculateBollinger(data, 20, 2),
      atr: calculateATR(data, 14),
    };
  }, [data]);

  // Chart scaling
  const chartPadding = { top: 20, right: 70, bottom: 80, left: 10 };
  const chartWidth = dimensions.width - chartPadding.left - chartPadding.right;
  const chartHeight = dimensions.height - chartPadding.top - chartPadding.bottom;
  const volumeHeight = 60;
  const mainChartHeight = chartHeight - volumeHeight - 10;

  const priceRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 1 };
    let min = Infinity, max = -Infinity;
    data.forEach(d => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
    });
    // Include indicator lines in range
    if (indicators) {
      indicators.ema9.forEach(p => { if (p.value < min) min = p.value; if (p.value > max) max = p.value; });
      indicators.ema21.forEach(p => { if (p.value < min) min = p.value; if (p.value > max) max = p.value; });
      indicators.bb.upper.forEach(p => { if (p.value > max) max = p.value; });
      indicators.bb.lower.forEach(p => { if (p.value < min) min = p.value; });
    }
    // Include signal lines
    if (signals?.entry) { min = Math.min(min, signals.entry); max = Math.max(max, signals.entry); }
    if (signals?.stopLoss) { min = Math.min(min, signals.stopLoss); max = Math.max(max, signals.stopLoss); }
    if (signals?.takeProfit) { min = Math.min(min, signals.takeProfit); max = Math.max(max, signals.takeProfit); }

    const padding = (max - min) * 0.08;
    return { min: min - padding, max: max + padding };
  }, [data, indicators, signals]);

  const volumeRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 1 };
    const max = Math.max(...data.map(d => d.volume));
    return { min: 0, max: max * 1.2 };
  }, [data]);

  const timeRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 1 };
    return { min: data[0].time, max: data[data.length - 1].time };
  }, [data]);

  const scaleX = useCallback((time: number) => {
    return chartPadding.left + ((time - timeRange.min) / (timeRange.max - timeRange.min)) * chartWidth;
  }, [timeRange, chartWidth]);

  const scaleY = useCallback((price: number) => {
    return chartPadding.top + mainChartHeight - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * mainChartHeight;
  }, [priceRange, mainChartHeight]);

  const scaleVolumeY = useCallback((vol: number) => {
    const volY = chartPadding.top + mainChartHeight + 10 + volumeHeight - ((vol - volumeRange.min) / (volumeRange.max - volumeRange.min)) * volumeHeight;
    return volY;
  }, [volumeRange, volumeHeight, mainChartHeight]);

  const candleWidth = Math.max(1, (chartWidth / data.length) * 0.7);
  const candleSpacing = chartWidth / data.length;

  // Grid lines
  const priceGridLines = useMemo(() => {
    const lines = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const price = priceRange.min + (priceRange.max - priceRange.min) * (i / steps);
      const y = scaleY(price);
      lines.push({ price, y });
    }
    return lines;
  }, [priceRange, scaleY]);

  const timeGridLines = useMemo(() => {
    const lines = [];
    const steps = Math.min(data.length, 10);
    for (let i = 0; i < steps; i++) {
      const idx = Math.floor((data.length - 1) * (i / (steps - 1)));
      if (data[idx]) {
        lines.push({ time: data[idx].time, x: scaleX(data[idx].time), label: formatTime(data[idx].time, timeframe) });
      }
    }
    return lines;
  }, [data, scaleX, timeframe]);

  function formatTime(timestamp: number, tf: string): string {
    const d = new Date(timestamp);
    if (tf === '1D') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (tf === '1h' || tf === '4h') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function formatPrice(price: number): string {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 100) return price.toFixed(3);
    if (price >= 10) return price.toFixed(4);
    return price.toFixed(5);
  }

  // Path generators for lines
  const makePath = (points: IndicatorPoint[]) => {
    if (points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.time)} ${scaleY(p.value)}`).join(' ');
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest candle
    const chartX = x - chartPadding.left;
    const ratio = chartX / chartWidth;
    const idx = Math.min(Math.max(Math.floor(ratio * data.length), 0), data.length - 1);
    const candle = data[idx];

    setHoverData({ x, y, candle });
  };

  const handleMouseLeave = () => setHoverData(null);

  const lastCandle = data[data.length - 1];
  const priceChange = lastCandle ? lastCandle.close - lastCandle.open : 0;
  const priceChangePct = lastCandle ? (priceChange / lastCandle.open) * 100 : 0;

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-[#0a0e1a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">{symbol}</span>
          <span className="text-gray-400 text-xs">{platform}</span>
          <span className="text-gray-500 text-xs">{timeframe}</span>
        </div>
        <div className="flex items-center gap-4">
          {lastCandle && (
            <>
              <span className={`text-sm font-mono font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPrice(lastCandle.close)}
              </span>
              <span className={`text-xs font-mono ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(5)} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
              </span>
            </>
          )}
          <div className="flex gap-1 text-xs text-gray-400">
            <span>O</span><span className="text-white">{lastCandle ? formatPrice(lastCandle.open) : '--'}</span>
            <span className="ml-2">H</span><span className="text-white">{lastCandle ? formatPrice(lastCandle.high) : '--'}</span>
            <span className="ml-2">L</span><span className="text-white">{lastCandle ? formatPrice(lastCandle.low) : '--'}</span>
            <span className="ml-2">C</span><span className="text-white">{lastCandle ? formatPrice(lastCandle.close) : '--'}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid - Horizontal */}
          {priceGridLines.map((line, i) => (
            <g key={`h-${i}`}>
              <line
                x1={chartPadding.left}
                y1={line.y}
                x2={chartPadding.left + chartWidth}
                y2={line.y}
                stroke="#1e293b"
                strokeWidth={0.5}
                strokeDasharray="2,4"
              />
              <text
                x={chartPadding.left + chartWidth + 5}
                y={line.y + 4}
                fill="#64748b"
                fontSize={10}
                fontFamily="monospace"
              >
                {formatPrice(line.price)}
              </text>
            </g>
          ))}

          {/* Grid - Vertical */}
          {timeGridLines.map((line, i) => (
            <g key={`v-${i}`}>
              <line
                x1={line.x}
                y1={chartPadding.top}
                x2={line.x}
                y2={chartPadding.top + chartHeight}
                stroke="#1e293b"
                strokeWidth={0.5}
                strokeDasharray="2,4"
              />
              <text
                x={line.x}
                y={chartPadding.top + chartHeight + 15}
                fill="#64748b"
                fontSize={10}
                textAnchor="middle"
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* Bollinger Bands */}
          {indicators && (
            <g opacity={0.15}>
              <path d={makePath(indicators.bb.upper)} fill="none" stroke="#a855f7" strokeWidth={1} />
              <path d={makePath(indicators.bb.lower)} fill="none" stroke="#a855f7" strokeWidth={1} />
              <path
                d={`${makePath(indicators.bb.upper)} L ${indicators.bb.lower.slice().reverse().map(p => `${scaleX(p.time)} ${scaleY(p.value)}`).join(' L ')} Z`}
                fill="#a855f7"
                opacity={0.05}
              />
            </g>
          )}

          {/* EMA Lines */}
          {indicators && (
            <>
              <path d={makePath(indicators.ema9)} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.9} />
              <path d={makePath(indicators.ema21)} fill="none" stroke="#3b82f6" strokeWidth={1.5} opacity={0.9} />
              <path d={makePath(indicators.sma50)} fill="none" stroke="#ec4899" strokeWidth={1} opacity={0.7} strokeDasharray="4,4" />
            </>
          )}

          {/* Signal Lines */}
          {signals?.entry && (
            <g>
              <line
                x1={chartPadding.left}
                y1={scaleY(signals.entry)}
                x2={chartPadding.left + chartWidth}
                y2={scaleY(signals.entry)}
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="6,3"
              />
              <rect x={chartPadding.left + chartWidth - 50} y={scaleY(signals.entry) - 10} width={50} height={16} rx={3} fill="#3b82f6" />
              <text x={chartPadding.left + chartWidth - 25} y={scaleY(signals.entry) + 3} fill="white" fontSize={9} textAnchor="middle" fontWeight="bold">ENTRY</text>
            </g>
          )}
          {signals?.stopLoss && (
            <g>
              <line
                x1={chartPadding.left}
                y1={scaleY(signals.stopLoss)}
                x2={chartPadding.left + chartWidth}
                y2={scaleY(signals.stopLoss)}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="6,3"
              />
              <rect x={chartPadding.left + chartWidth - 30} y={scaleY(signals.stopLoss) - 10} width={30} height={16} rx={3} fill="#ef4444" />
              <text x={chartPadding.left + chartWidth - 15} y={scaleY(signals.stopLoss) + 3} fill="white" fontSize={9} textAnchor="middle" fontWeight="bold">SL</text>
            </g>
          )}
          {signals?.takeProfit && (
            <g>
              <line
                x1={chartPadding.left}
                y1={scaleY(signals.takeProfit)}
                x2={chartPadding.left + chartWidth}
                y2={scaleY(signals.takeProfit)}
                stroke="#22c55e"
                strokeWidth={1.5}
                strokeDasharray="6,3"
              />
              <rect x={chartPadding.left + chartWidth - 30} y={scaleY(signals.takeProfit) - 10} width={30} height={16} rx={3} fill="#22c55e" />
              <text x={chartPadding.left + chartWidth - 15} y={scaleY(signals.takeProfit) + 3} fill="white" fontSize={9} textAnchor="middle" fontWeight="bold">TP</text>
            </g>
          )}

          {/* Candles */}
          {data.map((candle, i) => {
            const x = scaleX(candle.time);
            const yOpen = scaleY(candle.open);
            const yClose = scaleY(candle.close);
            const yHigh = scaleY(candle.high);
            const yLow = scaleY(candle.low);
            const isBull = candle.close >= candle.open;
            const color = isBull ? '#22c55e' : '#ef4444';
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1);

            return (
              <g key={candle.time}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth={0.8}
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBull ? color : color}
                  rx={1}
                  opacity={0.9}
                />
              </g>
            );
          })}

          {/* Volume */}
          {data.map((candle, i) => {
            const x = scaleX(candle.time);
            const volY = scaleVolumeY(candle.volume);
            const baseY = chartPadding.top + mainChartHeight + 10 + volumeHeight;
            const isBull = candle.close >= candle.open;
            return (
              <rect
                key={`vol-${candle.time}`}
                x={x - candleWidth / 2}
                y={volY}
                width={candleWidth}
                height={baseY - volY}
                fill={isBull ? '#22c55e' : '#ef4444'}
                opacity={0.4}
                rx={1}
              />
            );
          })}

          {/* Volume separator */}
          <line
            x1={chartPadding.left}
            y1={chartPadding.top + mainChartHeight + 5}
            x2={chartPadding.left + chartWidth}
            y2={chartPadding.top + mainChartHeight + 5}
            stroke="#1e293b"
            strokeWidth={1}
          />
          <text x={chartPadding.left} y={chartPadding.top + mainChartHeight + 18} fill="#64748b" fontSize={9}>Volume</text>

          {/* Crosshair */}
          {hoverData && (
            <g>
              <line
                x1={hoverData.x}
                y1={chartPadding.top}
                x2={hoverData.x}
                y2={chartPadding.top + chartHeight}
                stroke="#94a3b8"
                strokeWidth={0.5}
                strokeDasharray="4,4"
                opacity={0.6}
              />
              <line
                x1={chartPadding.left}
                y1={hoverData.y}
                x2={chartPadding.left + chartWidth}
                y2={hoverData.y}
                stroke="#94a3b8"
                strokeWidth={0.5}
                strokeDasharray="4,4"
                opacity={0.6}
              />
              {hoverData.candle && (
                <g>
                  <rect x={hoverData.x + 10} y={hoverData.y - 60} width={140} height={75} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1} />
                  <text x={hoverData.x + 18} y={hoverData.y - 45} fill="#94a3b8" fontSize={10}>O: <tspan fill="white">{formatPrice(hoverData.candle.open)}</tspan></text>
                  <text x={hoverData.x + 18} y={hoverData.y - 32} fill="#94a3b8" fontSize={10}>H: <tspan fill="white">{formatPrice(hoverData.candle.high)}</tspan></text>
                  <text x={hoverData.x + 18} y={hoverData.y - 19} fill="#94a3b8" fontSize={10}>L: <tspan fill="white">{formatPrice(hoverData.candle.low)}</tspan></text>
                  <text x={hoverData.x + 18} y={hoverData.y - 6} fill="#94a3b8" fontSize={10}>C: <tspan fill="white">{formatPrice(hoverData.candle.close)}</tspan></text>
                  <text x={hoverData.x + 80} y={hoverData.y - 45} fill="#94a3b8" fontSize={10}>Vol: <tspan fill="white">{(hoverData.candle.volume / 1000).toFixed(1)}K</tspan></text>
                </g>
              )}
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute top-2 left-2 flex gap-3 text-xs">
          <span className="text-amber-500">● EMA(9)</span>
          <span className="text-blue-500">● EMA(21)</span>
          <span className="text-pink-500">● SMA(50)</span>
          <span className="text-purple-500">● BB(20,2)</span>
        </div>
      </div>
    </div>
  );
};

export default PlatformChart;
