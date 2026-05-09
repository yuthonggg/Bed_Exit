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
  let bgColor = 'bg-safe';
  let label = 'Calm';
  if (score > 60) { color = 'text-danger'; bgColor = 'bg-danger'; label = 'High Risk'; }
  else if (score > 30) { color = 'text-warning'; bgColor = 'bg-warning'; label = 'Restless'; }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center h-[300px] transition-colors duration-200 relative overflow-hidden">
      <h3 className="absolute top-4 left-4 text-sm font-semibold text-text-primary">Mobility Score</h3>
      
      <div className="relative w-40 h-40 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
          <motion.circle 
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * score) / 100}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-text-muted mt-1">/ 100</span>
        </div>
      </div>
      
      <p className={`text-lg font-bold ${color}`}>{label}</p>
      <p className="text-sm text-text-muted mt-1 text-center px-4">
        {score > 60 ? "Patient is highly mobile. Risk of unsafe exit." : 
         score > 30 ? "Patient is shifting position frequently." : 
         "Patient is resting comfortably."}
      </p>
    </div>
  );
}
