import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import StatsRow from '../components/overview/StatsRow';
import AlertFeed from '../components/overview/AlertFeed';
import PatientGrid from '../components/overview/PatientGrid';

export default function Overview() {
  return (
    <Layout title="Hospital Overview">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="max-w-[1600px] mx-auto space-y-6">
        <StatsRow />
        
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text-primary mb-4">Monitored Patients</h3>
            <PatientGrid />
          </div>
          
          <div className="w-full xl:w-[400px] shrink-0">
            <AlertFeed />
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
