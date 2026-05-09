import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import { usePatients } from '../../context/PatientContext';

export default function PatientHeader({ patient }) {
  const navigate = useNavigate();
  const { getPatientStatus } = usePatients();
  const status = getPatientStatus(patient.id);

  const initials = patient.name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-5 mb-6">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary text-xl font-bold shrink-0">
          {initials}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">{patient.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
                <span>{patient.age} yrs • {patient.gender}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{patient.ward} • {patient.bedId}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Admitted: {patient.admitted}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Primary Diagnosis</p>
              <p className="text-sm font-medium text-text-primary">{patient.diagnosis}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Attending Physician</p>
              <p className="text-sm font-medium text-text-primary">{patient.physician}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
