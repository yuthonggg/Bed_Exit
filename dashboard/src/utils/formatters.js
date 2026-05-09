export function formatters() {}

export function formatConfidence(val) {
  return `${(val * 100).toFixed(0)}%`;
}

export function classLabel(cls) {
  const map = { unsafe_exit: 'UNSAFE EXIT', safe_exit: 'SAFE EXIT', repositioning: 'REPOSITIONING', inconclusive: 'UNKNOWN' };
  return map[cls] || cls;
}

export function classColor(cls) {
  const map = { unsafe_exit: 'danger', safe_exit: 'safe', repositioning: 'warning' };
  return map[cls] || 'text-muted';
}
