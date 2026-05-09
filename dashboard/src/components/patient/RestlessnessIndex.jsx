import { motion } from 'framer-motion';

export default function RestlessnessIndex({ data }) {
  // Synthesize derivatives into a single score 0-100
  let score = 0;
  if (data && data.length > 0) {
    // Average the last 10 data points for smoothness
    const recent = data.slice(-10);
    const sum = recent.reduce((acc, pt) => {
      const mag = Math.abs(pt.dydx) + Math.abs(pt.d2ydx2) + Math.abs(pt.dxdy) + Math.abs(pt.d2xdy2);
      return acc + mag;
    }, 0);
    const avg = sum / recent.length;
    // Cap at 100
    score = Math.min(100, Math.round(avg * 5));
  }

  let color = 'text-safe';
  let gradientStops = ['#10B981', '#10B981']; // safe
  let label = 'Stable';
  
  if (score > 60) { 
    color = 'text-danger'; 
    gradientStops = ['#F59E0B', '#EF4444']; 
    label = 'Critical Mobility'; 
  }
  else if (score > 30) { 
    color = 'text-warning'; 
    gradientStops = ['#10B981', '#F59E0B']; 
    label = 'Active Shifting'; 
  }

  return (
    <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden group">
      <h3 className="absolute top-6 left-6 text-sm font-bold text-text-primary tracking-wide">Dynamic Mobility Index</h3>
      
      <div className="relative w-52 h-52 flex items-center justify-center mb-6">
        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientStops[0]} />
              <stop offset="100%" stopColor={gradientStops[1]} />
            </linearGradient>
            <filter id="ringGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
          <motion.circle 
            cx="50" cy="50" r="44" fill="none" stroke="url(#scoreGradient)" strokeWidth={score > 0 ? 8 : 0} 
            strokeDasharray="276.5"
            strokeDashoffset={276.5 - (276.5 * score) / 100}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
            filter="url(#ringGlow)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={score}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-7xl font-extrabold tracking-tighter ${color}`}
          >
            {score}
          </motion.span>
          <span className="premium-header mt-1">/ 100 Risk</span>
        </div>
      </div>
      
      <div className="text-center">
        <p className={`text-xl font-bold ${color} tracking-tight mb-2`}>{label}</p>
        <p className="text-sm text-text-muted max-w-[280px] leading-relaxed">
          {score > 60 ? "Immediate attention required. High probability of bed exit attempt." : 
           score > 30 ? "Moderate restlessness detected. Monitor patient for shifting behavior." : 
           "Baseline stability maintained. Patient is resting within safe parameters."}
        </p>
      </div>
    </div>
  );
}
