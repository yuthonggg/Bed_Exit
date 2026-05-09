import { motion } from 'framer-motion';

const METRICS_CONFIG = [
  { key: 'x', label: 'X Position', color: '#10b981' },
  { key: 'y', label: 'Y Position', color: '#3b82f6' },
  { key: 'dydx', label: 'dy/dx', color: '#8b5cf6' },
  { key: 'd2ydx2', label: 'd²y/dx²', color: '#f59e0b' },
  { key: 'dxdy', label: 'dx/dy', color: '#f43f5e' },
  { key: 'd2xdy2', label: 'd²x/dy²', color: '#06b6d4' },
];

const patternLabels = {
  resting: { text: 'Resting', color: 'text-emerald-400 bg-emerald-500/15' },
  side_sleeping: { text: 'Side Sleeping', color: 'text-blue-400 bg-blue-500/15' },
  shifting_to_edge: { text: 'Shifting to Edge', color: 'text-amber-400 bg-amber-500/15' },
  exit_attempt: { text: 'Exit Attempt', color: 'text-red-400 bg-red-500/15' },
};

export default function Sidebar({ currentPattern, selected, onToggle, data }) {
  const pl = patternLabels[currentPattern] || patternLabels.resting;
  const latest = data.length > 0 ? data[data.length - 1] : {};

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4"
    >
      {/* Patient Card */}
      <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">PA</div>
          <div>
            <h2 className="text-sm font-semibold text-white">Patient A — BED_01</h2>
            <p className="text-[11px] text-slate-500">Ward 3 · Room 12</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${pl.color}`}>{pl.text}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {METRICS_CONFIG.map(m => (
            <div key={m.key} className="bg-slate-800/60 rounded-lg px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">{m.label}</p>
              <p className="text-sm font-bold" style={{ color: m.color }}>
                {latest[m.key] !== undefined ? Number(latest[m.key]).toFixed(2) : '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Toggles */}
      <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Comparison Toggles</h4>
        <div className="flex flex-col gap-1.5">
          {METRICS_CONFIG.map(m => (
            <button
              key={m.key}
              onClick={() => onToggle(m.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                selected.includes(m.key)
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300 bg-transparent'
              }`}
              style={selected.includes(m.key) ? { backgroundColor: m.color + '20', color: m.color } : {}}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selected.includes(m.key) ? m.color : '#475569' }} />
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
