import { useState, useCallback } from 'react';
import { useDataStream } from './hooks/useDataStream';
import { useDerivatives } from './hooks/useDerivatives';
import Sidebar from './components/Sidebar';
import BedMap from './components/BedMap';
import MetricChart from './components/MetricChart';
import MasterChart from './components/MasterChart';

const CHARTS = [
  { key: 'x', label: 'X Position', color: '#10b981', unit: 'cm' },
  { key: 'y', label: 'Y Position', color: '#3b82f6', unit: 'cm' },
  { key: 'dydx', label: 'dy/dx', color: '#8b5cf6', unit: '' },
  { key: 'd2ydx2', label: 'd²y/dx²', color: '#f59e0b', unit: '' },
  { key: 'dxdy', label: 'dx/dy', color: '#f43f5e', unit: '' },
  { key: 'd2xdy2', label: 'd²x/dy²', color: '#06b6d4', unit: '' },
];

export default function App() {
  const { data: rawData, position, currentPattern } = useDataStream();
  const enrichedData = useDerivatives(rawData);
  const [selected, setSelected] = useState(['x', 'y']);

  const toggleMetric = useCallback((key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">EDMAT Bed Exit Monitor</h1>
            <p className="text-[10px] text-slate-500">Automated Safety System · Real-Time Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse-live" />
          </div>
          <span className="text-[11px] font-medium text-emerald-400">System Online</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
        {/* Left Sidebar */}
        <div className="flex flex-col gap-4 w-full lg:w-72 xl:w-80 shrink-0">
          <Sidebar currentPattern={currentPattern} selected={selected} onToggle={toggleMetric} data={enrichedData} />
          <BedMap position={position} />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-4 min-w-0">
          {/* 6-Chart Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {CHARTS.map((c, i) => (
              <MetricChart key={c.key} data={enrichedData} dataKey={c.key} label={c.label} color={c.color} unit={c.unit} delay={i * 0.06} />
            ))}
          </div>

          {/* Master Comparison Chart */}
          <MasterChart data={enrichedData} selected={selected} onToggle={toggleMetric} />
        </main>
      </div>
    </div>
  );
}
