import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Image as ImageIcon, AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { classLabel, classColor, formatConfidence } from '../../utils/formatters';

export default function AlertFeed() {
  const { alerts, acknowledgeAlert } = usePatients();
  const navigate = useNavigate();
  const unackAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border flex flex-col h-[600px] transition-colors duration-200">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-text-primary">Live Alerts</h3>
        {unackAlerts.length > 0 && (
          <span className="bg-danger-light text-danger text-xs font-bold px-2 py-0.5 rounded-full">
            {unackAlerts.length} New
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {unackAlerts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-12 h-12 bg-safe-light rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-safe" />
              </div>
              <p className="font-semibold text-text-primary mb-1">No active alerts</p>
              <p className="text-sm text-text-muted">All patients are currently safe.</p>
            </motion.div>
          )}

          {unackAlerts.map(alert => {
            const cColor = classColor(alert.classification);
            const isDanger = alert.classification === 'unsafe_exit';
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-surface border rounded-lg p-3 relative overflow-hidden group hover:shadow-md transition-all duration-200 ${
                  isDanger ? 'border-danger/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 
                  cColor === 'warning' ? 'border-warning/40' : 'border-border'
                }`}
              >
                {/* Left accent border */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${cColor === 'danger' ? 'bg-danger' : cColor === 'warning' ? 'bg-warning' : 'bg-safe'} ${isDanger ? 'animate-pulse' : ''}`} />

                <div className="flex gap-3 pl-2">
                  {/* Thumbnail placeholder */}
                  <div className="w-16 h-12 bg-background rounded shrink-0 flex items-center justify-center text-text-muted border border-border">
                    <ImageIcon className="w-5 h-5 opacity-50" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-bold text-text-primary truncate">{alert.patientName}</p>
                      <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        cColor === 'danger' ? 'bg-danger-light text-danger' : cColor === 'warning' ? 'bg-warning-light text-warning' : 'bg-safe-light text-safe'
                      }`}>
                        {cColor === 'danger' ? <AlertTriangle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                        {classLabel(alert.classification)}
                      </span>
                      <span className="text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded-full border border-border">
                        {formatConfidence(alert.confidence)} Conf
                      </span>
                      <span className="text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded-full border border-border">
                        {alert.bedId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex-1 bg-primary text-white hover:bg-primary/90 text-[11px] font-semibold py-1.5 rounded transition-colors"
                      >
                        On my way
                      </button>
                      <button 
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex-1 bg-background hover:bg-border text-text-muted hover:text-text-primary text-[11px] font-medium py-1.5 rounded transition-colors"
                      >
                        Dismiss
                      </button>
                      <button 
                        onClick={() => navigate(`/patient/${alert.patientId}`)}
                        className="w-8 h-8 flex flex-shrink-0 items-center justify-center bg-primary-light hover:bg-primary text-primary hover:text-white rounded transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
