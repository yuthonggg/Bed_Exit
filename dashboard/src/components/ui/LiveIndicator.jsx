export default function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div className="w-2 h-2 bg-safe rounded-full" />
        <div className="absolute inset-0 w-2 h-2 bg-safe rounded-full animate-pulse-live" />
      </div>
      <span className="text-[10px] font-semibold text-safe uppercase tracking-widest">Live</span>
    </div>
  );
}
