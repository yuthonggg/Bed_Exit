import { useState, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Check, ChevronRight, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { classLabel, classColor, formatConfidence } from '../../utils/formatters';

export default function AlertsTable() {
  const { alerts, acknowledgeAlert, acknowledgeAll } = usePatients();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [ward, setWard] = useState('All');
  const [selected, setSelected] = useState(new Set());

  const wards = ['All', ...new Set(alerts.map(a => a.ward))];

  const filteredAlerts = useMemo(() => alerts.filter(a => {
    if (filter === 'unacknowledged' && a.acknowledged) return false;
    if (filter === 'acknowledged' && !a.acknowledged) return false;
    if (ward !== 'All' && a.ward !== ward) return false;
    if (search && !a.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [alerts, filter, search, ward]);

  const unackCount = alerts.filter(a => !a.acknowledged).length;

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filteredAlerts.length) setSelected(new Set());
    else setSelected(new Set(filteredAlerts.map(a => a.id)));
  };

  const handleBatchAcknowledge = () => {
    selected.forEach(id => acknowledgeAlert(id));
    setSelected(new Set());
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border flex flex-col transition-colors duration-200">
      {/* Top Action Bar */}
      <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-background p-1 rounded-lg border border-border">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>All</button>
            <button onClick={() => setFilter('unacknowledged')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'unacknowledged' ? 'bg-danger-light text-danger shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Unacknowledged ({unackCount})</button>
            <button onClick={() => setFilter('acknowledged')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'acknowledged' ? 'bg-safe-light text-safe shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Acknowledged</button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search patient..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-60 text-text-primary placeholder:text-text-muted transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={ward} 
              onChange={(e) => setWard(e.target.value)}
              className="pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text-primary appearance-none cursor-pointer transition-colors"
            >
              {wards.map(w => <option key={w} value={w}>{w === 'All' ? 'All Wards' : w}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button onClick={handleBatchAcknowledge} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              <Check className="w-4 h-4" /> Acknowledge Selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border text-xs uppercase tracking-wider text-text-muted">
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={selected.size > 0 && selected.size === filteredAlerts.length} onChange={toggleAll} className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" />
              </th>
              <th className="p-4 font-semibold">Image</th>
              <th className="p-4 font-semibold">Patient & Location</th>
              <th className="p-4 font-semibold">Classification</th>
              <th className="p-4 font-semibold">Time</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-text-muted text-sm">No alerts match the current filters.</td>
              </tr>
            ) : filteredAlerts.map(alert => {
              const cColor = classColor(alert.classification);
              const isSelected = selected.has(alert.id);
              return (
                <tr key={alert.id} className={`hover:bg-background/50 transition-colors group ${isSelected ? 'bg-primary-light/30' : ''}`}>
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(alert.id)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" />
                  </td>
                  <td className="p-4 w-20">
                    <div className="w-12 h-8 bg-background border border-border rounded flex items-center justify-center text-text-muted opacity-60 backdrop-blur-sm relative overflow-hidden">
                      {alert.imageUrl ? (
                        <img src={alert.imageUrl} alt="Incident evidence" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/patient/${alert.patientId}`)}>{alert.patientName}</p>
                    <p className="text-[11px] text-text-muted">{alert.ward} • {alert.bedId}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${cColor === 'danger' ? 'bg-danger-light text-danger' : cColor === 'warning' ? 'bg-warning-light text-warning' : 'bg-safe-light text-safe'}`}>
                      {classLabel(alert.classification)}
                    </span>
                    <span className="ml-2 text-[11px] text-text-muted">{formatConfidence(alert.confidence)}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-text-primary">{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</p>
                    <p className="text-[11px] text-text-muted">{format(alert.timestamp, "d MMM, HH:mm:ss")}</p>
                  </td>
                  <td className="p-4">
                    {alert.acknowledged ? <span className="text-xs font-semibold text-safe flex items-center gap-1"><Check className="w-3 h-3" /> Ack'd</span> : <span className="text-xs font-semibold text-danger flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse-live"/> Pending</span>}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {!alert.acknowledged && (
                      <button onClick={() => acknowledgeAlert(alert.id)} className="bg-surface border border-border hover:bg-background text-text-primary text-xs font-medium px-3 py-1.5 rounded transition-colors">Acknowledge</button>
                    )}
                    <button onClick={() => navigate(`/patient/${alert.patientId}`)} className="bg-primary-light hover:bg-primary text-primary hover:text-white text-xs font-medium px-2 py-1.5 rounded transition-colors inline-flex items-center">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
