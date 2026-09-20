import { useState, useRef } from 'react';
import { 
  Building2, 
  CreditCard, 
  FileText, 
  Database, 
  Save, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { BusinessSettings } from '../types';
import { exportDatabaseJson, importDatabaseJson } from '../utils/storage';

interface SettingsAndBackupProps {
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
  onDatabaseRestored: () => void;
}

export function SettingsAndBackup({
  settings,
  onSaveSettings,
  onDatabaseRestored
}: SettingsAndBackupProps) {
  const [formData, setFormData] = useState<BusinessSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'BIZ' | 'BANK' | 'TERMS' | 'DATA'>('BIZ');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...formData,
      businessName: 'addimprez',
      tagline: 'create the dreams...',
      logoUrl: '/assets/addimprez-logo.png'
    });
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  const handleExportBackup = () => {
    exportDatabaseJson();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const res = importDatabaseJson(content);
        if (res.success) {
          alert('Database restored successfully!');
          onDatabaseRestored();
        } else {
          alert(`Restore failed: ${res.error}`);
        }
      } catch (err: any) {
        alert(`Error reading backup file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto px-3.5 pt-3 pb-24 space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sliders size={19} className="text-indigo-600" />
            <span>Business Settings & Backup</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure letterhead identity, bank accounts, terms & export backups
          </p>
        </div>

        {saveSuccessMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in">
            <CheckCircle2 size={15} />
            <span>Saved!</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('BIZ')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'BIZ' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 size={14} />
          <span>Business Identity</span>
        </button>

        <button
          onClick={() => setActiveTab('BANK')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'BANK' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard size={14} />
          <span>Bank & UPI</span>
        </button>

        <button
          onClick={() => setActiveTab('TERMS')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'TERMS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={14} />
          <span>Terms & Tax</span>
        </button>

        <button
          onClick={() => setActiveTab('DATA')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'DATA' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database size={14} />
          <span>Backup & Restore</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Tab 1: Business Identity */}
        {activeTab === 'BIZ' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Official Business Branding
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                🔒 Official Identity Locked
              </span>
            </div>

            {/* Official Branding Visual Card */}
            <div className="bg-slate-900 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/addimprez-logo-white.svg"
                  alt="addimprez - create the dreams..."
                  className="h-12 sm:h-14 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/addimprez-logo.png';
                  }}
                />
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <p className="font-bold text-slate-200">addimprez</p>
                <p className="text-[#00a2e8] italic">create the dreams...</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Applied to all Quotations & Bills</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <span className="text-slate-400 font-bold select-none">ℹ️</span>
              <p>
                The official company logo, brand name (<strong className="text-slate-800">addimprez</strong>), and tagline are permanently locked per official brand guidelines and will be automatically applied to all quotation and bill headers, PDFs, previews, and images.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Brand Name (Locked)
                </label>
                <input
                  type="text"
                  disabled
                  value="addimprez"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tagline (Locked)
                </label>
                <input
                  type="text"
                  disabled
                  value="create the dreams..."
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs italic font-medium text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Editable Shop Contact & Address
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Workshop & Office Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  GST Number (GSTIN)
                </label>
                <input
                  type="text"
                  value={formData.gstNumber || ''}
                  onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  placeholder="27ABCDE1234F1Z5"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.panNumber || ''}
                  onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bank & UPI Details */}
        {activeTab === 'BANK' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              Bank Account & UPI Payment Details
            </h3>
            <p className="text-[11px] text-slate-400">
              These details appear on all printed Quotations and Tax Invoices for client payments.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="State Bank of India / HDFC"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber || ''}
                  onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="Current A/C Number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.bankIfsc || ''}
                  onChange={e => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                  placeholder="SBIN0001234"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  UPI ID (Google Pay / PhonePe / Paytm)
                </label>
                <input
                  type="text"
                  value={formData.upiId || ''}
                  onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="business@okhdfcbank"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Terms & Numbering & Taxes */}
        {activeTab === 'TERMS' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              Numbering Formats, Taxes & Terms
            </h3>

            {/* Prefix formats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Quote Prefix
                </label>
                <input
                  type="text"
                  value={formData.quotationPrefix}
                  onChange={e => setFormData({ ...formData, quotationPrefix: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={e => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs uppercase font-bold"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Default GST %
                </label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={formData.defaultTaxPercentage}
                  onChange={e => setFormData({ ...formData, defaultTaxPercentage: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
            </div>

            {/* Default Terms & Conditions */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Terms & Conditions (One per line)
              </label>
              <textarea
                rows={6}
                value={formData.termsAndConditions.join('\n')}
                onChange={e =>
                  setFormData({
                    ...formData,
                    termsAndConditions: e.target.value.split('\n').filter(t => t.trim().length > 0)
                  })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Pre-configured from PDF quotation terms: Advance payment, fitting, angles, design charges, electrical points, etc.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Backup & Restore */}
        {activeTab === 'DATA' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              Database Export & Backup / Restore
            </h3>
            <p className="text-xs text-slate-600">
              The application operates offline using local storage. Keep your business data safe by downloading regular JSON backups.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Export Box */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                <span className="font-extrabold text-xs text-indigo-900 block flex items-center gap-1.5">
                  <Download size={16} className="text-indigo-600" />
                  <span>Export Database Backup</span>
                </span>
                <p className="text-[11px] text-slate-600">
                  Save a complete JSON snapshot containing all customers, products, quotations, invoices, and settings.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download size={14} />
                  <span>Download Backup File</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                <span className="font-extrabold text-xs text-emerald-900 block flex items-center gap-1.5">
                  <Upload size={16} className="text-emerald-600" />
                  <span>Restore from Backup</span>
                </span>
                <p className="text-[11px] text-slate-600">
                  Restore previously exported backup JSON file to recover client records, quotations and pricing.
                </p>

                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Upload size={14} />
                  <span>Select Backup to Restore</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Settings Trigger Button (if not on DATA tab) */}
        {activeTab !== 'DATA' && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Save size={16} />
              <span>Save Settings</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
