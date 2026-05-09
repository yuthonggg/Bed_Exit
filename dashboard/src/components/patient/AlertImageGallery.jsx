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
    <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Captured Alert Images</h3>
      
      {patientAlerts.length === 0 ? (
        <div className="py-8 text-center bg-background rounded-lg border border-dashed border-border text-text-muted text-sm">
          No alert images captured yet
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {patientAlerts.map(alert => {
            const cColor = classColor(alert.classification);
            return (
              <div key={alert.id} className="snap-start shrink-0 w-64 bg-background border border-border rounded-lg overflow-hidden group">
                <div 
                  className="h-36 bg-slate-200 flex items-center justify-center cursor-pointer relative overflow-hidden"
                  onClick={() => setModalImage(alert)}
                >
                  <ImageIcon className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity">View Full Image</span>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cColor === 'danger' ? 'bg-danger-light text-danger' : cColor === 'warning' ? 'bg-warning-light text-warning' : 'bg-safe-light text-safe'
                    }`}>
                      {classLabel(alert.classification)}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium">{formatConfidence(alert.confidence)}</span>
                  </div>
                  <p className="text-[11px] text-text-primary mb-0.5 font-medium">{format(alert.timestamp, "d MMM yyyy, HH:mm")}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[10px] text-text-muted">{alert.bedId}</p>
                    <p className={`text-[10px] font-semibold ${alert.acknowledged ? 'text-safe' : 'text-danger'}`}>
                      {alert.acknowledged ? 'Acknowledged' : 'Pending'}
                    </p>
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
