import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { METRICS } from './SixGraphGrid';

export default function MasterComparisonChart({ data }) {
  const [selected, setSelected] = useState([]);

  const toggle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-text-primary tracking-wide uppercase opacity-80">Signal Interference & Comparison</h3>
        <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-1 rounded-md uppercase tracking-widest">Multi-Channel Analysis</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => toggle(m.key)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border shadow-sm ${
              selected.includes(m.key) ? 'border-transparent text-white scale-[1.02]' : 'border-border bg-white/50 text-text-muted hover:text-text-primary hover:border-primary/30'
            }`}
            style={selected.includes(m.key) ? { backgroundColor: m.color, boxShadow: `0 4px 12px ${m.color}40` } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="h-[340px] w-full bg-slate-50/30 rounded-2xl border border-border/50 p-4 relative overflow-hidden shadow-inner">
        {selected.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="w-full h-full opacity-5 absolute inset-0 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="x" stroke="#000" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="y" stroke="#000" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest relative z-10">Select cinematic channels above to begin comparative analysis</p>
            <p className="text-[10px] text-text-muted mt-2 relative z-10 font-medium italic opacity-60">Visualizing baseline kinematic signals...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} syncId="patient-sync">
              <defs>
                {METRICS.map(m => (
                  <filter key={`glow-master-${m.key}`} id={`glow-master-${m.key}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                ))}
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={5} />
              <YAxis tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 800 }} width={45} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 82, 204, 0.1)', borderRadius: 12, fontSize: 11, fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={1.5} />
              
              {/* Ghost Baseline */}
              <Line type="monotone" dataKey="x" stroke="#CBD5E1" strokeWidth={1} strokeDasharray="5 5" dot={false} opacity={0.3} isAnimationActive={false} />
              
              {METRICS.filter(m => selected.includes(m.key)).map(m => (
                <Line 
                  key={m.key} 
                  type="monotone" 
                  dataKey={m.key} 
                  stroke={m.color} 
                  strokeWidth={3} 
                  dot={false} 
                  isAnimationActive={false} 
                  filter={`url(#glow-master-${m.key})`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
