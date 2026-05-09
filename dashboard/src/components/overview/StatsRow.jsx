import { Users, AlertTriangle, ShieldCheck, BedDouble } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePatients } from '../../context/PatientContext';

export default function StatsRow() {
  const { patients, alerts, getPatientStatus } = usePatients();
  const unack = alerts.filter(a => !a.acknowledged).length;
  const safeCount = patients.filter(p => getPatientStatus(p.id) === 'safe').length;

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-primary', bg: 'bg-primary-light' },
    { label: 'Active Alerts', value: unack, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-light', pulse: unack > 0 },
    { label: 'Safe Patients', value: safeCount, icon: ShieldCheck, color: 'text-safe', bg: 'bg-safe-light' },
    { label: 'Beds Monitored', value: patients.length, icon: BedDouble, color: 'text-text-muted', bg: 'bg-primary-light/50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((s, i) => (
        <motion.div 
          key={s.label} 
          initial={{ opacity:0, y:20 }} 
          animate={{ opacity:1, y:0 }} 
          transition={{ delay: i*0.1 }}
          className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 h-40 flex flex-col justify-between hover:shadow-xl hover:border-primary/20 transition-all duration-500 group relative overflow-hidden"
        >
          {s.pulse && (
            <motion.div 
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-red-500/10 pointer-events-none" 
            />
          )}
          
          <div className="flex items-center justify-between relative z-10">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm`}>
              <s.icon className={`w-7 h-7 ${s.color}`} />
            </div>
            {s.pulse && (
              <div className="relative">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-ping opacity-25" />
                <div className="absolute inset-0 w-4 h-4 bg-red-600 rounded-full" />
              </div>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{s.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{s.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
