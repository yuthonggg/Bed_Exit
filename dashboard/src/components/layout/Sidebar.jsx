import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BedDouble, Bell, BarChart3, Settings } from 'lucide-react';
import { usePatients } from '../../context/PatientContext';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/patients', icon: BedDouble, label: 'Patients' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { alerts } = usePatients();
  const unack = alerts.filter(a => !a.acknowledged).length;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-40 hidden lg:flex">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <BedDouble className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">BedGuard</h1>
            <p className="text-[10px] text-blue-200/60">Patient Safety System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 relative ${
                isActive
                  ? 'bg-sidebar-hover text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-white before:rounded-r-full'
                  : 'text-blue-100/70 hover:bg-sidebar-hover/50 hover:text-white'
              }`
            }
          >
            <n.icon className="w-4.5 h-4.5" />
            {n.label}
            {n.label === 'Alerts' && unack > 0 && (
              <span className="ml-auto bg-danger text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{unack}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Nurse profile */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-bold">NS</div>
          <div>
            <p className="text-sm font-medium text-white">Nurse Sarah</p>
            <p className="text-[10px] text-blue-200/50">Ward 3A · Shift A</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
