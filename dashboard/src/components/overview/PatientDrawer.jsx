import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Zap, User, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useDerivatives } from '../../hooks/useDerivatives';

// Components
import BedMap from '../patient/BedMap';
import SixGraphGrid from '../patient/SixGraphGrid';
import MasterComparisonChart from '../patient/MasterComparisonChart';
import AlertImageGallery from '../patient/AlertImageGallery';
import RestlessnessIndex from '../patient/RestlessnessIndex';
import MetricGraph from '../patient/MetricGraph';

export default function PatientDrawer({ patientId, onClose }) {
  const { patients, streams } = usePatients();
  const [detailMode, setDetailMode] = useState('behavioral');
  
  const patient = patients.find(p => p.id === patientId);
  const rawData = streams[patientId] || [];
  const enrichedData = useDerivatives(rawData);
  const position = rawData.length > 0 ? rawData[rawData.length - 1] : { x: 50, y: 50 };

  if (!patient) return null;

  return (
    <AnimatePresence>
      {patientId && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-5xl bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-[#F8FAFC]/50 flex items-start justify-between">
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-[#0052CC] rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-[#0052CC]/20 border-4 border-white">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{patient.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-200/50">
                      <MapPin className="w-3 h-3" /> {patient.ward} • {patient.bedId}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admitted: {patient.admitted}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl border-2 border-slate-100 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-white">
              {/* View Toggles */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100/50 p-1.5 rounded-2xl flex items-center border border-slate-200">
                    <button 
                      onClick={() => setDetailMode('behavioral')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${detailMode === 'behavioral' ? 'bg-white text-primary shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Activity className="w-4 h-4" /> Behavioral View
                    </button>
                    <button 
                      onClick={() => setDetailMode('kinematic')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${detailMode === 'kinematic' ? 'bg-white text-primary shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Zap className="w-4 h-4" /> Kinematic Analysis
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Update: Real-time Feed</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-8 space-y-10">
                  {detailMode === 'behavioral' ? (
                    <div className="space-y-10">
                      <div className="grid grid-cols-2 gap-8">
                        <MetricGraph data={enrichedData} dataKey="x" label="Lateral Displacement (X)" color="#0052CC" delay={0} />
                        <MetricGraph data={enrichedData} dataKey="y" label="Longitudinal Position (Y)" color="#10B981" delay={0.1} />
                      </div>
                      <RestlessnessIndex data={enrichedData} />
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <SixGraphGrid data={enrichedData} />
                      <MasterComparisonChart data={enrichedData} />
                    </div>
                  )}
                  <AlertImageGallery patientId={patientId} />
                </div>

                <div className="col-span-12 lg:col-span-4">
                  <div className="sticky top-0 space-y-8">
                    <BedMap position={position} />
                    
                    <div className="border-2 border-slate-100 rounded-[2rem] p-6 bg-slate-50/50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Clinical Metadata</h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-black">Primary Diagnosis</p>
                          <p className="text-sm font-black text-slate-800 leading-tight">{patient.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-black">Attending Physician</p>
                          <p className="text-sm font-black text-slate-800">{patient.physician}</p>
                        </div>
                        <div className="pt-6 border-t border-slate-200">
                          <button className="w-full bg-[#0052CC] text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">
                            Generate Diagnostic Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
