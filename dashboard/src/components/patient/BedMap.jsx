import { motion } from 'framer-motion';

export default function BedMap({ position }) {
  const dist = Math.sqrt(Math.pow(position.x - 50, 2) + Math.pow(position.y - 50, 2));
  const danger = Math.min(1, dist / 40);
  
  let dotColor = '#16A34A'; // safe
  if (danger > 0.6) dotColor = '#DC2626'; // danger
  else if (danger > 0.35) dotColor = '#D97706'; // warning

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-5 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Live Bed Map</h3>
      
      <div className="flex-1 relative w-full bg-background rounded-lg border border-border overflow-hidden min-h-[200px]">
        {/* Bed outline */}
        <div className="absolute inset-[10%] border-2 border-border rounded-md bg-white">
          <div className="absolute top-2 left-[20%] right-[20%] h-[12%] bg-background rounded-sm border border-border" />
          <div className="absolute top-[30%] left-[5%] right-[5%] h-px bg-border" />
        </div>

        {/* Zones */}
        <div className="absolute inset-[25%] border border-dashed border-safe/30 rounded" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[15%] h-full bg-danger-light/30" />
          <div className="absolute top-0 right-0 w-[15%] h-full bg-danger-light/30" />
          <div className="absolute bottom-0 left-0 w-full h-[15%] bg-danger-light/30" />
        </div>

        {/* Dot */}
        <motion.div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: dotColor, left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute w-10 h-10 rounded-full blur-md"
          style={{ backgroundColor: dotColor, left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)', opacity: 0.2 }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
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
