import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import LiveIndicator from './LiveIndicator';

const METRICS = [
  { key: 'x', label: 'X Position', color: '#10b981' },
  { key: 'y', label: 'Y Position', color: '#3b82f6' },
  { key: 'dydx', label: 'dy/dx', color: '#8b5cf6' },
  { key: 'd2ydx2', label: 'd²y/dx²', color: '#f59e0b' },
  { key: 'dxdy', label: 'dx/dy', color: '#f43f5e' },
  { key: 'd2xdy2', label: 'd²x/dy²', color: '#06b6d4' },
];

export default function MasterChart({ data, selected, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-[#1e293b]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white tracking-wide">Pattern Comparison</h3>
        <LiveIndicator />
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => onToggle(m.key)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 ${
              selected.includes(m.key)
                ? 'border-transparent text-white shadow-lg'
                : 'border-slate-600/50 text-slate-500 hover:text-slate-300 bg-transparent'
            }`}
            style={selected.includes(m.key) ? { backgroundColor: m.color + '30', color: m.color, borderColor: m.color + '60' } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} syncId="bed-sync">
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 9 }} width={36} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12, color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          {METRICS.filter(m => selected.includes(m.key)).map(m => (
            <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
