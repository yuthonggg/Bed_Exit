import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientHeader from '../components/patient/PatientHeader';
import BedMap from '../components/patient/BedMap';
import SixGraphGrid from '../components/patient/SixGraphGrid';
import MasterComparisonChart from '../components/patient/MasterComparisonChart';
import AlertImageGallery from '../components/patient/AlertImageGallery';
import RestlessnessIndex from '../components/patient/RestlessnessIndex';
import MetricGraph from '../components/patient/MetricGraph';
import { usePatients } from '../context/PatientContext';
import { useDerivatives } from '../hooks/useDerivatives';

export default function PatientDetail() {
  const { id } = useParams();
  const { patients, streams } = usePatients();
  const [viewMode, setViewMode] = useState('behavioral');
  
  const patient = patients.find(p => p.id === id);
  const rawData = streams[id] || [];
  const enrichedData = useDerivatives(rawData);
  
  if (!patient) return <Navigate to="/" />;

  const position = rawData.length > 0 ? rawData[rawData.length - 1] : { x: 50, y: 50 };

  return (
    <Layout title={`${patient.name} Analysis`}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="max-w-[1600px] mx-auto pb-12">
        <PatientHeader patient={patient} />
        
        {/* Toggle Bar - Segmented Control */}
        <div className="flex justify-end mb-8">
          <div className="bg-slate-200/50 p-1 rounded-2xl flex items-center relative w-72 h-11 border border-border/50">
            <motion.div 
              className="absolute bg-white rounded-xl shadow-md h-9"
              initial={false}
              animate={{ 
                x: viewMode === 'behavioral' ? 0 : '100%',
                width: '50%'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
              onClick={() => setViewMode('behavioral')} 
              className={`flex-1 flex items-center justify-center gap-2 relative z-10 text-xs font-bold transition-colors duration-300 ${viewMode === 'behavioral' ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Activity className="w-3.5 h-3.5" /> Behavioral View
            </button>
            <button 
              onClick={() => setViewMode('kinematic')} 
              className={`flex-1 flex items-center justify-center gap-2 relative z-10 text-xs font-bold transition-colors duration-300 ${viewMode === 'kinematic' ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Zap className="w-3.5 h-3.5" /> Kinematic Analysis
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 mb-8">
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {viewMode === 'behavioral' ? (
                <motion.div key="behavioral" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <MetricGraph data={enrichedData} dataKey="x" label="Lateral Displacement (X)" color="#0052CC" delay={0} />
                    <MetricGraph data={enrichedData} dataKey="y" label="Longitudinal Position (Y)" color="#10B981" delay={0.05} />
                  </div>
                  <RestlessnessIndex data={enrichedData} />
                </motion.div>
              ) : (
                <motion.div key="kinematic" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                  <SixGraphGrid data={enrichedData} />
                  <MasterComparisonChart data={enrichedData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="w-full xl:w-[360px] shrink-0">
            <BedMap position={position} />
          </div>
        </div>

        <AlertImageGallery patientId={patient.id} />
      </motion.div>
    </Layout>
  );
}
