import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

interface Signal {
  id: number;
  pair: string;
  type: 'buy' | 'sell';
  entry: string;
  tp: string;
  sl: string;
  rr: string;
  confidence: 'high' | 'medium';
  time: string;
}

interface ChatMessage {
  type: 'system' | 'user';
  text: string;
}

interface Report {
  text: string;
  color: string;
}

interface Candle {
  green: boolean;
  height: number;
}

interface WatchlistItem {
  pair: string;
  price: number;
  change: number;
}

const PAIRS: string[] = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD', 'XAU/USD', 'EUR/USD'];

const PLATFORMS: Record<string, string> = {
  exness: 'Exness Terminal',
  tradingview: 'TradingView Pro',
  metatrader: 'MetaTrader 5',
  cTrader: 'cTrader Web'
};

const WATCHLIST: WatchlistItem[] = [
  { pair: 'BTC/USD', price: 67245.30, change: 2.4 },
  { pair: 'ETH/USD', price: 3520.15, change: 1.8 },
  { pair: 'SOL/USD', price: 148.20, change: -0.5 },
  { pair: 'AVAX/USD', price: 28.45, change: 3.2 },
  { pair: 'XAU/USD', price: 2435.60, change: 0.4 },
  { pair: 'EUR/USD', price: 1.0845, change: -0.1 },
];

