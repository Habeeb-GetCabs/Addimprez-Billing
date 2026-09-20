import { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  Share2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Check
} from 'lucide-react';
import { BillDocument, BusinessSettings, QuotationStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { WhatsAppShareModal } from './WhatsAppShareModal';

interface DocumentListViewProps {
  documents: BillDocument[];
  settings: BusinessSettings;
  onSelectDocument: (doc: BillDocument) => void;
  onNewDocument: (type: 'QUOTATION' | 'INVOICE') => void;
  onDeleteDocument: (docId: string) => void;
  onUpdateDocument?: (doc: BillDocument) => void;
  onConvertToInvoice?: (quotation: BillDocument) => void;
}

export function DocumentListView({
  documents,
  settings,
  onSelectDocument,
  onNewDocument,
  onDeleteDocument,
  onUpdateDocument,
  onConvertToInvoice
}: DocumentListViewProps) {
  // Main Section Toggle: 'QUOTATIONS' vs 'BILLING'
  const [activeSection, setActiveSection] = useState<'QUOTATIONS' | 'BILLING'>('BILLING');

  // Quotation Filter: 'ALL' | 'PENDING' | 'APPROVED' | 'DECLINED'
  const [quoteFilter, setQuoteFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'DECLINED'>('ALL');

  // Billing Filter: 'ALL' | 'PAID' | 'UNPAID'
  const [billFilter, setBillFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  const [searchQuery, setSearchQuery] = useState('');
  const [shareDoc, setShareDoc] = useState<BillDocument | null>(null);

  // Helper to calculate Days Due for unpaid bills
  const calculateDaysDue = (billDateStr: string): number => {
    try {
      const billTime = new Date(billDateStr).getTime();
      const nowTime = Date.now();
      const diffMs = nowTime - billTime;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(0, days);
    } catch {
      return 0;
    }
  };

  // Quick action: mark unpaid bill as PAID
  const handleMarkBillAsPaid = (bill: BillDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateDocument) return;

    const updatedBill: BillDocument = {
      ...bill,
      isPaid: true,
      paidAt: new Date().toISOString(),
      advancePaid: bill.grandTotal,
      balanceDue: 0,
      status: 'Paid',
      payments: [
        ...(bill.payments || []),
        {
          id: `pay_${Date.now()}`,
          amount: bill.balanceDue > 0 ? bill.balanceDue : bill.grandTotal,
          method: 'UPI',
          date: new Date().toISOString(),
          reference: 'Marked Paid via Quick Action'
        }
      ],
      updatedAt: new Date().toISOString()
    };
    onUpdateDocument(updatedBill);
  };

  // Quick action: update quotation status
  const handleUpdateQuoteStatus = (
    quote: BillDocument, 
    newStatus: QuotationStatus, 
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!onUpdateDocument) return;

    const updatedQuote: BillDocument = {
      ...quote,
      quotationStatus: newStatus,
      status: newStatus === 'APPROVED' ? 'Approved' : (newStatus === 'DECLINED' ? 'Cancelled' : 'Sent'),
      updatedAt: new Date().toISOString()
    };
    onUpdateDocument(updatedQuote);
  };

  // Filtered Quotations
  const quotations = documents.filter(d => d.documentType === 'QUOTATION');
  const filteredQuotations = quotations.filter(q => {
    // Status filter
    const status = q.quotationStatus || 'PENDING';
    if (quoteFilter === 'PENDING' && status !== 'PENDING') return false;
    if (quoteFilter === 'APPROVED' && status !== 'APPROVED') return false;
    if (quoteFilter === 'DECLINED' && status !== 'DECLINED') return false;

    // Search filter
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      return (
        q.documentNumber.toLowerCase().includes(s) ||
        q.customerName.toLowerCase().includes(s) ||
        q.customerMobile.includes(s) ||
        q.items.some(it => it.productName.toLowerCase().includes(s))
      );
    }
    return true;
  });

  // All Bills / Invoices
  const allBills = documents.filter(d => d.documentType === 'INVOICE');
  const paidBills = allBills.filter(b => b.isPaid || b.balanceDue <= 0);
  const unpaidBills = allBills.filter(b => !b.isPaid && b.balanceDue > 0);

  // Revenue & Earnings Metrics (Requirement #17)
  const totalPaidAmount = paidBills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
  const totalUnpaidAmount = unpaidBills.reduce((acc, b) => acc + (b.balanceDue || 0), 0);

  const filteredBills = allBills.filter(b => {
    // Status filter
    const isPaid = b.isPaid || b.balanceDue <= 0;
    if (billFilter === 'PAID' && !isPaid) return false;
    if (billFilter === 'UNPAID' && isPaid) return false;

    // Search filter
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      return (
        b.documentNumber.toLowerCase().includes(s) ||
        b.customerName.toLowerCase().includes(s) ||
        b.customerMobile.includes(s) ||
        b.items.some(it => it.productName.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-3.5 pt-3 pb-24 space-y-4">
      {/* Primary Section Switcher (Requirements #13 & #14) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex gap-2">
        <button
          onClick={() => {
            setActiveSection('BILLING');
            setSearchQuery('');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            activeSection === 'BILLING'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Receipt size={16} className={activeSection === 'BILLING' ? 'text-indigo-400' : 'text-slate-400'} />
          <span>Billing Database ({allBills.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('QUOTATIONS');
            setSearchQuery('');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            activeSection === 'QUOTATIONS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText size={16} className={activeSection === 'QUOTATIONS' ? 'text-white' : 'text-slate-400'} />
          <span>Sent Quotations ({quotations.length})</span>
        </button>
      </div>

      {/* SECTION 1: BILLING DATABASE */}
      {activeSection === 'BILLING' && (
        <div className="space-y-4">
          {/* Revenue / Earnings Tracking Bar (Requirement #17) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-sm border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Financial Overview
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Earnings & Outstanding Revenue
                </h3>
              </div>
              <button
                onClick={() => onNewDocument('INVOICE')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <Plus size={14} />
                <span>+ New Bill</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-emerald-300 font-semibold uppercase block">
                  Received Earnings
                </span>
                <span className="text-base font-black text-emerald-400 mt-0.5 block">
                  {formatCurrency(totalPaidAmount)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {paidBills.length} Paid Bills
                </span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-rose-300 font-semibold uppercase block">
                  Outstanding Due
                </span>
                <span className="text-base font-black text-rose-400 mt-0.5 block">
                  {formatCurrency(totalUnpaidAmount)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {unpaidBills.length} Unpaid Bills
                </span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300 font-semibold uppercase block">
                  Total Bills
                </span>
                <span className="text-base font-black text-white mt-0.5 block">
                  {allBills.length}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Invoices Tracked
                </span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-amber-300 font-semibold uppercase block">
                  Payment Ratio
                </span>
                <span className="text-base font-black text-amber-300 mt-0.5 block">
                  {allBills.length > 0 ? Math.round((paidBills.length / allBills.length) * 100) : 0}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Paid Compliance
                </span>
              </div>
            </div>
          </div>

          {/* Search & Quick Filters (Requirement #14) */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search bills by invoice #, customer name, mobile, item..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
              <button
                onClick={() => setBillFilter('ALL')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                  billFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Bills ({allBills.length})
              </button>

              <button
                onClick={() => setBillFilter('PAID')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  billFilter === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Paid Bills ({paidBills.length})</span>
              </button>

              <button
                onClick={() => setBillFilter('UNPAID')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  billFilter === 'UNPAID'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Clock size={13} />
                <span>Unpaid Bills ({unpaidBills.length})</span>
              </button>
            </div>
          </div>

          {/* Bills List */}
          {filteredBills.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-4">
              <Receipt size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No bills match your filter</p>
              <p className="text-xs text-slate-400 mt-1">
                Create a new invoice or adjust your search.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBills.map(bill => {
                const isPaid = bill.isPaid || bill.balanceDue <= 0;
                const daysDue = calculateDaysDue(bill.date);

                return (
                  <div
                    key={bill.id}
                    onClick={() => onSelectDocument(bill)}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {bill.documentNumber}
                          </span>

                          {/* Payment Status Badge (Requirement #15) */}
                          {isPaid ? (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>PAID</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock size={12} />
                              <span>UNPAID</span>
                            </span>
                          )}

                          {/* Days Due for Unpaid Bills (Requirement #16) */}
                          {!isPaid && (
                            <span className="text-[11px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={12} className="text-amber-700" />
                              <span>{daysDue} {daysDue === 1 ? 'Day' : 'Days'} Due</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                          {bill.customerName}
                        </h4>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(bill.date)}
                          </span>
                          {bill.customerMobile && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {bill.customerMobile}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Total Amount
                        </span>
                        <div className="text-base font-black text-slate-900">
                          {formatCurrency(bill.grandTotal)}
                        </div>

                        {!isPaid && (
                          <div className="text-xs font-bold text-rose-600 mt-0.5">
                            Due: {formatCurrency(bill.balanceDue)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary of line items */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                      <span className="font-semibold text-slate-700">Items: </span>
                      {bill.items.map(it => `${it.productName} (${it.calculationType === 'AREA' ? `${it.area} sqft` : `${it.quantity} ${it.unit}`})`).join(', ')}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      {/* Quick "Mark as PAID" button for Unpaid Bills (Requirement #16) */}
                      {!isPaid && onUpdateDocument ? (
                        <button
                          type="button"
                          onClick={e => handleMarkBillAsPaid(bill, e)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition flex items-center gap-1 text-[11px]"
                        >
                          <Check size={13} />
                          <span>Mark as PAID</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-400 font-medium">
                          {isPaid && bill.paidAt ? `Paid on ${formatDate(bill.paidAt)}` : 'Payment complete'}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setShareDoc(bill);
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Share via WhatsApp"
                        >
                          <Share2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onSelectDocument(bill);
                          }}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="View / Print"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete invoice ${bill.documentNumber}?`)) {
                              onDeleteDocument(bill.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Bill"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SENT QUOTATIONS (Requirement #13) */}
      {activeSection === 'QUOTATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Track Sent Quotations
              </h3>
              <p className="text-xs text-slate-500">
                Manage approval pipeline and convert accepted quotations to invoices
              </p>
            </div>

            <button
              onClick={() => onNewDocument('QUOTATION')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <Plus size={14} />
              <span>+ New Quotation</span>
            </button>
          </div>

          {/* Quick Filters: All, Pending, Approved, Declined (Requirement #13) */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search quotations by quote #, client name, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
              <button
                onClick={() => setQuoteFilter('ALL')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                  quoteFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Quotations ({quotations.length})
              </button>

              <button
                onClick={() => setQuoteFilter('PENDING')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  quoteFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Clock size={13} />
                <span>Sent / Pending ({quotations.filter(q => (q.quotationStatus || 'PENDING') === 'PENDING').length})</span>
              </button>

              <button
                onClick={() => setQuoteFilter('APPROVED')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  quoteFilter === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Approved ({quotations.filter(q => q.quotationStatus === 'APPROVED').length})</span>
              </button>

              <button
                onClick={() => setQuoteFilter('DECLINED')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  quoteFilter === 'DECLINED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <XCircle size={13} />
                <span>Declined ({quotations.filter(q => q.quotationStatus === 'DECLINED').length})</span>
              </button>
            </div>
          </div>

          {/* Quotations List */}
          {filteredQuotations.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-4">
              <FileText size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No quotations match your filter</p>
              <p className="text-xs text-slate-400 mt-1">
                Create a new quote or adjust your status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuotations.map(quote => {
                const status = quote.quotationStatus || 'PENDING';

                return (
                  <div
                    key={quote.id}
                    onClick={() => onSelectDocument(quote)}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            {quote.documentNumber}
                          </span>

                          {/* Quotation Status Badge (Requirement #13) */}
                          {status === 'APPROVED' && (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>APPROVED</span>
                            </span>
                          )}
                          {status === 'PENDING' && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock size={12} />
                              <span>SENT / PENDING</span>
                            </span>
                          )}
                          {status === 'DECLINED' && (
                            <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle size={12} />
                              <span>DECLINED / NOT APPROVED</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                          {quote.customerName}
                        </h4>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(quote.date)}
                          </span>
                          {quote.customerMobile && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {quote.customerMobile}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Estimated Total
                        </span>
                        <div className="text-base font-black text-slate-900">
                          {formatCurrency(quote.grandTotal)}
                        </div>
                      </div>
                    </div>

                    {/* Summary of items */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                      <span className="font-semibold text-slate-700">Items: </span>
                      {quote.items.map(it => `${it.productName} (${it.calculationType === 'AREA' ? `${it.area} sqft` : `${it.quantity} ${it.unit}`})`).join(', ')}
                    </div>

                    {/* Status updater & Convert to Invoice action bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500 font-semibold mr-1">Status:</span>
                        <button
                          type="button"
                          onClick={e => handleUpdateQuoteStatus(quote, 'PENDING', e)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            status === 'PENDING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          onClick={e => handleUpdateQuoteStatus(quote, 'APPROVED', e)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Approved
                        </button>
                        <button
                          type="button"
                          onClick={e => handleUpdateQuoteStatus(quote, 'DECLINED', e)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            status === 'DECLINED'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Declined
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {/* Option: Convert to Bill / Invoice (Requirement #13) */}
                        {onConvertToInvoice && status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onConvertToInvoice(quote);
                            }}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1"
                          >
                            <span>Convert to Invoice</span>
                            <ArrowRight size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setShareDoc(quote);
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Share via WhatsApp"
                        >
                          <Share2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onSelectDocument(quote);
                          }}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="View / Print"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete quote ${quote.documentNumber}?`)) {
                              onDeleteDocument(quote.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Quote"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Share Modal */}
      {shareDoc && (
        <WhatsAppShareModal
          document={shareDoc}
          settings={settings}
          onClose={() => setShareDoc(null)}
        />
      )}
    </div>
  );
}
