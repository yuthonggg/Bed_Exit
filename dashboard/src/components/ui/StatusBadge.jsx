export default function StatusBadge({ status }) {
  const map = {
    safe: 'bg-safe-light text-safe',
    at_risk: 'bg-warning-light text-warning',
    alert: 'bg-danger-light text-danger',
    unsafe_exit: 'bg-danger-light text-danger',
    safe_exit: 'bg-safe-light text-safe',
    repositioning: 'bg-warning-light text-warning',
  };
  const labels = { safe:'SAFE', at_risk:'AT RISK', alert:'ALERT', unsafe_exit:'UNSAFE EXIT', safe_exit:'SAFE EXIT', repositioning:'REPOSITIONING' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  );
}
