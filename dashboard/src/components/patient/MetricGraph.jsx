import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import LiveIndicator from '../ui/LiveIndicator';

export default function MetricGraph({ data, dataKey, label, color, delay }) {
  const gradientId = `grad-${dataKey}`;
  const glowId = `glow-${dataKey}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color }} />
      
      <div className="flex items-center justify-between mb-4 pl-3">
        <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase opacity-80">{label}</h3>
        <LiveIndicator />
      </div>

      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId="patient-sync" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} width={40} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0, 82, 204, 0.1)', borderRadius: 12, fontSize: 11, fontWeight: 'bold' }}
              itemStyle={{ color: color }}
            />
            <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={1} />
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
