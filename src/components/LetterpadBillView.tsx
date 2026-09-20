import React from 'react';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { BillDocument, BusinessSettings } from '../types';

interface LetterpadBillViewProps {
  document: BillDocument;
  settings: BusinessSettings;
  className?: string;
  isPrintOnly?: boolean;
}

// Helper to format Indian currency without decimals if whole number
export function formatIndianNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  const rounded = Math.round(num);
  return new Intl.NumberFormat('en-IN').format(rounded);
}

// Helper to format date like 23.06.26 (DD.MM.YY)
export function formatLetterpadDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

export const LetterpadBillView: React.FC<LetterpadBillViewProps> = ({
  document: doc,
  settings,
  className = '',
  isPrintOnly = false,
}) => {
  const isInvoice = doc.documentType === 'INVOICE';

  // Primary brand phone & emails
  const phoneNumbers = settings.phone || '95 6666 4663, 95 6632 9666';
  const emailAddress = settings.email || 'pixelgraphic.cbe@gmail.com';
  const addressText = settings.address || '286, D.B Road, R.S Puram, Coimbatore - 641 002.';
  const websiteUrl = 'www.pixelgraphic.in';
  const brandName = settings.businessName || 'Pixel Graphic';
  const tagline = settings.tagline || 'create the dreams...';

  // Format total as 1,37,215/-
  const formattedGrandTotal = `${formatIndianNumber(doc.grandTotal)}/-`;

  // Default terms if none specified
  const termsList = (doc.termsAndConditions && doc.termsAndConditions.length > 0)
    ? doc.termsAndConditions
    : [
        '70% Advance Before Work Starts.',
        'Designing Charge Separate.',
        'Any Design & Spelling Corrections Is At Customer Risk.',
      ];

  return (
    <div
      id="letterpad-bill-container"
      className={`bg-white text-slate-900 w-full max-w-[820px] mx-auto rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:rounded-none p-5 sm:p-8 md:p-10 font-sans ${className}`}
      style={{ minHeight: '1050px' }}
    >
      {/* ===================== TOP HEADER ===================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3">
        {/* Left Side: Contact Information with Cyan Outline Icons */}
        <div className="space-y-1.5 text-xs sm:text-[13px] text-slate-800 font-semibold max-w-sm">
          {/* Phone */}
          <div className="flex items-center gap-2">
            <div className="text-[#00a2e8] shrink-0">
              <Phone size={15} strokeWidth={2.2} />
            </div>
            <span className="tracking-wide">{phoneNumbers}</span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <div className="text-[#00a2e8] shrink-0">
              <Mail size={15} strokeWidth={2.2} />
            </div>
            <span className="tracking-wide lowercase">{emailAddress}</span>
          </div>

          {/* Address with Curly Brace Decor */}
          <div className="flex items-start gap-2 pt-0.5">
            <div className="text-[#00a2e8] shrink-0 mt-0.5">
              <MapPin size={15} strokeWidth={2.2} />
            </div>
            <div className="flex items-center gap-1 leading-snug">
              <div>
                <p>286, D.B Road, R.S Puram,</p>
                <p>Coimbatore - 641 002.</p>
              </div>
              <span className="text-[#00a2e8] text-xl font-light select-none ml-0.5">{'}'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Pixel Graphic Brand & Logo */}
        <div className="text-right sm:self-center">
          <div className="inline-flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2d2825]">
              {brandName}
            </h1>
            {/* Iconic 4-Square Pixel Logo Mark */}
            <div className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0">
              <div className="w-2.5 h-2.5 bg-[#2d2825] rounded-[2px]" />
              <div className="w-2.5 h-2.5 bg-[#2d2825] rounded-[2px]" />
              <div className="w-2.5 h-2.5 bg-[#00a2e8] rounded-[2px]" />
              <div className="w-2.5 h-2.5 bg-[#00a2e8] rounded-[2px]" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#00a2e8] tracking-wide mt-0.5 font-serif italic">
            {tagline}
          </p>
        </div>
      </div>

      {/* ===================== TOP BLUE LINE ===================== */}
      <div className="w-full h-1 bg-[#00a2e8] rounded-full my-3" />

      {/* ===================== CUSTOMER & DATE BAR ===================== */}
      <div className="flex justify-between items-center py-2.5 px-0.5">
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900">
            {doc.customerName ? doc.customerName.toUpperCase() : 'V SMILE DENTAL STUDIO'}
          </h2>
          {doc.customerMobile && (
            <p className="text-xs text-slate-500 font-medium">
              Ph: {doc.customerMobile}
              {doc.customerAddress ? ` | ${doc.customerAddress}` : ''}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
            {formatLetterpadDate(doc.date) || '23.06.26'}
          </span>
          <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            {isInvoice ? `INV #${doc.documentNumber}` : `QT #${doc.documentNumber}`}
          </div>
        </div>
      </div>

      {/* ===================== TABLE SECTION ===================== */}
      <div className="w-full mt-2 mb-4 space-y-1.5">
        {/* Table Header: Dark Charcoal Brown Rounded Pills */}
        <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-white text-xs font-bold text-center select-none">
          {/* S.No */}
          <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
            <span>S.No</span>
          </div>
          {/* DESCRIPTION */}
          <div className="col-span-5 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center tracking-wider">
            <span>DESCRIPTION</span>
          </div>
          {/* Total Sqft */}
          <div className="col-span-2 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center leading-tight">
            <span>Total<br className="hidden sm:inline" /> Sqft</span>
          </div>
          {/* Qty */}
          <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
            <span>Qty</span>
          </div>
          {/* Price */}
          <div className="col-span-1 sm:col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
            <span>Price</span>
          </div>
          {/* Amount */}
          <div className="col-span-2 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
            <span>Amount</span>
          </div>
        </div>

        {/* Table Rows: Each Cell is an Individual Rounded Rectangle */}
        {doc.items.map((item, idx) => {
          // Format item description like "12 x 4 - Feet - CNC LED Sign"
          let descriptionText = item.productName;
          if (item.calculationType === 'AREA' && item.width && item.height) {
            descriptionText = `${item.width} x ${item.height} - Feet - ${item.productName}`;
          }

          const hasArea = item.calculationType === 'AREA' && item.area > 0;
          const sqftDisplay = hasArea ? Math.round(item.area) : '-';
          const qtyDisplay = item.quantity || 1;
          const priceDisplay = formatIndianNumber(item.rate);
          const amountDisplay = formatIndianNumber(item.amount);

          return (
            <div
              key={item.id || idx}
              className="grid grid-cols-12 gap-1.5 sm:gap-2 text-slate-800 text-xs sm:text-[13px] font-semibold items-stretch"
            >
              {/* S.No Box */}
              <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                <span>{idx + 1}</span>
              </div>

              {/* DESCRIPTION Box */}
              <div className="col-span-5 border border-slate-300 rounded-lg py-2 px-2.5 sm:px-3 flex items-center bg-white text-left font-bold text-slate-900 truncate">
                <span title={descriptionText} className="truncate">
                  {descriptionText}
                </span>
              </div>

              {/* Total Sqft Box */}
              <div className="col-span-2 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                <span>{sqftDisplay}</span>
              </div>

              {/* Qty Box */}
              <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                <span>{qtyDisplay}</span>
              </div>

              {/* Price Box */}
              <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                <span>{priceDisplay}</span>
              </div>

              {/* Amount Box */}
              <div className="col-span-2 border border-slate-300 rounded-lg py-2 px-2 flex items-center justify-center bg-white font-bold text-slate-900">
                <span>{amountDisplay}</span>
              </div>
            </div>
          );
        })}

        {/* Additional Charges Rows (e.g. Transport & Installation) */}
        {doc.additionalCharges &&
          doc.additionalCharges.map((chg, cIdx) => (
            <div
              key={chg.id || `chg_${cIdx}`}
              className="grid grid-cols-12 gap-1.5 sm:gap-2 text-slate-800 text-xs sm:text-[13px] font-semibold items-stretch"
            >
              <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                <span>{doc.items.length + cIdx + 1}</span>
              </div>
              <div className="col-span-5 border border-slate-300 rounded-lg py-2 px-2.5 sm:px-3 flex items-center bg-white font-bold text-slate-900">
                <span>{chg.label}</span>
              </div>
              <div className="col-span-2 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                <span>-</span>
              </div>
              <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                <span>-</span>
              </div>
              <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                <span>-</span>
              </div>
              <div className="col-span-2 border border-slate-300 rounded-lg py-2 px-2 flex items-center justify-center bg-white font-bold text-slate-900">
                <span>{formatIndianNumber(chg.amount)}</span>
              </div>
            </div>
          ))}

        {/* If no items */}
        {doc.items.length === 0 && (!doc.additionalCharges || doc.additionalCharges.length === 0) && (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
            No items in this document yet.
          </div>
        )}
      </div>

      {/* ===================== TOTAL ROW ===================== */}
      <div className="flex justify-end items-center gap-3 pt-2 pb-5">
        <span className="text-base sm:text-lg font-bold text-slate-900">Total</span>
        <div className="border border-slate-300 rounded-lg px-4 py-2 min-w-[130px] sm:min-w-[150px] text-center bg-white">
          <span className="text-base sm:text-lg font-black text-slate-900 tracking-wider">
            {formattedGrandTotal}
          </span>
        </div>
      </div>

      {/* Optional: Advance & Balance (subtle if partially paid) */}
      {doc.advancePaid > 0 && (
        <div className="flex justify-end gap-4 text-xs font-semibold text-slate-600 pb-3 pr-2">
          <span>Advance Paid: {formatIndianNumber(doc.advancePaid)}</span>
          <span className="text-rose-600 font-bold">
            Balance Due: {formatIndianNumber(doc.balanceDue)}
          </span>
        </div>
      )}

      {/* ===================== TERMS & CONDITION ===================== */}
      <div className="pt-2 pb-6 space-y-1.5 text-left">
        <h3 className="text-sm sm:text-base font-black text-red-600 tracking-wide">
          Terms & Condition*
        </h3>
        <ul className="text-xs sm:text-[13px] font-bold text-slate-800 space-y-1 pl-1">
          {termsList.map((term, tIdx) => (
            <li key={tIdx} className="flex items-start gap-1">
              <span className="text-slate-900 font-bold select-none">*</span>
              <span>{term.replace(/^\*\s*/, '')}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ===================== BOTTOM BLUE LINE ===================== */}
      <div className="w-full h-1 bg-[#00a2e8] rounded-full my-4" />

      {/* ===================== LETTER PAD FOOTER ===================== */}
      {/* 
        User Request:
        "and the bottom you can remove that details and something something is there , 
        give me a one blue line under that you can add the brand name contact address 
        mobile number mail ID website etc like a letter pad"
      */}
      <footer className="pt-1 pb-2 text-center text-slate-800 select-text">
        {/* Row 1: Brand Name in bold */}
        <div className="text-sm sm:text-base font-black tracking-wider text-slate-900 uppercase mb-1">
          {brandName}
        </div>

        {/* Row 2: Address */}
        <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed">
          {addressText}
        </p>

        {/* Row 3: Mobile, Email & Website with clean bullets */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-[12.5px] font-semibold text-slate-800 mt-1.5">
          <span className="inline-flex items-center gap-1">
            <Phone size={13} className="text-[#00a2e8]" />
            <span>Mobile: {phoneNumbers}</span>
          </span>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <span className="inline-flex items-center gap-1">
            <Mail size={13} className="text-[#00a2e8]" />
            <span>Email: {emailAddress}</span>
          </span>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <span className="inline-flex items-center gap-1">
            <Globe size={13} className="text-[#00a2e8]" />
            <span className="text-sky-700 font-bold">{websiteUrl}</span>
          </span>
        </div>
      </footer>
    </div>
  );
};
