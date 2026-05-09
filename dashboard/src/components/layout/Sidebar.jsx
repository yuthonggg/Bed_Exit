import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BedDouble, Bell, BarChart3, Settings, Brain } from 'lucide-react';
import { usePatients } from '../../context/PatientContext';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/patients', icon: BedDouble, label: 'Patients' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/ailab', icon: Brain, label: 'AI Lab' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { alerts } = usePatients();
  const unack = alerts.filter(a => !a.acknowledged).length;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-40 hidden lg:flex">
      {/* Logo */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <BedDouble className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">BedGuard</h1>
            <p className="text-[10px] text-blue-200/40 uppercase tracking-widest font-semibold">Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2">
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(0,82,204,0.1)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <n.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'fill-primary/20' : ''}`} />
                {n.label}
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,82,204,0.8)]" />
                )}
                {n.label === 'Alerts' && unack > 0 && (
                  <span className="ml-auto bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-danger/20">{unack}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Nurse profile */}
      <div className="px-4 py-6 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">NS</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">Nurse Sarah</p>
            <p className="text-[10px] text-slate-500 truncate">Ward 3A · Unit A</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
