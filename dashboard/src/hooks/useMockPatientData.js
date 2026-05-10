import { useState, useEffect, useRef, useCallback } from 'react';

const PATIENTS = [
  { id:'P001', name:'Ahmad Bin Ismail', age:72, gender:'Male', ward:'Ward 3A', bedId:'BED_01', diagnosis:'Post Hip Replacement', physician:'Dr. Lim Wei', admitted:'2026-05-01', dataSource:'real' },
  { id:'P002', name:'Siti Nurhaliza', age:68, gender:'Female', ward:'Ward 3A', bedId:'BED_02', diagnosis:'Pneumonia Recovery', physician:'Dr. Tan Mei', admitted:'2026-05-03', dataSource:'synthetic' },
  { id:'P003', name:'Raj Kumar', age:81, gender:'Male', ward:'Ward 3B', bedId:'BED_03', diagnosis:'Stroke Rehabilitation', physician:'Dr. Wong Kai', admitted:'2026-04-28', dataSource:'synthetic' },
  { id:'P004', name:'Lee Mei Ling', age:75, gender:'Female', ward:'Ward 3B', bedId:'BED_04', diagnosis:'Fractured Femur', physician:'Dr. Lim Wei', admitted:'2026-05-05', dataSource:'synthetic' },
  { id:'P005', name:'Chen Wei Ming', age:65, gender:'Male', ward:'Ward 4A', bedId:'BED_05', diagnosis:'Cardiac Monitoring', physician:'Dr. Ahmad', admitted:'2026-05-07', dataSource:'synthetic' },
  { id:'P006', name:'Noraini Binti Yusof', age:79, gender:'Female', ward:'Ward 4A', bedId:'BED_06', diagnosis:'Post Fall Observation', physician:'Dr. Tan Mei', admitted:'2026-05-08', dataSource:'synthetic' },
  { id:'P007', name:'Goh Jun Hao', age:70, gender:'Male', ward:'Ward 4B', bedId:'BED_07', diagnosis:'Diabetes Monitoring', physician:'Dr. Ahmad', admitted:'2026-05-06', dataSource:'synthetic' },
  { id:'P008', name:'Mariam Abdullah', age:83, gender:'Female', ward:'Ward 4B', bedId:'BED_08', diagnosis:'Dementia Care', physician:'Dr. Wong Kai', admitted:'2026-05-02', dataSource:'synthetic' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const BED_MAP_BALANCE_RANGE = 28;
const BED_MAP_DEAD_ZONE = 0.03;
const BED_MAP_MIN = 18;
const BED_MAP_MAX = 82;

const SYNTHETIC_PROFILES = {
  P002: { mobility: 0.38, exitBias: 0.10, cycleOffset: 10, side: -1 },
  P003: { mobility: 0.24, exitBias: 0.05, cycleOffset: 36, side: 1 },
  P004: { mobility: 0.48, exitBias: 0.14, cycleOffset: 64, side: -1 },
  P005: { mobility: 0.22, exitBias: 0.04, cycleOffset: 88, side: 1 },
  P006: { mobility: 0.58, exitBias: 0.20, cycleOffset: 116, side: -1 },
  P007: { mobility: 0.32, exitBias: 0.08, cycleOffset: 144, side: 1 },
  P008: { mobility: 0.52, exitBias: 0.18, cycleOffset: 172, side: -1 },
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function movementState(step, profile) {
  const phase = (step + profile.cycleOffset) % 240;
  if (phase < 95) return 'resting';
  if (phase < 145) return 'repositioning';
  if (phase < 205) return 'edge_shift';
  return profile.exitBias > 0.12 ? 'exit_attempt' : 'recovery';
}

function targetForState(state, profile, t) {
  const breathing = Math.sin(t * 1.7 + profile.cycleOffset) * 1.5;
  const drift = Math.cos(t * 0.8 + profile.cycleOffset) * 1.2;

  if (state === 'resting') {
    return {
      x: 50 + breathing * profile.mobility,
      y: 47 + drift * profile.mobility,
    };
  }

  if (state === 'repositioning') {
    return {
      x: 50 + profile.side * (10 + 10 * profile.mobility) + breathing,
      y: 48 + drift * 2,
    };
  }

  if (state === 'edge_shift') {
    return {
      x: 50 + profile.side * (23 + 16 * profile.mobility) + breathing,
      y: 56 + 10 * profile.mobility + drift,
    };
  }

  if (state === 'exit_attempt') {
    return {
      x: 50 + profile.side * (39 + 10 * profile.mobility) + breathing,
      y: 72 + 12 * profile.mobility + drift,
    };
  }

  return {
    x: 50 + profile.side * 10 + breathing,
    y: 52 + drift,
  };
}

function classifyRisk(x, y, speed, profile) {
  const distance = Math.hypot(x - 50, y - 50);
  const risk = distance * 0.7 + speed * 1.8 + profile.exitBias * 25;
  const zScore = (risk - 24) / 8;
  const status = zScore > 2 ? 'Critical' : zScore > 1 ? 'Warning' : 'Safe';
  return { risk: +risk.toFixed(2), zScore: +zScore.toFixed(2), status };
}

function balanceToDisplayCoordinate(value, invert = false) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 50;

  // Display-only mapping for bed-map marker. Raw x/y remains untouched.
  const boundedBalance = clamp(number, -1, 1);
  const adjustedBalance = Math.abs(boundedBalance) < BED_MAP_DEAD_ZONE ? 0 : boundedBalance;
  const signed = invert ? -adjustedBalance : adjustedBalance;
  return clamp(50 + signed * BED_MAP_BALANCE_RANGE, BED_MAP_MIN, BED_MAP_MAX);
}

export function useMockPatientData() {
  const [streams, setStreams] = useState(() => {
    const s = {};
    PATIENTS.forEach(p => { s[p.id] = []; });
    return s;
  });
  const [alerts, setAlerts] = useState([]);
  const tickRef = useRef(0);
  const syntheticAlertCooldown = useRef({});

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current * 0.05;
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
      const generatedAlerts = [];

      setStreams(prev => {
        const next = { ...prev };
        PATIENTS.forEach((p, idx) => {
          if (p.dataSource === 'real') return;

          const profile = SYNTHETIC_PROFILES[p.id] || { mobility: 0.3, exitBias: 0.08, cycleOffset: idx * 30, side: idx % 2 ? -1 : 1 };
          const state = movementState(tickRef.current, profile);
          const target = targetForState(state, profile, t);
          const previous = (prev[p.id] || []).at(-1) || { x: 50, y: 47 };
          const response = state === 'exit_attempt' ? 0.16 : state === 'edge_shift' ? 0.09 : 0.05;
          const x = clamp(previous.x + (target.x - previous.x) * response);
          const y = clamp(previous.y + (target.y - previous.y) * response);
          const speed = Math.hypot(x - previous.x, y - previous.y);
          const { risk, zScore, status } = classifyRisk(x, y, speed, profile);
          const arr = [...(prev[p.id] || []), {
            x,
            y,
            displayX: x,
            displayY: y,
            risk,
            zScore,
            status,
            movementState: state,
            timestamp: now,
            time: timeStr,
            dataSource: p.dataSource
          }];
          next[p.id] = arr.length > 120 ? arr.slice(-120) : arr;

          const cooldownUntil = syntheticAlertCooldown.current[p.id] || 0;
          if (state === 'exit_attempt' && status === 'Critical' && now > cooldownUntil) {
            syntheticAlertCooldown.current[p.id] = now + 90000;
            generatedAlerts.push({
              id: `ALT-${p.id}-${now}`,
              patientId: p.id,
              patientName: p.name,
              bedId: p.bedId,
              ward: p.ward,
              classification: 'unsafe_exit',
              confidence: Math.min(0.98, 0.78 + profile.mobility * 0.22),
              timestamp: now,
              imageUrl: null,
              acknowledged: false,
            });
          }
        });
        return next;
      });

      if (generatedAlerts.length > 0) {
        setAlerts(prev => [...generatedAlerts, ...prev].slice(0, 50));
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBackendEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events?limit=50`);
        if (!response.ok) return;

        const events = await response.json();
        if (cancelled) return;

        const mappedAlerts = events.map(event => {
          const patient = PATIENTS.find(p => p.bedId === event.bed_id) || PATIENTS[0];
          const imageUrl = event.image_path
            ? event.image_path.startsWith('http')
              ? event.image_path
              : `${API_BASE_URL}${event.image_path}`
            : null;

          return {
            id: event.id,
            patientId: patient.id,
            patientName: patient.name,
            bedId: event.bed_id,
            ward: patient.ward,
            classification: event.classification,
            confidence: event.confidence,
            timestamp: new Date(event.timestamp).getTime(),
            imageUrl,
            sensorData: event.sensor_data,
            acknowledged: Boolean(event.acknowledged),
          };
        });

        setAlerts(prev => {
          const mockAlerts = prev.filter(alert => typeof alert.id === 'string' && alert.id.startsWith('ALT-'));
          const merged = [...mappedAlerts, ...mockAlerts];
          const seen = new Set();
          return merged.filter(alert => {
            if (seen.has(alert.id)) return false;
            seen.add(alert.id);
            return true;
          }).slice(0, 50);
        });
      } catch {
        // Keep simulated dashboard data available if the backend is offline.
      }
    };

    loadBackendEvents();
    const id = setInterval(loadBackendEvents, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSensorReadings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/sensor-readings?bed_id=BED_01&limit=120`);
        if (!response.ok) return;

        const readings = await response.json();
        if (cancelled || readings.length === 0) return;

        const realStream = readings.map(reading => {
          const timestamp = new Date(reading.timestamp).getTime();
          const rawX = Number(reading.x);
          const rawY = Number(reading.y);
          return {
            x: rawX,
            y: rawY,
            displayX: balanceToDisplayCoordinate(rawX, true),
            displayY: balanceToDisplayCoordinate(rawY, true),
            risk: reading.risk == null ? null : Number(reading.risk),
            zScore: reading.z_score == null ? null : Number(reading.z_score),
            status: reading.status,
            timestamp,
            time: new Date(timestamp).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
            dataSource: 'real',
          };
        });

        setStreams(prev => ({ ...prev, P001: realStream }));
      } catch {
        // Keep the simulated stream if the backend is offline.
      }
    };

    loadSensorReadings();
    const id = setInterval(loadSensorReadings, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    if (typeof alertId === 'number') {
      fetch(`${API_BASE_URL}/api/events/${alertId}/acknowledge`, { method: 'PATCH' }).catch(() => {});
    }
  }, []);

  const acknowledgeAll = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  }, []);

  const getRiskTrend = useCallback((patientId) => {
    const d = streams[patientId];
    if (!d || d.length < 30) return 'stable';
    const recent = d.slice(-15);
    const older = d.slice(-30, -15);
    const distance = point => Math.hypot((point.displayX ?? point.x) - 50, (point.displayY ?? point.y) - 50);
    const recentDist = recent.reduce((acc, p) => acc + distance(p), 0) / 15;
    const olderDist = older.reduce((acc, p) => acc + distance(p), 0) / 15;
    if (recentDist > olderDist * 1.3) return 'increasing';
    if (recentDist < olderDist * 0.7) return 'decreasing';
    return 'stable';
  }, [streams]);

  const getPatientStatus = useCallback((patientId) => {
    // Check for unacknowledged critical alerts (Only unsafe_exit)
    const hasActiveAlert = alerts.some(a => a.patientId === patientId && !a.acknowledged && a.classification === 'unsafe_exit');
    if (hasActiveAlert) return 'alert';

    const d = streams[patientId];
    if (!d || d.length === 0) return 'safe';
    const last = d[d.length - 1];
    if (last.status === 'Critical') return 'at_risk';
    const dist = Math.hypot((last.displayX ?? last.x) - 50, (last.displayY ?? last.y) - 50);
    
    // Only use distance for 'at_risk' (amber), 'alert' (red) is strictly event-driven now
    if (dist > 20) return 'at_risk';
    return 'safe';
  }, [streams, alerts]);

  const getPriorityScore = useCallback((patientId) => {
    const status = getPatientStatus(patientId);
    const trend = getRiskTrend(patientId);
    let score = 0;
    if (status === 'alert') score += 1000;
    if (status === 'at_risk') score += 500;
    if (trend === 'increasing') score += 200;
    return score;
  }, [getPatientStatus, getRiskTrend]);

  const getPatientDataSource = useCallback((patientId) => {
    const patient = PATIENTS.find(p => p.id === patientId);
    const stream = streams[patientId] || [];
    const hasRecentRealData = stream.some(point => point.dataSource === 'real');
    if (patient?.dataSource === 'real' && hasRecentRealData) return 'live';
    if (patient?.dataSource === 'real') return 'waiting';
    return 'synthetic';
  }, [streams]);

  return { patients: PATIENTS, streams, alerts, acknowledgeAlert, acknowledgeAll, getPatientStatus, getRiskTrend, getPriorityScore, getPatientDataSource };
}
