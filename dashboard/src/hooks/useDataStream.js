import { useState, useEffect, useRef } from 'react';

const PATTERNS = ['resting', 'side_sleeping', 'shifting_to_edge', 'exit_attempt'];
const PATTERN_DURATION = 8000;
const UPDATE_INTERVAL = 100; // 10 Hz

function getTarget(pattern) {
  switch (pattern) {
    case 'resting':
      return { x: 50 + (Math.random() - 0.5) * 8, y: 45 + (Math.random() - 0.5) * 8 };
    case 'side_sleeping':
      return { x: 30 + Math.random() * 10, y: 42 + Math.random() * 10 };
    case 'shifting_to_edge':
      return { x: 12 + Math.random() * 6, y: 55 + Math.random() * 10 };
    case 'exit_attempt':
      return { x: 3 + Math.random() * 4, y: 75 + Math.random() * 15 };
    default:
      return { x: 50, y: 50 };
  }
}

export function useDataStream() {
  const [data, setData] = useState([]);
  const [currentPattern, setCurrentPattern] = useState('resting');
  const posRef = useRef({ x: 50, y: 45 });
  const targetRef = useRef(getTarget('resting'));
  const patternIdx = useRef(0);
  const patternStart = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();

      if (now - patternStart.current > PATTERN_DURATION) {
        patternStart.current = now;
        patternIdx.current = (patternIdx.current + 1) % PATTERNS.length;
        const next = PATTERNS[patternIdx.current];
        setCurrentPattern(next);
        targetRef.current = getTarget(next);
      }

      const alpha = PATTERNS[patternIdx.current] === 'exit_attempt' ? 0.08 : 0.04;
      const noise = () => (Math.random() - 0.5) * 1.5;
      const prev = posRef.current;
      const nx = prev.x + (targetRef.current.x - prev.x) * alpha + noise();
      const ny = prev.y + (targetRef.current.y - prev.y) * alpha + noise();
      const clamped = { x: Math.max(0, Math.min(100, nx)), y: Math.max(0, Math.min(100, ny)) };
      posRef.current = clamped;

      const timeStr = new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setData(prev => {
        const updated = [...prev, { ...clamped, timestamp: now, time: timeStr }];
        return updated.length > 200 ? updated.slice(-200) : updated;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(id);
  }, []);

  return { data, position: posRef.current, currentPattern };
}
