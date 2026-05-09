import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import LiveIndicator from './LiveIndicator';

export default function MetricChart({ data, dataKey, label, color, unit = '', delay = 0 }) {
  const gradientId = `grad-${dataKey}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-[#1e293b]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/80 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-medium text-slate-400">{label}</span>
        </div>
        <LiveIndicator />
      </div>

      <div className="text-right mb-1">
        <span className="text-lg font-bold text-white">
          {data.length > 0 ? (data[data.length - 1]?.[dataKey] ?? 0).toFixed(2) : '—'}
        </span>
        <span className="text-[10px] text-slate-500 ml-1">{unit}</span>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} syncId="bed-sync">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 9 }} width={36} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12, color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
