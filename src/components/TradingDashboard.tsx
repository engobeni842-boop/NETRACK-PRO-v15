import React, { useState, useCallback, useMemo } from 'react';
import PlatformChart from './PlatformChart';
import SignalEngine from './SignalEngine';
import { useMarketData, PAIR_CONFIGS, PLATFORM_SPREADS } from '../hooks/useMarketData';
import { SignalResult } from './SignalEngine';
import { 
  Monitor, TrendingUp, BarChart3, Clock, Globe, 
  ChevronDown, Activity, Shield, Wallet, Bell,
  Settings, Maximize2, Minimize2, AlertTriangle
} from 'lucide-react';

const PLATFORMS = [
  { id: 'Deriv', name: 'Deriv', color: 'bg-orange-600' },
  { id: 'MT4', name: 'MT4', color: 'bg-blue-600' },
  { id: 'MT5', name: 'MT5', color: 'bg-indigo-600' },
  { id: 'XM', name: 'XM', color: 'bg-green-600' },
  { id: 'IQ Option', name: 'IQ Option', color: 'bg-cyan-600' },
  { id: 'Binance', name: 'Binance', color: 'bg-yellow-600' },
  { id: 'eToro', name: 'eToro', color: 'bg-teal-600' },
  { id: 'Pocket', name: 'Pocket', color: 'bg-pink-600' },
];

const PAIRS = [
  { symbol: 'EUR/USD', type: 'Forex', price: 1.0840 },
  { symbol: 'GBP/USD', type: 'Forex', price: 1.2650 },
  { symbol: 'USD/JPY', type: 'Forex', price: 151.40 },
  { symbol: 'XAU/USD', type: 'Gold', price: 2315.50 },
  { symbol: 'BTC/USD', type: 'Crypto', price: 65400 },
  { symbol: 'ETH/USD', type: 'Crypto', price: 3480 },
];

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];

