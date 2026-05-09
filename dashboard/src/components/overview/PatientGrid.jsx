import { motion, AnimatePresence } from 'framer-motion';
import { usePatients } from '../../context/PatientContext';
import PatientCard from './PatientCard';

export default function PatientGrid({ onSelect }) {
  const { patients, getPriorityScore } = usePatients();

  // Sort patients by priority score descending
  const sortedPatients = [...patients].sort((a, b) => getPriorityScore(b.id) - getPriorityScore(a.id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {sortedPatients.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <PatientCard patient={p} onSelect={onSelect} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
