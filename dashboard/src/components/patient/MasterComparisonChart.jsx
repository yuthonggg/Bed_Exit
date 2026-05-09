import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { METRICS } from './SixGraphGrid';

export default function MasterComparisonChart({ data }) {
  const [selected, setSelected] = useState([]);

  const toggle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-5 mb-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Pattern Comparison</h3>

      <div className="flex flex-wrap gap-2 mb-6">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => toggle(m.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 border ${
              selected.includes(m.key) ? 'border-transparent text-white shadow-sm' : 'border-border text-text-muted hover:bg-background'
            }`}
            style={selected.includes(m.key) ? { backgroundColor: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="h-[300px] w-full bg-background/50 rounded-lg border border-border flex items-center justify-center p-2">
        {selected.length === 0 ? (
          <p className="text-sm text-text-muted">Select metrics above to compare patterns</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} syncId="patient-sync">
              <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} width={30} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#1E293B', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#64748B', marginBottom: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#64748B' }} />
              {METRICS.filter(m => selected.includes(m.key)).map(m => (
                <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