export default function Dashboard(): JSX.Element {
  const [activeSignals, setActiveSignals] = useState<Signal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [currentPair, setCurrentPair] = useState<string>('BTC/USD');
  const [currentPrice, setCurrentPrice] = useState<number>(67245.30);
  const [priceChange, setPriceChange] = useState<number>(2.4);
  const [platform, setPlatform] = useState<string>('exness');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { type: 'system', text: '📡 Connected to live chart feed. Switch platforms to sync chat.' }
  ]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [reports, setReports] = useState<Report[]>([
    { text: 'Signal delay on MetaTrader — investigating', color: 'var(--accent-yellow)' }
  ]);
  const [perf] = useState({ winRate: '78.4%', profitFactor: '2.34', pnl: '+$12,847' });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateCandles();
    const priceInterval = setInterval(() => {
      setCurrentPrice(p => p + (Math.random() - 0.5) * 0.05);
    }, 3000);
    const chatInterval = setInterval(() => {
      if (Math.random() > 0.7 && activeSignals.length > 0) {
        const msgs = [
          `📊 ${currentPair} volume spike detected`,
          `🔄 ${currentPair} approaching key resistance`,
          `💡 Market sentiment: ${Math.random() > 0.5 ? 'Greed' : 'Fear'} index rising`
        ];
        addChat('system', msgs[Math.floor(Math.random() * msgs.length)]);
      }
    }, 12000);
    return () => { clearInterval(priceInterval); clearInterval(chatInterval); };
  }, [activeSignals.length, currentPair]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  function generateCandles(): void {
    const newCandles: Candle[] = [];
    for (let i = 0; i < 16; i++) {
      newCandles.push({
        green: Math.random() > 0.45,
        height: Math.floor(Math.random() * 60 + 20)
      });
    }
    setCandles(newCandles);
  }

  function generateSignals(): void {
    const newSignals: Signal[] = [];
    for (let i = 0; i < 2; i++) {
      const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
      const type: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
      const entry = (Math.random() * 5000 + 20000).toFixed(2);
      const tp = type === 'buy' ? (parseFloat(entry) * 1.03).toFixed(2) : (parseFloat(entry) * 0.97).toFixed(2);
      const sl = type === 'buy' ? (parseFloat(entry) * 0.985).toFixed(2) : (parseFloat(entry) * 1.015).toFixed(2);
      const rr = (Math.abs(parseFloat(tp) - parseFloat(entry)) / Math.abs(parseFloat(entry) - parseFloat(sl))).toFixed(2);
      const confidence: 'high' | 'medium' = Math.random() > 0.6 ? 'high' : 'medium';
      newSignals.push({
        id: Date.now() + i,
        pair,
        type,
        entry,
        tp,
        sl,
        rr,
        confidence,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    const updated = [...activeSignals, ...newSignals].slice(-6);
    setActiveSignals(updated);
    addChat('system', `⚡ Generated 2 new signals: ${newSignals[0].pair} ${newSignals[0].type.toUpperCase()} & ${newSignals[1].pair} ${newSignals[1].type.toUpperCase()}`);
    selectSignal(newSignals[0].id, updated);
  }

  function selectSignal(id: number, signals: Signal[] = activeSignals): void {
    const sig = signals.find(s => s.id === id);
    if (!sig) return;
    setSelectedSignal(sig);
    switchPair(sig.pair, parseFloat(sig.entry), sig.type === 'buy' ? 1.2 : -0.8);
    addChat('system', `📊 Selected ${sig.pair} ${sig.type.toUpperCase()} @ $${parseFloat(sig.entry).toLocaleString()}`);
  }

  function switchPlatform(key: string): void {
    setPlatform(key);
    addChat('system', `🔄 Switched to ${PLATFORMS[key]} — chart data syncing...`);
    generateCandles();
  }

  function switchPair(pair: string, price: number, change: number): void {
    setCurrentPair(pair);
    setCurrentPrice(price);
    setPriceChange(change);
    generateCandles();
    addChat('system', `📈 Chart switched to ${pair} — live feed active`);
  }

  function addChat(type: 'system' | 'user', text: string): void {
    setChatMessages(prev => [...prev, { type, text }]);
  }

  function sendChat(e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>): void {
    const target = e.target as HTMLElement;
    const input = target.previousElementSibling as HTMLInputElement || target.parentElement?.querySelector('input') as HTMLInputElement;
    const text = input?.value.trim();
    if (!text) return;
    addChat('user', text);
    input.value = '';
    setTimeout(() => {
      const responses = [
        `📊 ${currentPair} looking ${Math.random() > 0.5 ? 'bullish' : 'bearish'} on this timeframe.`,
        `⚠️ Volatility alert on ${currentPair}. Consider reducing position size.`,
        `✅ TP level approaching for active ${currentPair} signal.`,
        `📡 ${PLATFORMS[platform]} feed stable.`,
        `💡 Pro tip: Check correlation with ETH/USD before entry.`
      ];
      addChat('system', responses[Math.floor(Math.random() * responses.length)]);
    }, 800 + Math.random() * 1000);
  }

  function submitReport(): void {
    const input = document.getElementById('report-input') as HTMLInputElement;
    const text = input?.value.trim();
    if (!text) return;
    setReports(prev => [{ text, color: 'var(--accent-blue)' }, ...prev]);
    if (input) input.value = '';
    addChat('system', `🚩 Report submitted: "${text}" — team notified.`);
  }

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="header">
        <div className="logo">
          <div className="logo-icon">N</div>
          <div>
            <div>NETRACK</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: 1 }}>SIGNAL TRADING PRO v2</div>
          </div>
        </div>
        <div className="header-actions">
          <div className="live-indicator"><span className="live-dot"></span> Live</div>
          <button className="btn btn-ghost">Compare</button>
          <span className="badge">Free</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>0/2 views</span>
          <button className="btn btn-primary">Log out</button>
        </div>
      </div>

      {/* LEFT COLUMN */}
      <div className="left-col panel scrollbar">
        <div className="panel-title">Today&apos;s Signals <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{activeSignals.length} Active</span></div>
        <button className="btn btn-primary generate-btn" onClick={generateSignals}>⚡ Generate 2 Signals</button>
        <div id="signals-container">
          {activeSignals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📡</div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>No signals yet today</div>
              <div style={{ fontSize: 11 }}>Click &quot;Generate 2 Signals&quot; or check back at 8AM / 8PM</div>
            </div>
          ) : (
            activeSignals.map(s => (
              <div key={s.id} className={`signal-card ${selectedSignal?.id === s.id ? 'active' : ''}`} onClick={() => selectSignal(s.id)}>
                <div className={`confidence ${s.confidence}`}>{s.confidence === 'high' ? '85%' : '72%'}</div>
                <div className="signal-header">
                  <span className="signal-pair">{s.pair}</span>
                  <span className={`signal-type ${s.type}`}>{s.type}</span>
                </div>
                <div className="signal-meta">
                  <span>📍 Entry: ${parseFloat(s.entry).toLocaleString()}</span>
                  <span>⏱ {s.time}</span>
                </div>
                <div className="tp-sl-bar"><div className="tp-bar"></div><div className="sl-bar"></div></div>
                <div className="risk-reward">
                  <span className="rr-badge">R:R {s.rr}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>TP: ${parseFloat(s.tp).toLocaleString()} | SL: ${parseFloat(s.sl).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel-title" style={{ marginTop: 16 }}>Performance</div>
        <div className="performance-grid">
          <div className="perf-item"><div className="perf-label">Win Rate</div><div className="perf-value green">{perf.winRate}</div></div>
          <div className="perf-item"><div className="perf-label">Profit Factor</div><div className="perf-value green">{perf.profitFactor}</div></div>
          <div className="perf-item"><div className="perf-label">P&L</div><div className="perf-value green">{perf.pnl}</div></div>
          <div className="perf-item"><div className="perf-label">Active Trades</div><div className="perf-value" style={{ color: 'var(--accent-blue)' }}>{activeSignals.length}</div></div>
        </div>
      </div>

      {/* CENTER COLUMN */}
      <div className="center-col panel">
        <div className="panel-title">
          Chart View
          <div className="platform-tabs">
            {Object.keys(PLATFORMS).map(key => (
              <button key={key} className={`platform-tab ${platform === key ? 'active' : ''}`} onClick={() => switchPlatform(key)}>
                {key === 'cTrader' ? 'cTrader' : key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-area">
          <div className="chart-header">
            <div>
              <div className="chart-pair">{currentPair}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{PLATFORMS[platform]}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={`chart-price ${priceChange < 0 ? 'down' : ''}`}>${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div style={{ fontSize: 11, color: priceChange >= 0 ? 'var(--success)' : 'var(--danger)' }}>{(priceChange >= 0 ? '+' : '') + priceChange}% today</div>
            </div>
          </div>
          <div className="chart-visual">
            <div className="chart-labels">
              <span>68,000</span><span>67,500</span><span>67,000</span><span>66,500</span><span>66,000</span>
            </div>
            <div className="candlestick-chart">
              {candles.map((c, i) => (
                <div key={i} className={`candle ${c.green ? 'green' : 'red'}`} style={{ height: c.height }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="tp-sl-display">
          <div className="tp-box">
            <div className="tp-label">Take Profit</div>
            <div className="tp-value">{selectedSignal ? '$' + parseFloat(selectedSignal.tp).toLocaleString() : '--'}</div>
          </div>
          <div className="sl-box">
            <div className="sl-label">Stop Loss</div>
            <div className="sl-value">{selectedSignal ? '$' + parseFloat(selectedSignal.sl).toLocaleString() : '--'}</div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 4, flex: 0.6 }}>
          <div className="panel-title">💬 Live Chart Chat</div>
          <div className="chat-messages scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.type}`}>{msg.text}</div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-row">
            <input type="text" className="chat-input" placeholder="Type message..." onKeyPress={e => e.key === 'Enter' && sendChat(e)} />
            <button className="btn btn-primary" onClick={sendChat}>Send</button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="right-col panel scrollbar">
        <div className="panel-title">Quick Order</div>
        <div className="quick-order">
          <div className="form-group"><label className="form-label">Size</label><input type="number" className="form-input" defaultValue="0.25" step="0.01" /></div>
          <div className="form-group">
            <label className="form-label">Leverage</label>
            <select className="form-input">
              <option>1x</option><option>5x</option><option>10x</option><option>20x</option><option>50x</option><option>100x</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Platform</label>
            <select className="form-input">
              <option>Exness</option><option>TradingView</option><option>MetaTrader 5</option><option>cTrader</option><option>Binance</option><option>Bybit</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: 12, marginTop: 4 }}>Place Order</button>
        </div>

        <div className="panel-title" style={{ marginTop: 16 }}>Watchlist</div>
        <div>
          {WATCHLIST.map(item => (
            <div key={item.pair} className="watchlist-item" onClick={() => switchPair(item.pair, item.price, item.change)}>
              <span className="watchlist-pair">{item.pair}</span>
              <span className={`watchlist-change ${item.change >= 0 ? 'up' : 'down'}`}>{(item.change >= 0 ? '+' : '') + item.change}%</span>
            </div>
          ))}
        </div>

        <div className="report-section">
          <div className="panel-title">🚩 Report & Feedback</div>
          <div className="chat-input-row" style={{ marginBottom: 8 }}>
            <input id="report-input" type="text" className="chat-input" placeholder="Report an issue or suggest..." onKeyPress={e => e.key === 'Enter' && submitReport()} />
            <button className="btn btn-ghost" onClick={submitReport}>Submit</button>
          </div>
          <div style={{ maxHeight: 120, overflowY: 'auto' }} className="scrollbar">
            {reports.map((r, i) => (
              <div key={i} className="report-item">
                <div className="report-dot" style={{ background: r.color }}></div>
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
