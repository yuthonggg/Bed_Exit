import { useState, useEffect } from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ title }) {
  const { alerts } = usePatients();
  const { theme, toggleTheme } = useTheme();
  const unack = alerts.filter(a => !a.acknowledged).length;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-sm border-b border-border h-16 flex items-center justify-between px-6 transition-colors duration-200">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <div className="flex items-center gap-5">
        <span className="text-sm text-text-muted font-mono hidden sm:inline-block">
          {time.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
        </span>
        
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-background text-text-muted transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 rounded-lg hover:bg-background transition-colors">
          <Bell className="w-5 h-5 text-text-muted" />
          {unack > 0 && (
            <>
              <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">{unack}</span>
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger rounded-full animate-ping opacity-40" />
            </>
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">NS</div>
      </div>
    </header>
  );
}
