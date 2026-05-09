import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import { usePatients } from '../../context/PatientContext';

export default function PatientCard({ patient }) {
  const navigate = useNavigate();
  const { streams, getPatientStatus } = usePatients();
  const data = streams[patient.id] || [];
  const status = getPatientStatus(patient.id);
  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div 
      onClick={() => navigate(`/patient/${patient.id}`)}
      className="bg-surface rounded-xl shadow-sm border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">{patient.name}</h3>
          <p className="text-xs text-text-muted mt-0.5">{patient.ward} • {patient.bedId}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="h-12 w-full mt-2 mb-3 bg-background/50 rounded flex items-center justify-center overflow-hidden">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line 
                type="monotone" 
                dataKey="x" 
                stroke={status === 'alert' ? '#DC2626' : status === 'at_risk' ? '#D97706' : '#16A34A'} 
                strokeWidth={1.5} 
                dot={false} 
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <span className="text-[10px] text-text-muted uppercase tracking-wider">No Data</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
        <span className="text-xs text-text-muted">
          Last mvmt: {latest ? latest.time : '--:--'}
        </span>
        <button className="text-xs font-medium text-primary flex items-center gap-1 group-hover:underline">
          View Details <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
