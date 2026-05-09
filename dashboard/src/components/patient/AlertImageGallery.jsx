import { useState } from 'react';
import { format } from 'date-fns';
import { Image as ImageIcon, X } from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { classLabel, formatConfidence, classColor } from '../../utils/formatters';

export default function AlertImageGallery({ patientId }) {
  const { alerts } = usePatients();
  const patientAlerts = alerts.filter(a => a.patientId === patientId);
  const [modalImage, setModalImage] = useState(null);

  return (
    <div className="glass-card rounded-2xl p-6 mt-8">
      <h3 className="text-sm font-bold text-text-primary tracking-wide mb-6 uppercase">Incident Evidence Logs</h3>
      
      {patientAlerts.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-border text-text-muted text-xs font-medium italic">
          No automated captures recorded for this session.
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
          {patientAlerts.map(alert => {
            const cColor = classColor(alert.classification);
            return (
              <div key={alert.id} className="snap-start shrink-0 w-72 glass-card border-primary/10 rounded-2xl overflow-hidden group shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                <div 
                  className="h-44 bg-slate-100 flex items-center justify-center cursor-pointer relative overflow-hidden"
                  onClick={() => setModalImage(alert)}
                >
                  <ImageIcon className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white uppercase tracking-widest bg-primary/80 px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      Analyze Frame
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      cColor === 'danger' ? 'bg-danger text-white' : 'bg-warning text-white'
                    }`}>
                      {classLabel(alert.classification)}
                    </span>
                    <span className="text-[10px] text-primary font-bold bg-primary-light px-2 py-1 rounded-lg">
                      {formatConfidence(alert.confidence)} Match
                    </span>
                  </div>
                  <p className="text-xs text-text-primary mb-1 font-bold tracking-tight">{format(alert.timestamp, "d MMM yyyy, HH:mm:ss")}</p>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{alert.bedId}</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${alert.acknowledged ? 'bg-safe' : 'bg-danger animate-pulse'}`} />
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${alert.acknowledged ? 'text-safe' : 'text-danger'}`}>
                        {alert.acknowledged ? 'Verified' : 'Unchecked'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {modalImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setModalImage(null)}>
          <div className="relative max-w-4xl w-full bg-surface rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors z-10" onClick={() => setModalImage(null)}>
              <X className="w-5 h-5" />
            </button>
            <div className="w-full aspect-video bg-slate-200 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-slate-400" />
            </div>
            <div className="p-4 bg-surface border-t border-border flex justify-between items-center">
              <div>
                <p className="font-bold text-text-primary">{classLabel(modalImage.classification)}</p>
                <p className="text-sm text-text-muted">{format(modalImage.timestamp, "d MMM yyyy, HH:mm")} • {formatConfidence(modalImage.confidence)} Confidence</p>
              </div>
              {!modalImage.acknowledged && (
                <button className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  Acknowledge Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
