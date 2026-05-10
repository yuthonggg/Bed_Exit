import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Activity, Zap, ChevronDown, Radio } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { usePatients } from '../context/PatientContext';
import { useDerivatives } from '../hooks/useDerivatives';

// Components for the detail view
import BedMap from '../components/patient/BedMap';
import SixGraphGrid from '../components/patient/SixGraphGrid';
import MasterComparisonChart from '../components/patient/MasterComparisonChart';
import AlertImageGallery from '../components/patient/AlertImageGallery';
import RestlessnessIndex from '../components/patient/RestlessnessIndex';
import MetricGraph from '../components/patient/MetricGraph';

export default function Patients() {
  const { patients, streams, getPatientStatus, getPatientDataSource } = usePatients();
  const [selectedId, setSelectedId] = useState(patients[0]?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detailMode, setDetailMode] = useState('behavioral');

  const getUrgency = (p) => {
    const status = getPatientStatus(p.id);
    if (status === 'alert') return 'urgent';
    // Check score if available
    const data = streams[p.id] || [];
    if (data.length > 0) {
      const recent = data.slice(-10);
      if (recent.some(pt => pt.status === 'Critical')) return 'urgent';
      const avgRisk = recent.reduce((acc, pt) => acc + (Number(pt.risk) || 0), 0) / recent.length;
      if (avgRisk > 40) return 'urgent';
      if (avgRisk > 25 || recent.some(pt => pt.status === 'Warning')) return 'monitoring';
    }
    return 'stable';
  };

  const filterStats = {
    all: patients.length,
    urgent: patients.filter(p => getUrgency(p) === 'urgent').length,
    monitoring: patients.filter(p => getUrgency(p) === 'monitoring').length,
    stable: patients.filter(p => getUrgency(p) === 'stable').length,
  };

  const filterOptions = [
    { id: 'all', label: 'Total Census', count: filterStats.all, color: '#0052CC', bg: '#F0F7FF' },
    { id: 'urgent', label: 'Urgent Response', count: filterStats.urgent, color: '#DC2626', bg: '#FFF1F1' },
    { id: 'monitoring', label: 'Active Monitoring', count: filterStats.monitoring, color: '#D97706', bg: '#FFFBEB' },
    { id: 'stable', label: 'Stable Baseline', count: filterStats.stable, color: '#16A34A', bg: '#ECFDF3' }
  ];

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.bedId.toLowerCase().includes(searchTerm.toLowerCase());
    const urgency = getUrgency(p);
    const matchesFilter = filter === 'all' || urgency === filter;
    return matchesSearch && matchesFilter;
  });

  const activeFilter = filterOptions.find(f => f.id === filter);
  const selectedPatient = patients.find(p => p.id === selectedId) || patients[0];
  const rawData = streams[selectedId] || [];
  const enrichedData = useDerivatives(rawData);
  const latest = rawData.length > 0 ? rawData[rawData.length - 1] : null;
  const position = latest ? {
    x: latest.displayX ?? latest.x,
    y: latest.displayY ?? latest.y,
    rawX: latest.x,
    rawY: latest.y,
  } : { x: 50, y: 50, rawX: 50, rawY: 50 };
  const selectedDataSource = getPatientDataSource(selectedPatient.id);

  return (
    <Layout title="Clinical Monitoring Station" fullBleed={true}>
      <div className="flex h-full overflow-hidden bg-white">
        
        {/* LEFT SIDEBAR: Patient Census Navigation */}
        <div className="w-80 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col">
          {/* Top Search Bar */}
          <div className="p-5 bg-white border-b border-[#E2E8F0]">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
              <input 
                type="text" 
                placeholder="Find patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0052CC]/5 focus:border-[#0052CC] transition-all"
              />
            </div>
          </div>

          {/* Compact Dropdown Filter */}
          <div className="p-5 border-b border-[#E2E8F0] relative z-20">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#0052CC]/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeFilter.color }} />
                  {activeFilter.id === 'urgent' && (
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
                  )}
                </div>
                <span className="text-[13px] font-bold text-slate-900">{activeFilter.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg" style={{ backgroundColor: activeFilter.bg, color: activeFilter.color }}>
                  {activeFilter.count}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute left-5 right-5 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {filterOptions.map(f => (
                        <button
                          key={f.id}
                          onClick={() => { setFilter(f.id); setIsFilterOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                            filter === f.id ? 'bg-slate-50' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
                            <span className={`text-xs font-bold ${filter === f.id ? 'text-slate-900' : 'text-slate-500'}`}>{f.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{f.count}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Patient List Section */}
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Ward Census</h3>
            <span className="text-[10px] font-bold text-slate-300">{filteredPatients.length} Listed</span>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
            {filteredPatients.map(p => {
              const urgency = getUrgency(p);
              const isActive = selectedId === p.id;
              const dotColor = urgency === 'urgent' ? 'bg-danger' : urgency === 'monitoring' ? 'bg-warning' : 'bg-safe';
              const source = getPatientDataSource(p.id);

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group text-left ${
                    isActive 
                      ? 'bg-white shadow-sm border-l-4 border-primary ring-1 ring-slate-200' 
                      : 'hover:bg-slate-200/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${dotColor} ${isActive ? 'animate-pulse' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-slate-700'}`}>
                      {p.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {p.ward} • {p.bedId}
                    </p>
                  </div>
                  <div className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-black uppercase ${
                    source === 'live' ? 'text-emerald-600' : source === 'waiting' ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    <Radio className="w-2.5 h-2.5" />
                    {source === 'live' ? 'Live' : source === 'waiting' ? 'Wait' : 'Sim'}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: Detail View */}
        <div className="flex-1 bg-white overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              {/* Header inside Detail View */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#0052CC] tracking-tight mb-2">{selectedPatient.name}</h2>
                  <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                    <span className="bg-slate-100 px-2 py-1 rounded text-[10px] uppercase tracking-widest">{selectedPatient.gender} • {selectedPatient.age} YRS</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Admitted: {selectedPatient.admitted}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] uppercase tracking-widest ${
                      selectedDataSource === 'live'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : selectedDataSource === 'waiting'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      <Radio className="w-3 h-3" />
                      {selectedDataSource === 'live' ? 'Live Arduino Data' : selectedDataSource === 'waiting' ? 'Waiting for Arduino Data' : 'Synthetic Demo Data'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-100/50 p-1 rounded-xl flex items-center border border-[#E2E8F0]">
                  <button 
                    onClick={() => setDetailMode('behavioral')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${detailMode === 'behavioral' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Activity className="w-3.5 h-3.5" /> Behavioral
                  </button>
                  <button 
                    onClick={() => setDetailMode('kinematic')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${detailMode === 'kinematic' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Kinematic
                  </button>
                </div>
              </div>

              {/* Modular Layout */}
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  {detailMode === 'behavioral' ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <MetricGraph data={enrichedData} dataKey="x" label="Lateral Displacement" color="#0052CC" delay={0} />
                        <MetricGraph data={enrichedData} dataKey="y" label="Longitudinal Position" color="#10B981" delay={0.1} />
                      </div>
                      <RestlessnessIndex data={enrichedData} />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <SixGraphGrid data={enrichedData} />
                      <MasterComparisonChart data={enrichedData} />
                    </div>
                  )}
                  <AlertImageGallery patientId={selectedId} />
                </div>

                <div className="col-span-12 lg:col-span-4">
                  <div className="sticky top-0">
                    <BedMap position={position} />
                    
                    {/* Extra Clinical Metadata Card */}
                    <div className="mt-8 border border-[#E2E8F0] rounded-2xl p-6 bg-slate-50/50">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Clinical Metadata</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Primary Diagnosis</p>
                          <p className="text-sm font-bold text-[#1E293B]">{selectedPatient.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Attending Physician</p>
                          <p className="text-sm font-bold text-[#1E293B]">{selectedPatient.physician}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </Layout>
  );
}
