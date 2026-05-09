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
    { label: 'Beds Monitored', value: patients.length, icon: BedDouble, color: 'text-text-muted', bg: 'bg-background' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
          className="bg-surface rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            {s.pulse && <div className="w-2.5 h-2.5 bg-danger rounded-full animate-pulse-live" />}
          </div>
          <p className="text-2xl font-bold text-text-primary">{s.value}</p>
          <p className="text-xs text-text-muted mt-1">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
