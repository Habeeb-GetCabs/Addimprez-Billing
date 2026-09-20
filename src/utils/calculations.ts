import { BillingItem, AdditionalCharge } from '../types';

/**
 * Calculates Area in Sq.ft
 * Width (ft) × Height (ft) = Area (Sq.ft)
 */
export function calculateArea(width: number, height: number): number {
  const w = Math.max(0, Number(width) || 0);
  const h = Math.max(0, Number(height) || 0);
  const area = w * h;
  // Round to 2 decimal places to avoid floating point anomalies (e.g. 10.25 sqft)
  return Math.round(area * 100) / 100;
}

/**
 * Calculates item line total according to calculation type
 * AREA: Area × Sq.ft Rate × Quantity
 * QUANTITY: Quantity × Rate
 */
export function calculateItemAmount(item: {
  calculationType: 'AREA' | 'QUANTITY';
  width?: number;
  height?: number;
  area?: number;
  quantity: number;
  rate: number;
}): number {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const rate = Math.max(0, Number(item.rate) || 0);

  if (item.calculationType === 'AREA') {
    const area = item.area !== undefined && item.area !== null
      ? Math.max(0, Number(item.area) || 0)
      : calculateArea(item.width || 0, item.height || 0);
    return Math.round(area * rate * qty * 100) / 100;
  } else {
    return Math.round(qty * rate * 100) / 100;
  }
}

export interface DocumentSummaryCalculation {
  subtotal: number;
  discountAmount: number;
  additionalChargesTotal: number;
  taxableAmount: number;
  gstAmount: number;
  grandTotal: number;
  balanceDue: number;
}

export function calculateDocumentSummary(params: {
  items: BillingItem[];
  additionalCharges: AdditionalCharge[];
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  gstEnabled: boolean;
  gstPercentage: number;
  advancePaid: number;
}): DocumentSummaryCalculation {
  const subtotal = params.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  const additionalChargesTotal = params.additionalCharges.reduce(
    (sum, chg) => sum + (Number(chg.amount) || 0), 
    0
  );

  let discountAmount = 0;
  const rawDiscount = Math.max(0, Number(params.discountValue) || 0);
  if (params.discountType === 'PERCENT') {
    discountAmount = (subtotal * Math.min(100, rawDiscount)) / 100;
  } else {
    discountAmount = Math.min(subtotal, rawDiscount);
  }
  discountAmount = Math.round(discountAmount * 100) / 100;

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxableAmount = Math.round((afterDiscount + additionalChargesTotal) * 100) / 100;

  let gstAmount = 0;
  if (params.gstEnabled) {
    const pct = Math.max(0, Number(params.gstPercentage) || 0);
    gstAmount = Math.round((taxableAmount * pct) / 100 * 100) / 100;
  }

  const grandTotal = Math.round((taxableAmount + gstAmount) * 100) / 100;
  const advance = Math.max(0, Number(params.advancePaid) || 0);
  const balanceDue = Math.max(0, Math.round((grandTotal - advance) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    additionalChargesTotal: Math.round(additionalChargesTotal * 100) / 100,
    taxableAmount,
    gstAmount,
    grandTotal,
    balanceDue
  };
}

/**
 * Formats currency in Indian numbering system e.g. ₹1,25,000.00 or ₹5,000
 */
export function formatCurrency(amount: number, symbol = '₹'): string {
  const val = Number(amount) || 0;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  // Format with Indian Rupee formatting
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: val % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(absVal);

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
