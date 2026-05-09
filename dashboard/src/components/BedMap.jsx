import { motion } from 'framer-motion';

export default function BedMap({ position }) {
  const dist = Math.sqrt(Math.pow(position.x - 50, 2) + Math.pow(position.y - 50, 2));
  const danger = Math.min(1, dist / 40);
  const dotColor = danger > 0.6 ? '#ef4444' : danger > 0.35 ? '#f59e0b' : '#10b981';
  const statusText = danger > 0.6 ? 'EXIT RISK' : danger > 0.35 ? 'NEAR EDGE' : 'SAFE';
  const statusBg = danger > 0.6 ? 'bg-red-500/20 text-red-400' : danger > 0.35 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400';

  return (
    <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Bed Map</h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBg}`}>{statusText}</span>
      </div>

      <div className="relative w-full aspect-[3/4] bg-slate-900/80 rounded-xl border border-slate-600/30 overflow-hidden">
        {/* Bed frame */}
        <div className="absolute inset-[8%] border-2 border-slate-600/40 rounded-lg">
          {/* Pillow */}
          <div className="absolute top-2 left-[18%] right-[18%] h-[10%] bg-slate-700/50 rounded-md border border-slate-600/20" />
          {/* Blanket fold line */}
          <div className="absolute top-[30%] left-[5%] right-[5%] h-px bg-slate-600/20" />
        </div>

        {/* Safe zone dashed border */}
        <div className="absolute inset-[22%] border border-dashed border-emerald-500/15 rounded-lg" />

        {/* Danger zone overlay on edges */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[12%] h-full bg-gradient-to-r from-red-500/10 to-transparent" />
          <div className="absolute top-0 right-0 w-[12%] h-full bg-gradient-to-l from-red-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-[12%] bg-gradient-to-t from-red-500/10 to-transparent" />
        </div>

        {/* Glow behind dot */}
        <motion.div
          className="absolute w-12 h-12 rounded-full blur-xl"
          style={{
            backgroundColor: dotColor,
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.35,
          }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Patient dot */}
        <motion.div
          className="absolute w-4 h-4 rounded-full border-2 border-white/40"
          style={{
            backgroundColor: dotColor,
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 16px ${dotColor}80`,
          }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Coordinate label */}
        <div className="absolute bottom-2 right-2 text-[9px] text-slate-500 font-mono">
          ({position.x.toFixed(1)}, {position.y.toFixed(1)})
        </div>
      </div>
    </div>
  );
}