// Separate component for watchlist items to use hooks properly
const WatchlistItem: React.FC<{
  pair: typeof PAIRS[0];
  selectedPair: string;
  selectedPlatform: string;
  onSelect: (symbol: string) => void;
}> = ({ pair, selectedPair, selectedPlatform, onSelect }) => {
  const { currentPrice, data } = useMarketData(pair.symbol, '1m', selectedPlatform);

  const change = useMemo(() => {
    if (data.length < 2) return 0;
    return ((currentPrice - data[0].open) / data[0].open) * 100;
  }, [currentPrice, data]);

  const isSelected = selectedPair === pair.symbol;

  return (
    <button
      onClick={() => onSelect(pair.symbol)}
      className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 ${
        isSelected ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="text-left">
        <div className="text-sm font-medium text-white">{pair.symbol}</div>
        <div className="text-xs text-gray-500">{pair.type}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono text-white">
          {currentPrice.toFixed(pair.symbol.includes('JPY') ? 3 : 5)}
        </div>
        <div className={`text-xs font-mono ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </div>
      </div>
    </button>
  );
};

const TradingDashboard: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('MT4');
  const [selectedPair, setSelectedPair] = useState('GBP/USD');
  const [selectedTF, setSelectedTF] = useState('5m');
  const [balance, setBalance] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [signal, setSignal] = useState<SignalResult | null>(null);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [showPairDropdown, setShowPairDropdown] = useState(false);

  const { data, currentPrice, spread, isLoading } = useMarketData(selectedPair, selectedTF, selectedPlatform);

  const handleSignalGenerated = useCallback((s: SignalResult) => {
    setSignal(s);
  }, []);

  const currentPair = PAIRS.find(p => p.symbol === selectedPair) || PAIRS[0];
  const priceChange = data.length > 1 ? currentPrice - data[data.length - 2].close : 0;
  const priceChangePct = data.length > 1 ? (priceChange / data[data.length - 2].close) * 100 : 0;

  // Market session detection
  const now = new Date();
  const hour = now.getUTCHours();
  let session = 'Closed';
  let sessionColor = 'text-gray-500';
  if (hour >= 8 && hour < 17) { session = 'London'; sessionColor = 'text-blue-400'; }
  else if (hour >= 13 && hour < 22) { session = 'London + NY'; sessionColor = 'text-green-400'; }
  else if (hour >= 22 || hour < 5) { session = 'Asian'; sessionColor = 'text-purple-400'; }
  else if (hour >= 5 && hour < 8) { session = 'Pre-London'; sessionColor = 'text-yellow-400'; }
  else { session = 'NY'; sessionColor = 'text-orange-400'; }

  // Volatility calculation
  const recentCandles = data.slice(-20);
  const avgRange = recentCandles.length > 0 
    ? recentCandles.reduce((sum, c) => sum + (c.high - c.low), 0) / recentCandles.length 
    : 0;
  const volatility = avgRange > currentPrice * 0.0015 ? 'High' : avgRange > currentPrice * 0.0008 ? 'Moderate' : 'Low';
  const volatilityColor = volatility === 'High' ? 'text-red-400' : volatility === 'Moderate' ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-200">
      {/* Top Bar */}
      <header className="border-b border-gray-800 bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-wide">NETRACK PRO</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-800">
              <Wallet className="w-4 h-4 text-gray-400" />
              <span className="text-white font-mono text-sm font-bold">${balance.toLocaleString()}</span>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-gray-800 bg-[#0f172a] flex flex-col h-[calc(100vh-53px)]">
          {/* Platforms */}
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2 px-1">
              <Monitor className="w-3.5 h-3.5" /> Platforms
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedPlatform === p.id 
                      ? `${p.color} text-white shadow-lg` 
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 border-b border-gray-800">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Win Rate</span>
                <span className="text-green-400 text-xs font-mono font-bold">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Active Signals</span>
                <span className="text-blue-400 text-xs font-mono font-bold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Total P&L</span>
                <span className="text-gray-400 text-xs font-mono font-bold">$0.00</span>
              </div>
            </div>
          </div>

          {/* Risk Control */}
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-3 px-1">
              <Shield className="w-3.5 h-3.5" /> Risk Control
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Balance</span>
                  <span className="text-white font-mono">${balance}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Risk: {riskPercent}%</span>
                  <span className="text-red-400 font-mono">${(balance * riskPercent / 100).toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>
          </div>

          {/* Market Status */}
          <div className="p-3 mt-auto">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2 px-1">
              <Globe className="w-3.5 h-3.5" /> Market Status
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Session</span>
                <span className={sessionColor}>{session}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Volatility</span>
                <span className={volatilityColor}>{volatility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trend</span>
                <span className="text-gray-300">{signal?.direction || 'Mixed'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-1">
            {/* Chart + Signal Area */}
            <div className={`flex-1 flex flex-col ${chartExpanded ? 'w-full' : ''}`}>
              {/* Chart Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#0f172a]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => setShowPairDropdown(!showPairDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-700 text-sm text-white hover:bg-gray-800 transition-colors"
                    >
                      {selectedPair}
                      <span className="text-gray-500 text-xs">— {currentPair.type}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showPairDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showPairDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                        {PAIRS.map(p => (
                          <button
                            key={p.symbol}
                            onClick={() => { setSelectedPair(p.symbol); setShowPairDropdown(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {p.symbol} <span className="text-gray-500 text-xs">{p.type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 bg-gray-900 rounded-lg p-0.5 border border-gray-700">
                    {TIMEFRAMES.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTF(tf)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          selectedTF === tf 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-lg font-mono font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentPrice.toFixed(selectedPair.includes('JPY') ? 3 : 5)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ask: {(currentPrice + spread).toFixed(selectedPair.includes('JPY') ? 3 : 5)} • Spread: {spread.toFixed(selectedPair.includes('JPY') ? 2 : 1)} pts
                    </div>
                  </div>
                  <button 
                    onClick={() => setChartExpanded(!chartExpanded)}
                    className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500"
                  >
                    {chartExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className={`flex-1 min-h-[400px] ${chartExpanded ? 'h-[70vh]' : ''}`}>
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <PlatformChart 
                    data={data} 
                    symbol={selectedPair} 
                    timeframe={selectedTF}
                    platform={selectedPlatform}
                    signals={signal ? {
                      entry: signal.entryPrice,
                      stopLoss: signal.stopLoss,
                      takeProfit: signal.takeProfit,
                      direction: signal.direction
                    } : undefined}
                  />
                )}
              </div>

              {/* Signal Engine */}
              <div className="p-4 border-t border-gray-800">
                <SignalEngine
                  data={data}
                  symbol={selectedPair}
                  timeframe={selectedTF}
                  platform={selectedPlatform}
                  balance={balance}
                  riskPercent={riskPercent}
                  onSignalGenerated={handleSignalGenerated}
                />
              </div>
            </div>

            {/* Right Sidebar - Watchlist */}
            {!chartExpanded && (
              <aside className="w-72 border-l border-gray-800 bg-[#0f172a] flex flex-col">
                <div className="p-3 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                      <BarChart3 className="w-3.5 h-3.5" /> Watchlist
                    </div>
                    <span className="text-gray-600 text-xs">{selectedPlatform}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {PAIRS.map(pair => (
                    <WatchlistItem
                      key={pair.symbol}
                      pair={pair}
                      selectedPair={selectedPair}
                      selectedPlatform={selectedPlatform}
                      onSelect={setSelectedPair}
                    />
                  ))}
                </div>

                {/* Signal History */}
                <div className="p-3 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
                    <Clock className="w-3.5 h-3.5" /> Signal History
                  </div>
                  <div className="text-center py-4 text-gray-600 text-xs">
                    No signals yet. Generate your first signal.
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Risk Warning */}
          <div className="px-4 py-2 bg-yellow-500/5 border-t border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-yellow-500/80 text-xs leading-relaxed">
                <span className="font-semibold">Risk Warning:</span> Trading involves substantial risk of loss. 
                Past performance of signals does not guarantee future results. Always use stop losses and never 
                risk more than you can afford to lose. These signals are for educational purposes only. 
                NETRACK PRO is not financial advice.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TradingDashboard;