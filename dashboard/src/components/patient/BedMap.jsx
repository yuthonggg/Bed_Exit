import { motion } from 'framer-motion';

export default function BedMap({ position }) {
  const dist = Math.sqrt(Math.pow(position.x - 50, 2) + Math.pow(position.y - 50, 2));
  const danger = Math.min(1, dist / 40);
  
  let dotColor = '#16A34A'; // safe
  if (danger > 0.6) dotColor = '#DC2626'; // danger
  else if (danger > 0.35) dotColor = '#D97706'; // warning

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold text-text-primary tracking-wide mb-6">Real-Time Patient Position</h3>
      
      <div className="flex-1 relative w-full bg-slate-100/50 rounded-2xl border border-border/50 overflow-hidden min-h-[300px] shadow-inner">
        {/* Bed outline */}
        <div className="absolute inset-[10%] border-2 border-border/30 rounded-xl bg-white shadow-sm">
          <div className="absolute top-4 left-[25%] right-[25%] h-[15%] bg-slate-50 rounded-lg border border-border/20 shadow-sm" />
          <div className="absolute top-[35%] left-[5%] right-[5%] h-px bg-slate-100" />
        </div>

        {/* Zones */}
        <div className="absolute inset-[25%] border border-dashed border-primary/20 rounded-xl" />
        
        {/* Dot with Aura Glow */}
        <motion.div
          className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg z-20"
          style={{ 
            backgroundColor: dotColor, 
            left: `${position.x}%`, 
            top: `${position.y}%`, 
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 20px ${dotColor}80`
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute w-12 h-12 rounded-full blur-xl z-10"
          style={{ 
            backgroundColor: dotColor, 
            left: `${position.x}%`, 
            top: `${position.y}%`, 
            transform: 'translate(-50%, -50%)' 
          }}
          animate={{ 
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.4, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center gap-1.5 text-text-muted"><div className="w-2 h-2 rounded-full bg-safe" /> Safe</span>
          <span className="flex items-center gap-1.5 text-text-muted"><div className="w-2 h-2 rounded-full bg-warning" /> Warning</span>
          <span className="flex items-center gap-1.5 text-text-muted"><div className="w-2 h-2 rounded-full bg-danger" /> Risk</span>
        </div>
        <div className="text-center font-mono text-xs font-semibold text-text-primary bg-background py-1.5 rounded border border-border">
          X: {(position.x/100).toFixed(2)} | Y: {(position.y/100).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
