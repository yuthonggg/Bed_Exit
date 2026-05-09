import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-text-primary tracking-wide">Dynamic Pattern Analysis</h3>
        <LiveIndicator />
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => onToggle(m.key)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 shadow-sm ${
              selected.includes(m.key)
                ? 'border-transparent text-white'
                : 'border-border bg-white/50 text-text-muted hover:text-text-primary'
            }`}
            style={selected.includes(m.key) ? { backgroundColor: m.color, boxShadow: `0 4px 12px ${m.color}40` } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} syncId="bed-sync">
            <defs>
              {METRICS.map(m => (
                <filter key={`glow-${m.key}`} id={`glow-${m.key}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              ))}
            </defs>
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={10} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} width={40} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 82, 204, 0.1)', 
                borderRadius: '12px', 
                fontSize: '11px', 
                fontWeight: 'bold',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            />
            {METRICS.filter(m => selected.includes(m.key)).map(m => (
              <Line 
                key={m.key} 
                type="monotone" 
                dataKey={m.key} 
                stroke={m.color} 
                strokeWidth={3} 
                dot={false} 
                isAnimationActive={false} 
                filter={`url(#glow-${m.key})`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
