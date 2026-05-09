import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Users, BedDouble } from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatsRow from '../components/overview/StatsRow';
import AlertFeed from '../components/overview/AlertFeed';
import PatientGrid from '../components/overview/PatientGrid';
import EmergencyPopup from '../components/overview/EmergencyPopup';
import PatientDrawer from '../components/overview/PatientDrawer';
import { usePatients } from '../context/PatientContext';

export default function Overview() {
  const { patients, alerts } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const unackAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <Layout title="AI Clinical Command Center" fullBleed={true}>
      <div className="h-full bg-[#F8FAFC] overflow-y-auto p-6 lg:p-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-10"
        >
          {/* Global Status Header - Expanded */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#0052CC] rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,82,204,0.3)] border-4 border-white">
                <Activity className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Ward Intelligence Feed</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-[0.1em] bg-white px-3 py-1 rounded-full border border-slate-200/50 shadow-sm">
                    <Users className="w-3.5 h-3.5 text-primary" /> {patients.length} Monitored Patients
                  </span>
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-[0.1em] bg-white px-3 py-1 rounded-full border border-slate-200/50 shadow-sm">
                    <BedDouble className="w-3.5 h-3.5 text-primary" /> Units 3A & 4A Active
                  </span>
                </div>
              </div>
            </div>

            {unackAlerts.length > 0 && (
              <motion.div 
                animate={{ x: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-white border-2 border-red-200 rounded-[2rem] px-8 py-4 flex items-center gap-6 shadow-[0_15px_30px_rgba(239,68,68,0.1)]"
              >
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                  <ShieldAlert className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-black text-red-700 leading-none">Emergency Response Active</p>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1.5">{unackAlerts.length} Critical Incidents Unresolved</p>
                </div>
              </motion.div>
            )}
          </div>

          <StatsRow />
          
          <div className="flex flex-col xl:flex-row gap-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Active Surveillance Grid</h3>
                <div className="h-[2px] flex-1 bg-slate-200 mx-10" />
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority Ranking Engaged</span>
                </div>
              </div>
              <PatientGrid onSelect={(id) => setSelectedPatientId(id)} />
            </div>
            
            <div className="w-full xl:w-[480px] shrink-0 sticky top-10 self-start">
              <AlertFeed />
            </div>
          </div>
        </motion.div>

        {/* Global Floating Elements */}
        <EmergencyPopup />
        <PatientDrawer 
          patientId={selectedPatientId} 
          onClose={() => setSelectedPatientId(null)} 
        />
      </div>
    </Layout>
  );
}
