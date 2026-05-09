import { useState, useEffect, useRef, useCallback } from 'react';

const PATIENTS = [
  { id:'P001', name:'Ahmad Bin Ismail', age:72, gender:'Male', ward:'Ward 3A', bedId:'BED_01', diagnosis:'Post Hip Replacement', physician:'Dr. Lim Wei', admitted:'2026-05-01' },
  { id:'P002', name:'Siti Nurhaliza', age:68, gender:'Female', ward:'Ward 3A', bedId:'BED_02', diagnosis:'Pneumonia Recovery', physician:'Dr. Tan Mei', admitted:'2026-05-03' },
  { id:'P003', name:'Raj Kumar', age:81, gender:'Male', ward:'Ward 3B', bedId:'BED_03', diagnosis:'Stroke Rehabilitation', physician:'Dr. Wong Kai', admitted:'2026-04-28' },
  { id:'P004', name:'Lee Mei Ling', age:75, gender:'Female', ward:'Ward 3B', bedId:'BED_04', diagnosis:'Fractured Femur', physician:'Dr. Lim Wei', admitted:'2026-05-05' },
  { id:'P005', name:'Chen Wei Ming', age:65, gender:'Male', ward:'Ward 4A', bedId:'BED_05', diagnosis:'Cardiac Monitoring', physician:'Dr. Ahmad', admitted:'2026-05-07' },
];

const CLASSIFICATIONS = ['unsafe_exit','safe_exit','repositioning'];

function createStream(offset) {
  return { x: 50 + Math.sin(offset) * 5, y: 45 + Math.cos(offset * 0.7) * 4 };
}

export function useMockPatientData() {
  const [streams, setStreams] = useState(() => {
    const s = {};
    PATIENTS.forEach(p => { s[p.id] = []; });
    return s;
  });
  const [alerts, setAlerts] = useState([]);
  const tickRef = useRef(0);
  const alertTimer = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current * 0.05;
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

      setStreams(prev => {
        const next = { ...prev };
        PATIENTS.forEach((p, idx) => {
          const phase = t + idx * 2;
          const pattern = Math.floor((tickRef.current + idx * 40) / 80) % 4;
          let x, y;
          if (pattern === 0) { x = 50 + Math.sin(phase)*3 + (Math.random()-0.5)*1; y = 45 + Math.cos(phase)*2 + (Math.random()-0.5)*1; }
          else if (pattern === 1) { x = 35 + Math.sin(phase)*4; y = 42 + Math.cos(phase)*3; }
          else if (pattern === 2) { x = 20 + Math.sin(phase)*3; y = 55 + Math.cos(phase)*4; }
          else { x = 10 + Math.sin(phase)*2; y = 70 + Math.cos(phase)*5; }
          const arr = [...(prev[p.id] || []), { x, y, timestamp: now, time: timeStr }];
          next[p.id] = arr.length > 120 ? arr.slice(-120) : arr;
        });
        return next;
      });

      alertTimer.current += 1;
      if (alertTimer.current >= 60 + Math.floor(Math.random()*60)) {
        alertTimer.current = 0;
        const rp = PATIENTS[Math.floor(Math.random()*PATIENTS.length)];
        const cls = CLASSIFICATIONS[Math.floor(Math.random()*3)];
        setAlerts(prev => [{
          id: `ALT-${now}`,
          patientId: rp.id,
          patientName: rp.name,
          bedId: rp.bedId,
          ward: rp.ward,
          classification: cls,
          confidence: 0.75 + Math.random()*0.24,
          timestamp: now,
          imageUrl: null,
          acknowledged: false,
        }, ...prev].slice(0, 50));
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }, []);

  const acknowledgeAll = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  }, []);

  const getPatientStatus = useCallback((patientId) => {
    const d = streams[patientId];
    if (!d || d.length === 0) return 'safe';
    const last = d[d.length - 1];
    const dist = Math.sqrt(Math.pow(last.x - 50, 2) + Math.pow(last.y - 50, 2));
    if (dist > 35) return 'alert';
    if (dist > 20) return 'at_risk';
    return 'safe';
  }, [streams]);

  return { patients: PATIENTS, streams, alerts, acknowledgeAlert, acknowledgeAll, getPatientStatus };
}
