import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Beaker } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('simple');
  
  const patient = patients.find(p => p.id === id);
  const rawData = streams[id] || [];
  const enrichedData = useDerivatives(rawData);
  
  if (!patient) return <Navigate to="/" />;

  const position = rawData.length > 0 ? rawData[rawData.length - 1] : { x: 50, y: 50 };

  return (
    <Layout title={`Patient Detail: ${patient.id}`}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="max-w-[1600px] mx-auto">
        <PatientHeader patient={patient} />
        
        {/* Toggle Bar */}
        <div className="flex justify-end mb-4">
          <div className="bg-surface border border-border rounded-lg p-1 flex shadow-sm">
            <button 
              onClick={() => setViewMode('simple')} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'simple' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Activity className="w-4 h-4" /> Simple View
            </button>
            <button 
              onClick={() => setViewMode('advanced')} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'advanced' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Beaker className="w-4 h-4" /> Calculus View
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 mb-6">
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {viewMode === 'simple' ? (
                <motion.div key="simple" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <MetricGraph data={enrichedData} dataKey="x" label="X Position (Left/Right)" color="#2563EB" delay={0} />
                    <MetricGraph data={enrichedData} dataKey="y" label="Y Position (Head/Foot)" color="#16A34A" delay={0.05} />
                  </div>
                  <RestlessnessIndex data={enrichedData} />
                </motion.div>
              ) : (
                <motion.div key="advanced" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <SixGraphGrid data={enrichedData} />
                  <MasterComparisonChart data={enrichedData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="w-full xl:w-[320px] shrink-0 h-[450px] xl:h-auto">
            <BedMap position={position} />
          </div>
        </div>

        <AlertImageGallery patientId={patient.id} />
      </motion.div>
    </Layout>
  );
}
