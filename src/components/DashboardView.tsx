import { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  IndianRupee, 
  Clock, 
  Users, 
  PlusCircle, 
  ArrowUpRight, 
  Eye, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Printer
} from 'lucide-react';
import { BillDocument, Customer, BusinessSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { shareViaWhatsApp } from '../utils/pdfGenerator';
import { WhatsAppShareModal } from './WhatsAppShareModal';

interface DashboardViewProps {
  documents: BillDocument[];
  customers: Customer[];
  settings: BusinessSettings;
  onNewBilling: (type: 'QUOTATION' | 'INVOICE') => void;
  onSelectDocument: (doc: BillDocument) => void;
  onConvertToInvoice: (quotation: BillDocument) => void;
  onNavigateToTab: (tab: any) => void;
}

export function DashboardView({
  documents,
  customers,
  settings,
  onNewBilling,
  onSelectDocument,
  onConvertToInvoice,
  onNavigateToTab
}: DashboardViewProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'INVOICE' | 'QUOTATION'>('ALL');
  const [shareDoc, setShareDoc] = useState<BillDocument | null>(null);

  // Compute metrics
  const todayStr = new Date().toISOString().split('T')[0];

  const todayBills = documents.filter(
    d => d.documentType === 'INVOICE' && (d.date && d.date.startsWith(todayStr))
  ).length;

  const todayQuotations = documents.filter(
    d => d.documentType === 'QUOTATION' && (d.date && d.date.startsWith(todayStr))
  ).length;

  const invoices = documents.filter(d => d.documentType === 'INVOICE');
  const paidInvoices = invoices.filter(d => d.isPaid || d.balanceDue <= 0);
  const unpaidInvoices = invoices.filter(d => !d.isPaid && d.balanceDue > 0);

  // Requirement #17: Earnings based strictly on PAID bills
  const totalReceivedEarnings = paidInvoices.reduce((sum, d) => sum + (d.grandTotal || 0), 0);
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, d) => sum + (d.balanceDue || 0), 0);
  const paidBillCount = paidInvoices.length;
  const unpaidBillCount = unpaidInvoices.length;

  const recentDocs = documents
    .filter(d => filterType === 'ALL' || d.documentType === filterType)
    .slice(0, 10);

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3.5 pt-3">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-indigo-300 tracking-wider uppercase bg-indigo-500/20 px-2 py-0.5 rounded">
              Printing & Signage POS
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Billing & Quotation Desk
            </h2>
            <p className="text-xs text-slate-300 max-w-md">
              Create area-based & quantity-based bills, print A4 quotes, and manage client balances offline.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNewBilling('QUOTATION')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow transition"
            >
              <FileText size={15} />
              <span>+ New Quote</span>
            </button>
            <button
              onClick={() => onNewBilling('INVOICE')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow transition"
            >
              <Receipt size={15} />
              <span>+ New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Today's Bills */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Today's Bills</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Receipt size={16} />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{todayBills}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Invoices generated today</p>
        </div>

        {/* Today's Quotations */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Today's Quotes</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText size={16} />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{todayQuotations}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Quotations sent today</p>
        </div>

        {/* Paid Earnings (Requirement #17) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Paid Earnings</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <IndianRupee size={16} />
            </span>
          </div>
          <div className="text-xl font-black text-emerald-700 truncate">
            {formatCurrency(totalReceivedEarnings)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{paidBillCount} Paid bills received</p>
        </div>

        {/* Pending Payments / Outstanding Due */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Outstanding Due</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-xl font-black text-rose-600 truncate">
            {formatCurrency(totalUnpaidAmount)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{unpaidBillCount} Unpaid bills pending</p>
        </div>

        {/* Customers */}
        <div 
          onClick={() => onNavigateToTab('customers')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Customers</span>
            <span className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
              <Users size={16} />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{customers.length}</div>
          <p className="text-[11px] text-indigo-600 font-medium mt-0.5 flex items-center gap-0.5">
            View Directory <ArrowUpRight size={12} />
          </p>
        </div>
      </div>

      {/* Recent Invoices & Quotations Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Billing Activity</h3>
            <p className="text-xs text-slate-500">View, print, share, or convert recent invoices and quotations</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filterType === 'ALL' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setFilterType('INVOICE')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filterType === 'INVOICE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setFilterType('QUOTATION')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filterType === 'QUOTATION' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quotations
            </button>
          </div>
        </div>

        {/* List of Documents */}
        {recentDocs.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <FileText size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No records found</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Start by creating your first quotation or invoice using the PDF pricing database.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onNewBilling('QUOTATION')}
                className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                Create Quotation
              </button>
              <button
                onClick={() => onNewBilling('INVOICE')}
                className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
              >
                Create Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentDocs.map(doc => {
              const isInvoice = doc.documentType === 'INVOICE';
              const isPaid = doc.balanceDue <= 0 && doc.grandTotal > 0;
              const isPartial = doc.advancePaid > 0 && doc.balanceDue > 0;
              const isConverted = !!doc.convertedToInvoiceId;

              return (
                <div
                  key={doc.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div 
                    onClick={() => onSelectDocument(doc)}
                    className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isInvoice ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {isInvoice ? <Receipt size={20} /> : <FileText size={20} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition">
                          {doc.documentNumber}
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isInvoice 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {doc.documentType}
                        </span>

                        {isConverted && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 flex items-center gap-1">
                            <FileCheck size={11} /> Converted
                          </span>
                        )}

                        {isInvoice && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isPaid 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : isPartial 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isPaid ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                            {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
                        {doc.customerName || 'Walk-in Customer'}
                        {doc.customerMobile ? ` • ${doc.customerMobile}` : ''}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(doc.date)} • {doc.items.length} {doc.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  {/* Financial & Action Column */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {formatCurrency(doc.grandTotal)}
                      </div>
                      {doc.balanceDue > 0 ? (
                        <div className="text-[11px] font-medium text-rose-600">
                          Due: {formatCurrency(doc.balanceDue)}
                        </div>
                      ) : (
                        <div className="text-[11px] font-medium text-emerald-600">
                          Settled
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* One-tap Convert Quotation -> Invoice button */}
                      {!isInvoice && !isConverted && (
                        <button
                          onClick={() => onConvertToInvoice(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition flex items-center gap-1"
                          title="Convert this quotation directly into a tax invoice"
                        >
                          <Receipt size={13} />
                          <span className="hidden md:inline">To Invoice</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="View / Print PDF"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShareDoc(doc)}
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer select-none"
                        title="Share on WhatsApp"
                      >
                        <Share2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {documents.length > 10 && (
          <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('history')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition inline-flex items-center gap-1"
            >
              View All {documents.length} Records <ArrowUpRight size={13} />
            </button>
          </div>
        )}
      </div>

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
