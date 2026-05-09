import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import LiveIndicator from '../ui/LiveIndicator';

export default function MetricGraph({ data, dataKey, label, color, delay }) {
  const gradientId = `grad-${dataKey}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-surface rounded-xl shadow-sm border border-border p-4 relative overflow-hidden group hover:shadow-md transition-shadow"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
      
      <div className="flex items-center justify-between mb-3 pl-2">
        <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
        <LiveIndicator />
      </div>

      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId="patient-sync">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748B', fontSize: 10 }} width={30} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#1E293B', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
              itemStyle={{ color: color, fontWeight: 600 }}
              labelStyle={{ color: '#64748B', marginBottom: 4 }}
            />
            <ReferenceLine y={0} stroke="#E2E8F0" strokeDasharray="3 3" />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
