import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import AlertsTable from '../components/alerts/AlertsTable';

export default function Alerts() {
  return (
    <Layout title="Historical Alerts" fullBleed={true}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="w-full p-6 lg:p-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-2">System Alerts</h2>
          <p className="text-text-muted text-sm">Review, filter, and acknowledge historical bed exit alerts across all wards.</p>
        </div>
        <AlertsTable />
      </motion.div>
    </Layout>
  );
}
