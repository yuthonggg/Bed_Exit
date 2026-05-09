import MetricGraph from './MetricGraph';

export const METRICS = [
  { key: 'x', label: 'X Position', color: '#2563EB' },
  { key: 'y', label: 'Y Position', color: '#16A34A' },
  { key: 'dydx', label: 'dy/dx', color: '#7C3AED' },
  { key: 'd2ydx2', label: 'd²y/dx²', color: '#D97706' },
  { key: 'dxdy', label: 'dx/dy', color: '#0891B2' },
  { key: 'd2xdy2', label: 'd²x/dy²', color: '#DB2777' },
];

export default function SixGraphGrid({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {METRICS.map((m, i) => (
        <MetricGraph key={m.key} data={data} dataKey={m.key} label={m.label} color={m.color} delay={i * 0.05} />
      ))}
    </div>
  );
}
