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

// Helper to format date like 23.06.26 (DD.MM.YY) or 23.06.2026
export function formatLetterpadDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear());
  return `${day}.${month}.${year}`;
}

export const LetterpadBillView: React.FC<LetterpadBillViewProps> = ({
  document: doc,
  settings,
  className = '',
  isPrintOnly = false,
}) => {
  const isInvoice = doc.documentType === 'INVOICE';

  // Permanent Locked Pixel Graphic Brand Identity
  const brandName = 'Pixel Graphic';
  const tagline = 'create the dreams...';
  const phoneNumbers = '95 6666 4663, 95 6632 9666';
  const emailAddress = 'pixelgraphic.cbe@gmail.com';
  const addressLine1 = '286, D.B Road, R.S Puram,';
  const addressLine2 = 'Coimbatore - 641 002.';
  const websiteUrl = 'www.pixelgraphic.in';

  // Format total as 1,80,500/-
  const formattedGrandTotal = `${formatIndianNumber(doc.grandTotal)}/-`;

  // Default terms matching uploaded reference
  const termsList = (doc.termsAndConditions && doc.termsAndConditions.length > 0)
    ? doc.termsAndConditions
    : [
        '* Scaffolding Customer Risk',
        '* Vehicle Rent Customer Risk',
        '* Designing Charge Separate.',
        '* Installation Charge Separate.',
        '* 80% Advance Before Work Starts.',
        '* Amount May Be Varied For Some Critical Works.',
        '* MS Work Price Per Kg Cannot Be Mention Until We Finish The Work'
      ];

  const hasGst = doc.gstEnabled;

  return (
    <div
      id="letterpad-bill-container"
      className={`relative bg-white text-slate-900 w-full max-w-[820px] mx-auto rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:rounded-none p-5 sm:p-8 md:p-10 font-sans overflow-hidden ${className}`}
      style={{ minHeight: '1080px' }}
    >
      {/* ===================== 1. DIAGONAL WATERMARK ===================== */}
      {/* Requirement #12: Diagonal cross-over "PIXEL GRAPHIC" watermark embedded behind content */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none overflow-hidden"
      >
        <div className="transform -rotate-[32deg] text-slate-900/[0.04] print:text-slate-900/[0.055] font-black text-6xl sm:text-7xl md:text-8xl tracking-[0.25em] uppercase whitespace-nowrap">
          PIXEL GRAPHIC
        </div>
      </div>

      {/* Main Letterpad Content */}
      <div className="relative z-10">
        {/* ===================== 2. TOP HEADER ===================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-2">
          {/* Left Side: Contact Information with Cyan Outline Icons & Bracket */}
          <div className="space-y-1.5 text-xs sm:text-[13px] text-slate-800 font-bold max-w-sm">
            {/* Phone */}
            <div className="flex items-center gap-2">
              <div className="text-[#00a2e8] shrink-0">
                <Phone size={15} strokeWidth={2.4} />
              </div>
              <span className="tracking-wide">{phoneNumbers}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <div className="text-[#00a2e8] shrink-0">
                <Mail size={15} strokeWidth={2.4} />
              </div>
              <span className="tracking-wide lowercase">{emailAddress}</span>
            </div>

            {/* Address with Curly Brace Decor */}
            <div className="flex items-start gap-2 pt-0.5">
              <div className="text-[#00a2e8] shrink-0 mt-0.5">
                <MapPin size={15} strokeWidth={2.4} />
              </div>
              <div className="flex items-center gap-1.5 leading-snug">
                <div>
                  <p>{addressLine1}</p>
                  <p>{addressLine2}</p>
                </div>
                <span className="text-[#00a2e8] text-2xl font-light select-none">{'}'}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Pixel Graphic Brand & 4-Square Pixel Logo Mark */}
          <div className="text-right sm:self-start">
            <div className="inline-flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2d2825]">
                {brandName}
              </h1>
              {/* Exact 4-Square Pixel Logo Mark: Top row [Cyan, Dark], Bottom row [Cyan, Cyan] */}
              <div className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0 mt-0.5">
                <div className="w-2.5 h-2.5 bg-[#00a2e8] rounded-[2px]" />
                <div className="w-2.5 h-2.5 bg-[#2d2825] rounded-[2px]" />
                <div className="w-2.5 h-2.5 bg-[#00a2e8] rounded-[2px]" />
                <div className="w-2.5 h-2.5 bg-[#00a2e8] rounded-[2px]" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#00a2e8] tracking-widest mt-0.5 font-serif italic">
              {tagline}
            </p>
          </div>
        </div>

        {/* ===================== 3. TOP BLUE LINE ===================== */}
        <div className="w-full h-1 bg-[#00a2e8] rounded-full my-3" />

        {/* ===================== 4. CUSTOMER & DATE BAR ===================== */}
        <div className="flex justify-between items-center py-2 px-0.5">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900">
              {doc.customerName ? doc.customerName.toUpperCase() : 'THE MAPLE WAFFLE - BANGALORE'}
            </h2>
            {doc.customerMobile && (
              <p className="text-xs text-slate-600 font-medium">
                Ph: {doc.customerMobile}
                {doc.customerAddress ? ` | ${doc.customerAddress}` : ''}
              </p>
            )}
            {hasGst && doc.customerGst && (
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                GSTIN: <span className="font-bold text-slate-800">{doc.customerGst}</span>
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
              {formatLetterpadDate(doc.date) || '23.06.2026'}
            </span>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
              {isInvoice ? `INV #${doc.documentNumber}` : `QT #${doc.documentNumber}`}
            </div>
          </div>
        </div>

        {/* ===================== 5. TABLE SECTION ===================== */}
        <div className="w-full mt-2 mb-4 space-y-1.5">
          {/* Table Header: Dark Charcoal Brown Rounded Pills */}
          {hasGst ? (
            /* GST Version with HSN and GST info */
            <div className="grid grid-cols-12 gap-1 sm:gap-1.5 text-white text-[11px] font-bold text-center select-none">
              <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>S.No</span>
              </div>
              <div className="col-span-4 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center tracking-wider">
                <span>DESCRIPTION</span>
              </div>
              <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>HSN</span>
              </div>
              <div className="col-span-2 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center leading-tight">
                <span>Total Sqft</span>
              </div>
              <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>Qty</span>
              </div>
              <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>Price</span>
              </div>
              <div className="col-span-2 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>Amount</span>
              </div>
            </div>
          ) : (
            /* Clean Non-GST Version matching uploaded reference image */
            <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-white text-xs font-bold text-center select-none">
              <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>S.No</span>
              </div>
              <div className="col-span-5 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center tracking-wider">
                <span>DESCRIPTION</span>
              </div>
              <div className="col-span-2 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center leading-tight">
                <span>Total Sqft</span>
              </div>
              <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>Qty</span>
              </div>
              <div className="col-span-1 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>Price</span>
              </div>
              <div className="col-span-2 bg-[#342e2b] rounded-lg py-2 flex items-center justify-center">
                <span>Amount</span>
              </div>
            </div>
          )}

          {/* Table Rows: Each Cell is an Individual Rounded Rectangle */}
          {doc.items.map((item, idx) => {
            // Description formatting
            let descriptionText = item.productName;
            if (item.calculationType === 'AREA' && item.width && item.height) {
              descriptionText = `${item.width} x ${item.height} - Feet - ${item.productName}`;
            } else if (item.calculationType === 'PACKAGE') {
              const packageUnits = item.packageSize ? `${formatIndianNumber(item.packageSize)} ${item.packageUnit || 'Flyers'}` : '';
              descriptionText = packageUnits 
                ? `${item.productName} (1 pkg = ${packageUnits})` 
                : item.productName;
            }

            const hasArea = item.calculationType === 'AREA' && item.area > 0;
            const sqftDisplay = hasArea ? Math.round(item.area) : '-';
            
            // Quantity display for packages vs pieces vs sqft
            let qtyDisplay = `${item.quantity || 1}`;
            if (item.calculationType === 'PACKAGE') {
              qtyDisplay = item.quantity === 1 ? '1 Pkg' : `${item.quantity} Pkgs`;
            } else if (item.calculationType === 'AREA') {
              qtyDisplay = '-';
            }

            const priceDisplay = formatIndianNumber(item.rate);
            const amountDisplay = formatIndianNumber(item.amount);
            const hsnDisplay = item.hsnCode || '998314';

            if (hasGst) {
              return (
                <div
                  key={item.id || idx}
                  className="grid grid-cols-12 gap-1 sm:gap-1.5 text-slate-800 text-[11px] sm:text-xs font-semibold items-stretch"
                >
                  <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                    <span>{idx + 1}</span>
                  </div>
                  <div className="col-span-4 border border-slate-300 rounded-lg py-2 px-2 flex items-center bg-white text-left font-bold text-slate-900 truncate">
                    <span title={descriptionText} className="truncate">
                      {descriptionText}
                    </span>
                  </div>
                  <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white text-[10px] text-slate-600">
                    <span>{hsnDisplay}</span>
                  </div>
                  <div className="col-span-2 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                    <span>{sqftDisplay}</span>
                  </div>
                  <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                    <span>{qtyDisplay}</span>
                  </div>
                  <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                    <span>{priceDisplay}</span>
                  </div>
                  <div className="col-span-2 border border-slate-300 rounded-lg py-2 px-1.5 flex items-center justify-center bg-white font-bold text-slate-900">
                    <span>{amountDisplay}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id || idx}
                className="grid grid-cols-12 gap-1.5 sm:gap-2 text-slate-800 text-xs sm:text-[13px] font-semibold items-stretch"
              >
                <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                  <span>{idx + 1}</span>
                </div>
                <div className="col-span-5 border border-slate-300 rounded-lg py-2 px-2.5 sm:px-3 flex items-center bg-white text-left font-bold text-slate-900 truncate">
                  <span title={descriptionText} className="truncate">
                    {descriptionText}
                  </span>
                </div>
                <div className="col-span-2 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                  <span>{sqftDisplay}</span>
                </div>
                <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                  <span>{qtyDisplay}</span>
                </div>
                <div className="col-span-1 border border-slate-300 rounded-lg py-2 flex items-center justify-center bg-white">
                  <span>{priceDisplay}</span>
                </div>
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
                <div className={`${hasGst ? 'col-span-5' : 'col-span-5'} border border-slate-300 rounded-lg py-2 px-2.5 sm:px-3 flex items-center bg-white font-bold text-slate-900`}>
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
        </div>

        {/* ===================== 6. TOTAL & TAX BREAKDOWN ===================== */}
        <div className="flex flex-col items-end gap-1.5 pt-1 pb-4">
          {hasGst && (
            <div className="w-full max-w-xs space-y-1 text-xs text-slate-700 font-semibold mb-2">
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span>Taxable Subtotal:</span>
                <span>₹{formatIndianNumber(doc.subtotal + (doc.additionalChargesTotal || 0) - (doc.discountAmount || 0))}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span>CGST ({doc.gstPercentage ? doc.gstPercentage / 2 : 9}%):</span>
                <span>₹{formatIndianNumber(doc.gstAmount ? doc.gstAmount / 2 : 0)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span>SGST ({doc.gstPercentage ? doc.gstPercentage / 2 : 9}%):</span>
                <span>₹{formatIndianNumber(doc.gstAmount ? doc.gstAmount / 2 : 0)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-bold text-slate-900">Total</span>
            <div className="border border-slate-300 rounded-lg px-4 py-2 min-w-[140px] sm:min-w-[160px] text-center bg-white">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-wider">
                {formattedGrandTotal}
              </span>
            </div>
          </div>

          {/* Payment Status Badges */}
          {isInvoice && (
            <div className="flex items-center gap-2 mt-1">
              {doc.balanceDue <= 0 ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  Status: PAID
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2.5 py-0.5 rounded-full">
                  Status: UNPAID (Balance Due: ₹{formatIndianNumber(doc.balanceDue)})
                </span>
              )}
            </div>
          )}
        </div>

        {/* ===================== 7. PRODUCT SHOWCASE IMAGE ===================== */}
        {/* Requirement #3: Display attached product/design showcase image on first page */}
        {doc.showcaseImage && (
          <div className="my-4 rounded-xl border border-slate-300 overflow-hidden bg-slate-50/70 p-3 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00a2e8]"></span>
              <span>Design Reference & Product Showcase</span>
            </div>
            <div className="w-full flex items-center justify-center max-h-80 overflow-hidden rounded-lg bg-white border border-slate-200 p-1">
              <img
                src={doc.showcaseImage}
                alt="Product Design Showcase"
                className="max-h-76 w-auto max-w-full object-contain rounded"
              />
            </div>
          </div>
        )}

        {/* ===================== 8. TERMS & CONDITION ===================== */}
        <div className="pt-2 pb-4 space-y-1.5 text-left">
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

        {/* ===================== 9. BOTTOM BLUE LINE ===================== */}
        <div className="w-full h-1 bg-[#00a2e8] rounded-full my-3" />

        {/* ===================== 10. 3-LINE SERVICE CATALOG FOOTER ===================== */}
        {/* Exact service catalog footer from the uploaded reference IMG-20260920-WA0191.jpg */}
        <div className="text-center text-[10.5px] sm:text-xs font-bold text-slate-800 tracking-wide space-y-1 my-2 select-text leading-tight">
          <p>
            Graphic Design <span className="text-[#00a2e8] px-1 font-black">|</span> Logo <span className="text-[#00a2e8] px-1 font-black">|</span> LED Signs <span className="text-[#00a2e8] px-1 font-black">|</span> ACP Elevation <span className="text-[#00a2e8] px-1 font-black">|</span> Flex Board
          </p>
          <p>
            Advertisement <span className="text-[#00a2e8] px-1 font-black">|</span> Vinyl Sticker <span className="text-[#00a2e8] px-1 font-black">|</span> Standee <span className="text-[#00a2e8] px-1 font-black">|</span> Brochures <span className="text-[#00a2e8] px-1 font-black">|</span> Visiting Card
          </p>
          <p>
            Printing <span className="text-[#00a2e8] px-1 font-black">|</span> Painting <span className="text-[#00a2e8] px-1 font-black">|</span> Pre-Ink Stamps <span className="text-[#00a2e8] px-1 font-black">|</span> Bill Book <span className="text-[#00a2e8] px-1 font-black">|</span> Letter Head <span className="text-[#00a2e8] px-1 font-black">|</span> ID card
          </p>
        </div>
      </div>
    </div>
  );
};
