import { useMemo } from 'react';

const EPS = 0.000001;
const SLOPE_CLAMP = 10;
const SECOND_DERIVATIVE_CLAMP = 10;
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
const round = value => Number.isFinite(value) ? +value.toFixed(3) : 0;

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function sortedValidPoints(rawData) {
  return (rawData || [])
    .filter(point => point && Number.isFinite(Number(point.timestamp)))
    .map(point => ({
      ...point,
      x: safeNumber(point.x),
      y: safeNumber(point.y),
      timestamp: Number(point.timestamp),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function firstDerivative(points, index, yKey, xKey) {
  const current = points[index];
  const previous = points[index - 1];
  const next = points[index + 1];

  const left = previous || current;
  const right = next || current;
  const denominator = safeNumber(right[xKey]) - safeNumber(left[xKey]);
  if (Math.abs(denominator) < EPS) return 0;

  return (safeNumber(right[yKey]) - safeNumber(left[yKey])) / denominator;
}

export function useDerivatives(rawData) {
  return useMemo(() => {
    const points = sortedValidPoints(rawData);
    if (points.length === 0) return [];

    const slopes = points.map((_, index) => ({
      dydx: clamp(firstDerivative(points, index, 'y', 'x'), SLOPE_CLAMP),
      dxdy: clamp(firstDerivative(points, index, 'x', 'y'), SLOPE_CLAMP),
    }));

    return points.map((point, index) => {
      const previous = points[index - 1];
      const next = points[index + 1];
      const left = previous || point;
      const right = next || point;
      const slopeLeft = slopes[index - 1] || slopes[index];
      const slopeRight = slopes[index + 1] || slopes[index];

      const dx = safeNumber(right.x) - safeNumber(left.x);
      const dy = safeNumber(right.y) - safeNumber(left.y);
      const d2ydx2 = Math.abs(dx) < EPS ? 0 : (slopeRight.dydx - slopeLeft.dydx) / dx;
      const d2xdy2 = Math.abs(dy) < EPS ? 0 : (slopeRight.dxdy - slopeLeft.dxdy) / dy;

      return {
        ...point,
        dydx: round(slopes[index].dydx),
        d2ydx2: round(clamp(d2ydx2, SECOND_DERIVATIVE_CLAMP)),
        dxdy: round(slopes[index].dxdy),
        d2xdy2: round(clamp(d2xdy2, SECOND_DERIVATIVE_CLAMP)),
      };
    });
  }, [rawData]);
}
