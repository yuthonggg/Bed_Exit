import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, User, MapPin, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';

export default function EmergencyPopup() {
  const { alerts, acknowledgeAlert } = usePatients();
  const navigate = useNavigate();
  
  // Only show the most recent unacknowledged 'unsafe_exit' alert
  const activeAlert = alerts.find(a => !a.acknowledged && a.classification === 'unsafe_exit');

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed bottom-10 right-10 z-[100] w-[400px]"
        >
          <div className="bg-red-600 rounded-[2rem] p-0.5 shadow-[0_20px_50px_rgba(239,68,68,0.3)] overflow-hidden border-2 border-white">
            <div className="bg-white rounded-[1.9rem] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">Emergency Alert</h4>
                    <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Immediate Response</p>
                  </div>
                </div>
                <div className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded">
                  CRITICAL
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                {activeAlert.imageUrl && (
                  <div className="h-32 rounded-xl overflow-hidden border border-slate-200 mb-3 bg-slate-200">
                    <img src={activeAlert.imageUrl} alt="Incident evidence" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900 tracking-tight leading-none">{activeAlert.patientName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{activeAlert.ward} • {activeAlert.bedId}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wide">Bed Exit Attempt Detected</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => acknowledgeAlert(activeAlert.id)}
                  className="flex-1 bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                >
                  <Check className="w-3.5 h-3.5" /> Acknowledge
                </button>
                <button 
                  onClick={() => navigate(`/patient/${activeAlert.patientId}`)}
                  className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-400 hover:text-primary hover:border-primary rounded-xl flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
