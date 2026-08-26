import { useState } from 'react';
import SignalGenerator from './SignalGenerator';
import Comments from './Comments';
import { useSignals } from '../hooks/useSignals';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, TrendingUp, Clock, Target } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { signals } = useSignals(user?.email);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NETRACK PRO
            </h1>
            <p className="text-gray-400 text-sm mt-1">AI-Powered Trading Signals</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">LIVE SYNC</span>
          </div>
        </div>

        {/* Signal Generator */}
        <SignalGenerator />

        {/* Recent Signals + Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signal History */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center gap-2">
              <Clock size={18} className="text-blue-400" />
              <h3 className="font-bold">Signal History</h3>
            </div>
            <div className="divide-y divide-gray-700 max-h-[500px] overflow-y-auto">
              {signals.map(signal => (
                <div 
                  key={signal.id}
                  onClick={() => setSelectedSignalId(signal.id)}
                  className={`p-4 cursor-pointer transition hover:bg-gray-700/50 ${
                    selectedSignalId === signal.id ? 'bg-purple-500/10 border-l-2 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {signal.type}
                      </span>
                      <span className="font-semibold">{signal.pair}</span>
                    </div>
                    <span className="text-xs text-gray-500">{signal.timeframe}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Target size={12} /> {signal.confidence}%
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={12} /> TP: {signal.take_profit}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      SL: {signal.stop_loss}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${signal.bull_score}%` }} />
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${signal.bear_score}%` }} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <MessageSquare size={12} /> Click to view discussion
                  </div>
                </div>
              ))}
              
              {signals.length === 0 && (
                <p className="text-center text-gray-500 py-12">No signals generated yet.</p>
              )}
            </div>
          </div>

          {/* Comments Panel */}
          <div>
            {selectedSignalId ? (
              <Comments signalId={selectedSignalId} />
            ) : (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                <p>Select a signal from the history to view and join the discussion.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}