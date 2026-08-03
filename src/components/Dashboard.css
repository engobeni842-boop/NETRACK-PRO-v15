/* NETRACK Pro v2 - Dashboard Styles */
:root {
  --bg-primary: #0b0f19;
  --bg-card: #111827;
  --bg-card-hover: #1a2236;
  --border: #1f2937;
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-green: #10b981;
  --accent-red: #ef4444;
  --accent-yellow: #f59e0b;
  --success: #10b981;
  --danger: #ef4444;
}

.dashboard {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  grid-template-rows: 60px 1fr;
  height: 100vh;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Header */
.header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 20px;
}
.logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; }
.logo-icon {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold;
}
.header-actions { display: flex; gap: 12px; align-items: center; }
.badge {
  padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
  background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16,185,129,0.3);
}
.btn {
  padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;
  font-size: 13px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  color: white;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-ghost:hover { background: var(--bg-card-hover); color: var(--text-primary); }

/* Panels */
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  color: var(--text-secondary); margin-bottom: 12px;
  display: flex; justify-content: space-between; align-items: center;
}

/* Left Column */
.left-col { display: flex; flex-direction: column; gap: 12px; }
.generate-btn { width: 100%; padding: 14px; font-size: 14px; margin-bottom: 12px; }
.signal-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.signal-card:hover { border-color: var(--accent-blue); transform: translateX(4px); }
.signal-card.active { border-color: var(--accent-blue); background: rgba(59,130,246,0.08); }
.signal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.signal-pair { font-weight: 700; font-size: 15px; }
.signal-type {
  padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;
}
.signal-type.buy { background: rgba(16,185,129,0.2); color: var(--success); }
.signal-type.sell { background: rgba(239,68,68,0.2); color: var(--danger); }
.signal-meta { display: flex; gap: 16px; font-size: 12px; color: var(--text-secondary); margin-top: 8px; }
.tp-sl-bar {
  display: flex; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 10px; background: var(--bg-card);
}
.tp-bar { background: var(--success); flex: 2; }
.sl-bar { background: var(--danger); flex: 1; }
.confidence {
  position: absolute; top: 8px; right: 8px;
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; border: 2px solid;
}
.confidence.high { border-color: var(--success); color: var(--success); }
.confidence.medium { border-color: var(--accent-yellow); color: var(--accent-yellow); }
.risk-reward { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.rr-badge {
  padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;
  background: rgba(139,92,246,0.2); color: var(--accent-purple);
}
.performance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.perf-item { background: var(--bg-primary); border-radius: 8px; padding: 10px; border: 1px solid var(--border); }
.perf-label { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.perf-value { font-size: 16px; font-weight: 700; margin-top: 4px; }
.perf-value.green { color: var(--success); }

/* Center Column */
.center-col { display: flex; flex-direction: column; gap: 12px; }
.chart-area {
  flex: 1;
  background: var(--bg-primary);
  border-radius: 10px;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.chart-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
.chart-pair { font-size: 18px; font-weight: 700; }
.chart-price { font-size: 20px; font-weight: 700; color: var(--success); }
.chart-price.down { color: var(--danger); }
.platform-tabs {
  display: flex; gap: 4px; background: var(--bg-card); padding: 4px; border-radius: 8px;
}
.platform-tab {
  padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
  cursor: pointer; border: none; background: transparent; color: var(--text-secondary);
  transition: all 0.2s;
}
.platform-tab.active { background: var(--accent-blue); color: white; }
.platform-tab:hover:not(.active) { color: var(--text-primary); }
.chart-visual {
  flex: 1;
  position: relative;
  padding: 20px;
}
.candlestick-chart {
  width: 100%; height: 100%;
  display: flex; align-items: flex-end; justify-content: space-around;
  gap: 8px; padding-bottom: 30px;
}
.candle {
  width: 24px;
  border-radius: 4px;
  transition: all 0.3s;
}
.candle.green { background: var(--success); }
.candle.red { background: var(--danger); }
.chart-labels {
  position: absolute; left: 10px; top: 20px; bottom: 50px;
  display: flex; flex-direction: column; justify-content: space-between;
  font-size: 10px; color: var(--text-secondary);
}
.tp-sl-display {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px;
}
.tp-box, .sl-box {
  background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px;
  padding: 10px; text-align: center;
}
.tp-box { border-color: rgba(16,185,129,0.4); }
.sl-box { border-color: rgba(239,68,68,0.4); }
.tp-label, .sl-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); }
.tp-value { font-size: 16px; font-weight: 700; color: var(--success); margin-top: 4px; }
.sl-value { font-size: 16px; font-weight: 700; color: var(--danger); margin-top: 4px; }

/* Chat */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
  margin-bottom: 10px;
}
.chat-msg {
  padding: 8px 12px; border-radius: 10px; font-size: 12px; max-width: 90%;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.chat-msg.system { background: rgba(59,130,246,0.15); color: var(--accent-blue); align-self: flex-start; }
.chat-msg.user { background: var(--bg-card-hover); color: var(--text-primary); align-self: flex-end; }
.chat-input-row { display: flex; gap: 8px; }
.chat-input {
  flex: 1; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px;
  padding: 8px 12px; color: var(--text-primary); font-size: 13px; outline: none;
}

/* Right Column */
.right-col { display: flex; flex-direction: column; gap: 12px; }
.quick-order { display: flex; flex-direction: column; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); font-weight: 600; }
.form-input {
  background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 12px; color: var(--text-primary); font-size: 14px; outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: var(--accent-blue); }
select.form-input { cursor: pointer; }
.watchlist-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border-radius: 8px; background: var(--bg-primary);
  margin-bottom: 6px; border: 1px solid var(--border);
  transition: all 0.2s; cursor: pointer;
}
.watchlist-item:hover { border-color: var(--accent-blue); }
.watchlist-pair { font-weight: 600; font-size: 13px; }
.watchlist-change { font-weight: 700; font-size: 13px; }
.watchlist-change.up { color: var(--success); }
.watchlist-change.down { color: var(--danger); }

/* Report */
.report-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.report-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px; border-radius: 6px; background: var(--bg-primary);
  margin-bottom: 6px; font-size: 12px;
}
.report-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-yellow); flex-shrink: 0; }

/* Utilities */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--text-secondary); text-align: center; padding: 40px 20px;
}
.empty-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.5; }
.scrollbar::-webkit-scrollbar { width: 4px; }
.scrollbar::-webkit-scrollbar-track { background: transparent; }
.scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
.live-indicator {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--success); font-weight: 600;
}
.live-dot { width: 6px; height: 6px; background: var(--success); border-radius: 50%; animation: pulse 2s infinite; }

/* Responsive */
@media (max-width: 1200px) {
  .dashboard { grid-template-columns: 260px 1fr 280px; }
}
@media (max-width: 900px) {
  .dashboard { grid-template-columns: 1fr; grid-template-rows: auto; overflow-y: auto; }
}
