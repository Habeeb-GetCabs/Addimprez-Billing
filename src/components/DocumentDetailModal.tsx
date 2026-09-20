import { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  FileCheck, 
  CreditCard, 
  Edit3, 
  ArrowRight,
  Receipt,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  Mail,
  FileText,
  Link2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { BillDocument, BusinessSettings, PaymentMethod, PaymentRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { downloadBillPdf, printBillPdf, shareViaWhatsApp, getPdfBlobUrl, openPdfInNewTab } from '../utils/pdfGenerator';
import { getShareableBillUrl } from '../utils/shareableLink';
import { LetterpadBillView } from './LetterpadBillView';

interface DocumentDetailModalProps {
  document: BillDocument;
  settings: BusinessSettings;
  onClose: () => void;
  onEdit: (doc: BillDocument) => void;
  onConvertToInvoice: (quotation: BillDocument) => void;
  onUpdatePayment: (docId: string, payment: PaymentRecord) => void;
}

export function DocumentDetailModal({
  document: doc,
  settings,
  onClose,
  onEdit,
  onConvertToInvoice,
  onUpdatePayment
}: DocumentDetailModalProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(doc.balanceDue);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [showPdfIframe, setShowPdfIframe] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const isInvoice = doc.documentType === 'INVOICE';
  const isPaid = doc.balanceDue <= 0 && doc.grandTotal > 0;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }
    const newRecord: PaymentRecord = {
      id: `pay_${Date.now()}`,
      amount: paymentAmount,
      method: paymentMethod,
      date: new Date().toISOString(),
      reference: paymentRef.trim() || undefined
    };
    onUpdatePayment(doc.id, newRecord);
    setShowPaymentForm(false);
  };

  const handlePreviewPdfToggle = () => {
    if (!showPdfIframe) {
      const url = getPdfBlobUrl(doc, settings);
      setPdfUrl(url);
      setShowPdfIframe(true);
    } else {
      setShowPdfIframe(false);
    }
  };

  const handleCopyLink = () => {
    try {
      const url = getShareableBillUrl(doc);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2500);
        }).catch(() => {
          prompt('Copy this link to view or share the bill:', url);
        });
      } else {
        prompt('Copy this link to view or share the bill:', url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${isInvoice ? 'Invoice' : 'Quotation'} ${doc.documentNumber}`,
          text: `${isInvoice ? 'Invoice' : 'Quotation'} from ${settings.businessName} for Rs. ${doc.grandTotal}`,
        });
      } catch (err) {
        shareViaWhatsApp(doc, settings);
      }
    } else {
      shareViaWhatsApp(doc, settings);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Control Bar */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${isInvoice ? 'bg-blue-600' : 'bg-indigo-600'} text-white`}>
              {isInvoice ? <Receipt size={17} /> : <FileText size={17} />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm">{doc.documentNumber}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                  isInvoice ? 'bg-blue-500/30 text-blue-200' : 'bg-indigo-500/30 text-indigo-200'
                }`}>
                  {doc.documentType}
                </span>
                {doc.convertedToInvoiceId && (
                  <span className="text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.2 rounded-full">
                    Converted
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Created on {formatDate(doc.date)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Button Bar */}
        <div className="bg-slate-100 p-2.5 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {/* Preview PDF */}
          <button
            onClick={handlePreviewPdfToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              showPdfIframe 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
          >
            <FileText size={14} />
            <span>{showPdfIframe ? 'Hide PDF' : 'Preview PDF'}</span>
          </button>

          {/* Save PDF */}
          <button
            onClick={() => downloadBillPdf(doc, settings)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 shrink-0"
          >
            <Download size={14} />
            <span>Save PDF</span>
          </button>

          {/* Print Letterpad / Bill */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.print();
              } else {
                printBillPdf(doc, settings);
              }
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 shrink-0"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          {/* Share PDF / WhatsApp */}
          <button
            onClick={handleNativeShare}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Share2 size={14} />
            <span>WhatsApp Share</span>
          </button>

          {/* Copy Shareable Online Link */}
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 shrink-0"
            title="Copy online link for customer to view this bill directly"
          >
            {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Link2 size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          {/* Convert Quotation -> Invoice Button */}
          {!isInvoice && !doc.convertedToInvoiceId && (
            <button
              onClick={() => onConvertToInvoice(doc)}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0 ml-auto"
            >
              <FileCheck size={14} />
              <span>Convert to Invoice</span>
            </button>
          )}

          {/* Edit Button */}
          <button
            onClick={() => onEdit(doc)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {/* If PDF Iframe is toggled */}
          {showPdfIframe && pdfUrl && (
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-md">
              <div className="p-2.5 bg-slate-800 text-white text-xs font-bold flex justify-between items-center flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-400" />
                  <span>A4 PDF Document</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPdfInNewTab(doc, settings)}
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2 py-0.5 rounded transition flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    <span>Open in New Tab</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadBillPdf(doc, settings)}
                    className="text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-semibold px-2 py-0.5 rounded transition flex items-center gap-1"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPdfIframe(false)}
                    className="text-[11px] text-slate-300 hover:text-white px-1.5 py-0.5"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="relative bg-slate-100 min-h-[380px]">
                <iframe
                  src={pdfUrl}
                  className="w-full h-96 border-none"
                  title="PDF Document"
                />
                {/* Fallback footer for mobile browsers that do not render inline PDFs */}
                <div className="p-2 bg-slate-100 text-[11px] text-slate-500 text-center border-t border-slate-200 flex items-center justify-center gap-2 flex-wrap">
                  <span>If your browser or phone does not display inline PDFs:</span>
                  <button
                    type="button"
                    onClick={() => openPdfInNewTab(doc, settings)}
                    className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    <ExternalLink size={11} /> Open Full PDF
                  </button>
                  <span>or</span>
                  <button
                    type="button"
                    onClick={() => downloadBillPdf(doc, settings)}
                    className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    <Download size={11} /> Download File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Letterpad Document View matching the exact physical letter pad */}
          <div className="w-full flex justify-center">
            <LetterpadBillView document={doc} settings={settings} />
          </div>

          {/* Payment Records Section & Add Payment Trigger (Hidden during print) */}
          <div className="no-print max-w-[820px] mx-auto p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={15} className="text-indigo-600" />
                <span>Payment & Transaction History</span>
              </span>

              {doc.balanceDue > 0 && !showPaymentForm && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition"
                >
                  + Record Payment
                </button>
              )}
            </div>

            {/* Recorded payments list */}
            {doc.payments && doc.payments.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {doc.payments.map((p, idx) => (
                  <div key={p.id || idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{formatCurrency(p.amount)}</span>
                      <span className="text-slate-500 text-[11px] ml-2">via {p.method} on {formatDate(p.date)}</span>
                      {p.reference && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">Ref: {p.reference}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Received
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No payment transactions recorded yet.</p>
            )}

            {/* Record Payment Form */}
            {showPaymentForm && (
              <form onSubmit={handleRecordPayment} className="p-3 bg-slate-50 rounded-xl border border-indigo-200 space-y-2.5 mt-2">
                <div className="font-bold text-xs text-slate-800">
                  Record New Payment (Balance: {formatCurrency(doc.balanceDue)})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      max={doc.balanceDue}
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                    >
                      <option value="UPI">UPI (GPay/PhonePe)</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank transfer">Bank Transfer (NEFT/IMPS)</option>
                      <option value="Card">Card / POS</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Transaction reference ID or note..."
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-xs"
                  >
                    Confirm Payment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
