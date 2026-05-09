import { useMemo } from 'react';

const EPS = 0.0001;
const CLAMP = 10;
const clamp = (v) => Math.max(-CLAMP, Math.min(CLAMP, v));

export function useDerivatives(rawData) {
  return useMemo(() => {
    if (rawData.length < 3) return rawData.map(p => ({ ...p, dydx: 0, d2ydx2: 0, dxdy: 0, d2xdy2: 0 }));

    return rawData.map((pt, i) => {
      if (i < 2) return { ...pt, dydx: 0, d2ydx2: 0, dxdy: 0, d2xdy2: 0 };

      const p1 = rawData[i - 1], p2 = rawData[i - 2];
      const dx = pt.x - p1.x, dy = pt.y - p1.y;
      const pdx = p1.x - p2.x, pdy = p1.y - p2.y;

      const dydx = clamp(dy / (Math.abs(dx) < EPS ? EPS : dx));
      const prevDydx = clamp(pdy / (Math.abs(pdx) < EPS ? EPS : pdx));
      const d2ydx2 = clamp((dydx - prevDydx) / (Math.abs(dx) < EPS ? EPS : dx));

      const dxdy = clamp(dx / (Math.abs(dy) < EPS ? EPS : dy));
      const prevDxdy = clamp(pdx / (Math.abs(pdy) < EPS ? EPS : pdy));
      const d2xdy2 = clamp((dxdy - prevDxdy) / (Math.abs(dy) < EPS ? EPS : dy));

      return { ...pt, dydx: +dydx.toFixed(4), d2ydx2: +d2ydx2.toFixed(4), dxdy: +dxdy.toFixed(4), d2xdy2: +d2xdy2.toFixed(4) };
    });
  }, [rawData]);
}
