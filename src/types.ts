export type CalculationType = 'AREA' | 'QUANTITY';

export interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  calculationType: CalculationType;
  defaultUnit: string; // e.g. 'Sq.ft', 'Pcs', 'Sets', 'Books', 'Pads', 'Pages', 'Pack'
  minPrice: number;
  maxPrice: number;
  defaultRate: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName?: string;
  description?: string;
}

export interface BillingItem {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  calculationType: CalculationType;
  width: number; // in feet (for Area calculation)
  height: number; // in feet (for Area calculation)
  area: number; // width * height
  quantity: number;
  unit: string;
  rate: number;
  minRate?: number;
  maxRate?: number;
  amount: number;
  notes?: string;
}

export type AdditionalChargeType = 
  | 'Designing' 
  | 'Angle charges' 
  | 'Fitting labour' 
  | 'Ladder/scuff folding charges' 
  | 'Transport charges'
  | 'Other';

export interface AdditionalCharge {
  id: string;
  type: AdditionalChargeType;
  label: string;
  amount: number;
}

export type DocumentType = 'QUOTATION' | 'INVOICE';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank transfer' | 'Card' | 'Other';

export interface PaymentRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  email?: string;
  gstNumber?: string;
  notes?: string;
  createdAt: string;
}

export type DocumentStatus = 'Draft' | 'Sent' | 'Approved' | 'Paid' | 'Partial' | 'Converted' | 'Cancelled';

export interface BillDocument {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  date: string;
  validUntil?: string; // For quotations (e.g. 15 days)
  
  // Customer details
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerEmail?: string;
  customerGst?: string;

  // Line Items
  items: BillingItem[];
  additionalCharges: AdditionalCharge[];

  // Calculation Breakdown
  subtotal: number;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  additionalChargesTotal: number;
  gstEnabled: boolean;
  gstPercentage: number;
  gstAmount: number;
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;

  // Payments
  payments: PaymentRecord[];

  // Metadata
  termsAndConditions: string[];
  status: DocumentStatus;
  convertedFromQuotationId?: string;
  convertedToInvoiceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  panNumber?: string;
  quotationPrefix: string;
  invoicePrefix: string;
  nextQuotationNumber: number;
  nextInvoiceNumber: number;
  defaultTaxPercentage: number;
  taxEnabledByDefault: boolean;
  currency: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  upiId: string;
  termsAndConditions: string[];
}
