import { Search, FilePlus, Settings } from 'lucide-react';
import { BusinessSettings } from '../types';

interface AndroidHeaderProps {
  settings: BusinessSettings;
  activeTab: string;
  onOpenSearch: () => void;
  onNewBilling: (type: 'QUOTATION' | 'INVOICE') => void;
  onOpenSettings: () => void;
}

export function AndroidHeader({
  settings,
  activeTab,
  onOpenSearch,
  onNewBilling,
  onOpenSettings
}: AndroidHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md select-none border-b border-slate-800">
      {/* Main App Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img
            src="/assets/addimprez-logo.png"
            alt="addimprez"
            className="w-10 h-7 rounded-md object-contain bg-slate-950 p-0.5 border border-white/10 shadow-sm shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="truncate">
            <h1 className="text-sm font-bold text-slate-100 leading-tight truncate">
              {settings.businessName || 'addimprez'}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {settings.tagline || 'create the dreams...'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full hover:bg-slate-800 active:bg-slate-700 text-slate-300 transition-colors"
            title="Search customer, invoice, quote, product"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          <button
            onClick={() => onNewBilling('QUOTATION')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-xs font-semibold text-white shadow-sm transition"
            title="Create New Quotation"
          >
            <FilePlus size={14} />
            <span>+ Quote</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'settings' 
                ? 'bg-indigo-600/30 text-indigo-300' 
                : 'hover:bg-slate-800 active:bg-slate-700 text-slate-300'
            }`}
            title="Business Settings & Price DB"
            aria-label="Settings"
          >
            <Settings size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
