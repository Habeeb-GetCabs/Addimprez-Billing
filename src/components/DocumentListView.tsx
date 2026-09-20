import { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Calendar, 
  ArrowRight,
  Download,
  Share2,
  Eye,
  CheckCircle2,
  Clock,
  Trash2
} from 'lucide-react';
import { BillDocument, BusinessSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { shareViaWhatsApp } from '../utils/pdfGenerator';

interface DocumentListViewProps {
  documents: BillDocument[];
  settings: BusinessSettings;
  onSelectDocument: (doc: BillDocument) => void;
  onNewDocument: (type: 'QUOTATION' | 'INVOICE') => void;
  onDeleteDocument: (docId: string) => void;
}

export function DocumentListView({
  documents,
  settings,
  onSelectDocument,
  onNewDocument,
  onDeleteDocument
}: DocumentListViewProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'QUOTATION' | 'INVOICE' | 'UNPAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter documents
  const filtered = documents.filter(doc => {
    // Type filter
    if (filterType === 'QUOTATION' && doc.documentType !== 'QUOTATION') return false;
    if (filterType === 'INVOICE' && doc.documentType !== 'INVOICE') return false;
    if (filterType === 'UNPAID' && (doc.balanceDue <= 0 || doc.documentType !== 'INVOICE')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = doc.documentNumber.toLowerCase().includes(q);
      const matchCustomer = doc.customerName.toLowerCase().includes(q);
      const matchMobile = doc.customerMobile.includes(q);
      const matchItem = doc.items.some(it => it.productName.toLowerCase().includes(q));
      return matchNum || matchCustomer || matchMobile || matchItem;
    }

    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-3.5 pt-3 pb-24 space-y-4">
      {/* Top Banner & Fast Actions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText size={19} className="text-indigo-600" />
            <span>Quotations & Invoices</span>
          </h2>
          <p className="text-xs text-slate-500">
            Total {documents.length} recorded documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNewDocument('QUOTATION')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <Plus size={14} />
            <span>New Quote</span>
          </button>

          <button
            onClick={() => onNewDocument('INVOICE')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
          >
            <Plus size={14} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by quote/bill #, client name, phone, or product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Records ({documents.length})
          </button>

          <button
            onClick={() => setFilterType('QUOTATION')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
              filterType === 'QUOTATION'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Quotations ({documents.filter(d => d.documentType === 'QUOTATION').length})
          </button>

          <button
            onClick={() => setFilterType('INVOICE')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
              filterType === 'INVOICE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Invoices ({documents.filter(d => d.documentType === 'INVOICE').length})
          </button>

          <button
            onClick={() => setFilterType('UNPAID')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
              filterType === 'UNPAID'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Unpaid Dues ({documents.filter(d => d.documentType === 'INVOICE' && d.balanceDue > 0).length})
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-400">
            No bills or quotations found matching your criteria.
          </div>
        ) : (
          filtered.map(doc => {
            const isInvoice = doc.documentType === 'INVOICE';
            const isPaid = doc.balanceDue <= 0 && doc.grandTotal > 0;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition space-y-2.5 cursor-pointer"
                onClick={() => onSelectDocument(doc)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg shrink-0 ${isInvoice ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>
                      {isInvoice ? <Receipt size={16} /> : <FileText size={16} />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">
                          {doc.documentNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          isInvoice ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {doc.documentType}
                        </span>
                        {doc.convertedToInvoiceId && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                            Converted
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(doc.date)}
                      </div>
                    </div>
                  </div>

                  {/* Status & Amount */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-slate-900">
                      {formatCurrency(doc.grandTotal)}
                    </div>
                    {isInvoice ? (
                      isPaid ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                          Paid in Full
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-full">
                          Due: {formatCurrency(doc.balanceDue)}
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {doc.items.length} items
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer name & item summary snippet */}
                <div className="text-xs text-slate-700 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <div className="truncate font-semibold text-slate-800">
                    {doc.customerName || 'Walk-in Customer'}
                    {doc.customerMobile && (
                      <span className="text-slate-400 font-normal ml-1">({doc.customerMobile})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        shareViaWhatsApp(doc, settings);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded transition"
                      title="Share via WhatsApp"
                    >
                      <Share2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Delete ${doc.documentNumber}?`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                      title="Delete Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
