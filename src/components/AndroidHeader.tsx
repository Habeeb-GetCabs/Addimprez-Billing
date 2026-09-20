import { Search, WifiOff, FilePlus, Settings } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md select-none">
      {/* Top Simulated Android Status Bar */}
      <div className="flex items-center justify-between px-4 pt-1.5 pb-0.5 text-[11px] font-medium text-slate-400 tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-200">10:45</span>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            OFFLINE READY
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>VoLTE</span>
          <span title="Offline Mode Active"><WifiOff size={11} className="text-amber-400" /></span>
          <span>85%</span>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0 border border-white/10">
            {settings.businessName ? settings.businessName.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="truncate">
            <h1 className="text-sm font-bold text-slate-100 leading-tight truncate">
              {settings.businessName || 'Lividus Print & Sign'}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {settings.tagline || 'Printing & Advertising Solutions'}
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
