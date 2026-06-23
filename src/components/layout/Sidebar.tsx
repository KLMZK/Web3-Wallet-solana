import { FC } from 'react';
import { Home, History, Settings } from 'lucide-react';
import HexLogo from '../ui/HexLogo';

import { C } from '../../utils/theme';

export type Tab = 'home' | 'history' | 'settings';

interface SidebarProps {
  active: Tab;
  onChange: (t: Tab) => void;
}

const Sidebar: FC<SidebarProps> = ({ active, onChange }) => {
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'home',     label: 'Home',     icon: <Home size={20} /> },
    { key: 'history',  label: 'History',  icon: <History size={20} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-64 border-r bg-[#10131c]/60 backdrop-blur-md z-20 shrink-0"
      style={{ borderColor: C.border }}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 mb-4 shrink-0">
        <HexLogo size={28} />
        <span className="text-white text-xl font-bold tracking-tight">Xpectre</span>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 px-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all cursor-pointer border-none text-left ${
              active === t.key
                ? 'bg-[#dea001]/10 text-[#dea001]'
                : 'bg-transparent text-[#7a8fa6] hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.icon}
            <span className="font-semibold text-[15px]">{t.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
