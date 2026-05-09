import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { ThemeProvider } from './context/ThemeContext';
import Overview from './pages/Overview';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Alerts from './pages/Alerts';
import AiLab from './pages/AiLab';

export default function App() {
  return (
    <ThemeProvider>
      <PatientProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patient/:id" element={<PatientDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/ailab" element={<AiLab />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PatientProvider>
    </ThemeProvider>
  );
}
