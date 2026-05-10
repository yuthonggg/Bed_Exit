import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { ChevronRight, TrendingUp, TrendingDown, AlertCircle, Clock, User, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '../ui/StatusBadge';
import { usePatients } from '../../context/PatientContext';

export default function PatientCard({ patient, onSelect }) {
  const { streams, getPatientStatus, getRiskTrend, getPatientDataSource } = usePatients();
  const data = streams[patient.id] || [];
  const status = getPatientStatus(patient.id);
  const trend = getRiskTrend(patient.id);
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const dataSource = getPatientDataSource(patient.id);

  const isAlert = status === 'alert';
  const isRisk = status === 'at_risk';

  const getStatusColor = () => {
    if (isAlert) return '#EF4444';
    if (isRisk) return '#F59E0B';
    return '#10B981';
  };

  return (
    <motion.div 
      onClick={() => onSelect(patient.id)}
      initial={false}
      animate={{ 
        height: isAlert ? 'auto' : isRisk ? '220px' : '180px',
        scale: isAlert ? 1.02 : 1,
        borderColor: isAlert ? 'rgba(239, 68, 68, 0.4)' : isRisk ? 'rgba(245, 158, 11, 0.2)' : 'rgba(226, 232, 240, 0.5)',
        opacity: !isAlert && !isRisk ? 0.75 : 1,
        filter: !isAlert && !isRisk ? 'grayscale(0.2)' : 'grayscale(0)'
      }}
      className={`glass-card rounded-[1.5rem] p-4 hover:shadow-xl transition-all duration-500 cursor-pointer group border-2 relative overflow-hidden ${
        isAlert ? 'ring-4 ring-red-500/10' : ''
      }`}
    >
      {isAlert && (
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-red-50/20 pointer-events-none" 
        />
      )}

      <div className="flex justify-between items-start relative z-10">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAlert ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-extrabold tracking-tight transition-colors ${isAlert ? 'text-red-700' : 'text-[#1E293B] group-hover:text-primary'}`}>
              {patient.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50">
                {patient.bedId}
              </span>
              <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                dataSource === 'live'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : dataSource === 'waiting'
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200/50'
              }`}>
                <Radio className="w-2.5 h-2.5" />
                {dataSource === 'live' ? 'Live' : dataSource === 'waiting' ? 'Waiting' : 'Sim'}
              </span>
              <div className="flex items-center gap-1">
                {trend === 'increasing' ? <TrendingUp className="w-2.5 h-2.5 text-red-500" /> : <TrendingDown className="w-2.5 h-2.5 text-emerald-500" />}
                <span className={`text-[8px] font-black uppercase ${trend === 'increasing' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isAlert ? '+24% Velocity' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="mt-4 space-y-3 relative z-10">
        <div className={`w-full bg-slate-50/30 rounded-xl flex items-center justify-center overflow-hidden relative border border-slate-200/30 ${isAlert ? 'h-24' : 'h-14'}`}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, bottom: 10 }}>
                <defs>
                  <filter id={`glow-${patient.id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <YAxis domain={['auto', 'auto']} hide />
                <Line 
                  type="monotone" 
                  dataKey="displayX" 
                  stroke={getStatusColor()} 
                  strokeWidth={isAlert ? 4 : 2} 
                  dot={false} 
                  isAnimationActive={false}
                  filter={isAlert ? `url(#glow-${patient.id})` : ''}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-slate-300 animate-ping" />
            </div>
          )}
        </div>

        {isAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 rounded-lg py-2 px-3 flex items-center justify-between text-white shadow-lg shadow-red-100"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">Unsafe Exit Detected</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 relative z-10">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {latest ? `${latest.time}` : 'Syncing'}
          </span>
        </div>
        <button className="text-[10px] font-black text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all uppercase tracking-widest">
          {isAlert ? 'Respond' : 'View'} <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </motion.div>
  );
}
