import { createContext, useContext } from 'react';
import { useMockPatientData } from '../hooks/useMockPatientData';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const data = useMockPatientData();
  return <PatientContext.Provider value={data}>{children}</PatientContext.Provider>;
}

export function usePatients() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatients must be inside PatientProvider');
  return ctx;
}
