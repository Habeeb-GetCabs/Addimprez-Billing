import { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Users, 
  Send, 
  FileText, 
  Copy, 
  Check, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { BillDocument, BusinessSettings } from '../types';
import { 
  buildWhatsAppMessage, 
  shareViaWhatsAppContactPicker, 
  shareViaWhatsAppDirect,
  shareBillPdfFile 
} from '../utils/pdfGenerator';

interface WhatsAppShareModalProps {
  document: BillDocument;
  settings: BusinessSettings;
  onClose: () => void;
}

export function WhatsAppShareModal({
  document: doc,
  settings,
  onClose
}: WhatsAppShareModalProps) {
  // Pre-fill with customer mobile if available
  const initialMobile = (doc.customerMobile || '').replace(/[^0-9]/g, '');
  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [copied, setCopied] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);

  const cleanPhone = mobileNumber.trim().replace(/[^0-9]/g, '');
  const hasValidNumber = cleanPhone.length >= 10;
  const messageText = buildWhatsAppMessage(doc, settings);

  // 1. Choose contact from WhatsApp
  const handleOpenWhatsAppPicker = () => {
    shareViaWhatsAppContactPicker(doc, settings);
    onClose();
  };

  // 2. Direct message to specific phone
  const handleDirectWhatsApp = () => {
    if (!cleanPhone) {
      handleOpenWhatsAppPicker();
      return;
    }
    shareViaWhatsAppDirect(doc, settings, cleanPhone);
    onClose();
  };

  // 3. Share actual PDF file to WhatsApp
  const handleSharePdf = async () => {
    setIsSharingPdf(true);
    try {
      await shareBillPdfFile(doc, settings);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharingPdf(false);
    }
  };

  // 4. Copy text
  const handleCopyText = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(messageText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      prompt('Copy message text:', messageText);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-emerald-600 px-4 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <MessageCircle size={20} className="text-white fill-white/20" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Share on WhatsApp</h3>
              <p className="text-[11px] text-emerald-100">
                {doc.documentNumber} • {doc.customerName || 'Customer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-100 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          
          {/* Mobile Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Mobile Number (WhatsApp)
            </label>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <span className="bg-slate-100 text-slate-600 px-3 py-2 text-xs font-semibold flex items-center border-r border-slate-300">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="flex-1 px-3 py-2 text-sm text-slate-800 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} className="text-slate-400 shrink-0" />
              <span>If this number is not registered on WhatsApp, use "Choose Any Contact" below.</span>
            </p>
          </div>

          {/* Action Options */}
          <div className="space-y-2.5 pt-1">
            
            {/* Option A: Choose Contact / Group (Guaranteed to work without SMS invite) */}
            <button
              type="button"
              onClick={handleOpenWhatsAppPicker}
              className="w-full text-left p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 hover:bg-emerald-100/70 transition flex items-center justify-between group shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-900">
                      Choose Contact or Group in WhatsApp
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Opens WhatsApp to pick any chat or group without SMS invite errors
                  </p>
                </div>
              </div>
              <ExternalLink size={16} className="text-emerald-600 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Option B: Direct to Number */}
            {hasValidNumber && (
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-emerald-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <Send size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Direct Chat with +91 {cleanPhone}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Opens direct chat (recipient must have WhatsApp installed)
                    </p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-600 transition" />
              </button>
            )}

            {/* Option C: Share PDF File */}
            <button
              type="button"
              disabled={isSharingPdf}
              onClick={handleSharePdf}
              className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between group cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    {isSharingPdf ? 'Preparing PDF...' : 'Share Official PDF File to WhatsApp'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Attaches the generated PDF letterpad directly via Android Share
                  </p>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-600 transition" />
            </button>

            {/* Option D: Copy text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Message Copied to Clipboard!' : 'Copy WhatsApp Message Text'}</span>
            </button>

          </div>

          {/* Quick Preview of the message */}
          <div className="pt-2 border-t border-slate-100">
            <details className="text-[11px] text-slate-500 cursor-pointer">
              <summary className="font-semibold text-slate-600 hover:text-slate-800 select-none">
                Preview WhatsApp Message Text
              </summary>
              <pre className="mt-2 p-2.5 bg-slate-100 rounded-lg text-[10.5px] text-slate-700 whitespace-pre-wrap font-sans max-h-36 overflow-y-auto border border-slate-200 leading-relaxed">
                {messageText}
              </pre>
            </details>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
