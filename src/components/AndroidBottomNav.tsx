import { LayoutDashboard, PlusCircle, FileSpreadsheet, Users, Tag } from 'lucide-react';

export type NavigationTab = 'dashboard' | 'billing' | 'history' | 'customers' | 'catalog' | 'settings';

interface AndroidBottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  pendingCount?: number;
}

export function AndroidBottomNav({
  activeTab,
  onTabChange,
  pendingCount = 0
}: AndroidBottomNavProps) {
  const tabs = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'billing' as NavigationTab,
      label: 'New Bill',
      icon: PlusCircle,
      isPrimary: true,
    },
    {
      id: 'history' as NavigationTab,
      label: 'Records',
      icon: FileSpreadsheet,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    {
      id: 'customers' as NavigationTab,
      label: 'Customers',
      icon: Users,
    },
    {
      id: 'catalog' as NavigationTab,
      label: 'Prices',
      icon: Tag,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1 shadow-lg max-w-lg mx-auto md:max-w-none">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform border-4 border-slate-100">
                  <Icon size={26} className="text-white" />
                </div>
                <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors relative focus:outline-none ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium ${isActive ? 'font-bold text-indigo-700' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
