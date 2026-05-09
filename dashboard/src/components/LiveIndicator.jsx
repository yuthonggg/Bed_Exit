export default function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse-live" />
      </div>
      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Live</span>
    </div>
  );
}
