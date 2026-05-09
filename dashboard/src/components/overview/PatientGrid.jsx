import { usePatients } from '../../context/PatientContext';
import PatientCard from './PatientCard';

export default function PatientGrid() {
  const { patients } = usePatients();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {patients.map(p => (
        <PatientCard key={p.id} patient={p} />
      ))}
    </div>
  );
}
