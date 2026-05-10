import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { classLabel, formatConfidence } from '../../utils/formatters';

export default function AlertFeed() {
  const { alerts, acknowledgeAlert } = usePatients();
  const navigate = useNavigate();
  const unackAlerts = alerts.filter(a => !a.acknowledged && a.classification === 'unsafe_exit');

  // Simple timer state to force re-renders for the countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-card rounded-[2rem] flex flex-col h-[750px] overflow-hidden border-2 border-slate-100">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" /> Active Incident Queue
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Triage</p>
        </div>
        {unackAlerts.length > 0 && (
          <motion.span 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-200"
          >
            {unackAlerts.length} PRIORITY
          </motion.span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30">
        <AnimatePresence mode="popLayout">
          {unackAlerts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6 border border-emerald-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h4 className="font-black text-slate-800 text-lg mb-1 tracking-tight">System Status: Stable</h4>
              <p className="text-xs text-slate-400 font-medium">All monitored beds are currently secure.</p>
            </motion.div>
          ) : (
            unackAlerts.map((alert, i) => {
              const isUrgent = alert.classification === 'unsafe_exit';
              const secondsElapsed = Math.floor((now - alert.timestamp) / 1000);
              const isEscalated = secondsElapsed > 30;

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: i === 0 ? 1 : 0.98
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`border-2 rounded-[1.5rem] p-5 relative overflow-hidden transition-all duration-500 ${
                    isUrgent ? (isEscalated ? 'border-red-500 bg-red-50/50 shadow-xl shadow-red-100' : 'border-red-200 bg-white shadow-md') : 'border-amber-100 bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-red-600 text-white shadow-lg' : 'bg-amber-500 text-white'}`}>
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight">{alert.patientName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.ward} • {alert.bedId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isEscalated ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                          <Clock className="w-3 h-3" /> {secondsElapsed}s
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observation</p>
                      <p className="text-xs font-black text-slate-700">{classLabel(alert.classification)} detected with {Math.round(alert.confidence * 100)}% accuracy</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex-1 bg-slate-900 text-white text-[10px] font-black py-3 rounded-xl hover:bg-[#0052CC] transition-all shadow-lg shadow-slate-200 uppercase tracking-wider"
                      >
                        Acknowledge
                      </button>
                      <button 
                        onClick={() => navigate(`/patient/${alert.patientId}`)}
                        className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-100 text-slate-400 hover:text-primary hover:border-primary rounded-xl transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
