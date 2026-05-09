import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import LiveIndicator from './LiveIndicator';

export default function MetricChart({ data, dataKey, label, color, unit = '', delay = 0 }) {
  const gradientId = `grad-${dataKey}`;
  const glowId = `glow-${dataKey}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: color }} />
          <span className="premium-header">{label}</span>
        </div>
        <LiveIndicator />
      </div>

      <div className="mb-4">
        <span className="text-2xl font-bold text-text-primary tracking-tight">
          {data.length > 0 ? (data[data.length - 1]?.[dataKey] ?? 0).toFixed(2) : '—'}
        </span>
        <span className="text-[10px] font-bold text-text-muted ml-1.5 uppercase tracking-widest">{unit}</span>
      </div>

      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId="bed-sync" margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} hide />
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
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fill={`url(#${gradientId})`} 
              strokeWidth={3} 
              dot={false} 
              isAnimationActive={false} 
              filter={`url(#${glowId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
