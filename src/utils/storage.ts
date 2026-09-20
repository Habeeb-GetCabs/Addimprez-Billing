import { 
  Category, 
  Product, 
  Customer, 
  BillDocument, 
  BusinessSettings 
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_BUSINESS_SETTINGS 
} from '../data/initialDatabase';

const STORAGE_KEYS = {
  CATEGORIES: 'pixel_graphic_categories_v2',
  PRODUCTS: 'pixel_graphic_products_v2',
  CUSTOMERS: 'pixel_graphic_customers_v2',
  DOCUMENTS: 'pixel_graphic_documents_v2',
  SETTINGS: 'pixel_graphic_settings_v2',
};

// --- Storage Helper Functions ---
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// --- Categories ---
export function getCategories(): Category[] {
  const categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  if (!categories || categories.length === 0) {
    setStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  }
  return categories;
}

export function saveCategories(categories: Category[]): void {
  setStored(STORAGE_KEYS.CATEGORIES, categories);
}

// --- Products ---
export function getProducts(): Product[] {
  const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (!products || products.length === 0) {
    setStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }
  return products;
}

export function saveProducts(products: Product[]): void {
  setStored(STORAGE_KEYS.PRODUCTS, products);
}

export function saveProduct(product: Product): Product[] {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  let updated: Product[];
  if (index >= 0) {
    updated = [...products];
    updated[index] = product;
  } else {
    updated = [product, ...products];
  }
  saveProducts(updated);
  return updated;
}

export function deleteProduct(productId: string): Product[] {
  const products = getProducts().filter(p => p.id !== productId);
  saveProducts(products);
  return products;
}

// --- Customers ---
export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Kovai Medical Care Center',
    mobile: '98422 12345',
    address: 'D.B. Road, R.S. Puram, Coimbatore - 641002',
    email: 'contact@kovaimedical.in',
    gstNumber: '33ABCDE1234F1Z5',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: 'Prescription pads (A4/A5 single & 2 colors), glow sign boards, and acrylic sneeze guards'
  },
  {
    id: 'cust_2',
    name: 'Anand Sweets & Bakery',
    mobile: '97876 54321',
    address: 'Cross Cut Road, Gandhipuram, Coimbatore - 641012',
    email: 'anandbakerycbe@gmail.com',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    notes: 'Promotional flyers, star flex banners, and 1+1 carbonless bill books'
  },
  {
    id: 'cust_3',
    name: 'PSG Tech College Club',
    mobile: '94433 88776',
    address: 'Avinashi Road, Peelamedu, Coimbatore - 641004',
    email: 'events@psgtech.edu',
    gstNumber: '33AABCP9988H1Z1',
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    notes: 'Roll up standees (3x6 ft) and A4 color notices for symposium'
  }
];

export function getCustomers(): Customer[] {
  const customers = getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  if (!customers || customers.length === 0) {
    setStored(STORAGE_KEYS.CUSTOMERS, SAMPLE_CUSTOMERS);
    return SAMPLE_CUSTOMERS;
  }
  return customers;
}

export function saveCustomers(customers: Customer[]): void {
  setStored(STORAGE_KEYS.CUSTOMERS, customers);
}

export function saveCustomer(customer: Customer): Customer[] {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  let updated: Customer[];
  if (index >= 0) {
    updated = [...customers];
    updated[index] = customer;
  } else {
    updated = [customer, ...customers];
  }
  saveCustomers(updated);
  return updated;
}

// --- Documents (Quotations & Invoices) ---
export const SAMPLE_QUOTATION_DOCUMENT: BillDocument = {
  id: 'doc_sample_vsmile',
  documentType: 'QUOTATION',
  documentNumber: 'PG-QT-101',
  date: '2026-06-23',
  customerId: 'cust_vsmile',
  customerName: 'V SMILE DENTAL STUDIO',
  customerMobile: '9566664663',
  customerAddress: 'R.S. Puram, Coimbatore',
  items: [
    {
      id: 'item_1',
      productId: 'pg_p1_item1',
      productName: 'CNC LED Sign',
      categoryName: 'LED Signs',
      calculationType: 'AREA',
      width: 12,
      height: 4,
      area: 48,
      quantity: 1,
      unit: 'Sq.ft',
      rate: 850,
      amount: 40800,
    },
    {
      id: 'item_2',
      productId: 'pg_p1_item2',
      productName: 'Star Flex With Frame',
      categoryName: 'Flex & Sign Boards',
      calculationType: 'AREA',
      width: 11,
      height: 3,
      area: 33,
      quantity: 1,
      unit: 'Sq.ft',
      rate: 85,
      amount: 2805,
    },
    {
      id: 'item_3',
      productId: 'pg_p1_item3',
      productName: 'CNC LED Sign',
      categoryName: 'LED Signs',
      calculationType: 'AREA',
      width: 8,
      height: 4,
      area: 32,
      quantity: 2,
      unit: 'Sq.ft',
      rate: 850,
      amount: 54400,
    },
    {
      id: 'item_4',
      productId: 'pg_p1_item4',
      productName: 'Teeth logo 2 x 2',
      categoryName: 'Acrylic Products',
      calculationType: 'QUANTITY',
      width: 2,
      height: 2,
      area: 4,
      quantity: 1,
      unit: 'Piece',
      rate: 4000,
      amount: 4000,
    },
    {
      id: 'item_5',
      productId: 'pg_p1_item5',
      productName: 'UV Sun Pack',
      categoryName: 'Vinyl & Foam Boards',
      calculationType: 'QUANTITY',
      width: 0,
      height: 0,
      area: 0,
      quantity: 20,
      unit: 'Piece',
      rate: 220,
      amount: 4400,
    },
    {
      id: 'item_6',
      productId: 'pg_p1_item6',
      productName: 'Double Side Roll Up Standee 3 x 6',
      categoryName: 'Standees & Displays',
      calculationType: 'QUANTITY',
      width: 3,
      height: 6,
      area: 18,
      quantity: 1,
      unit: 'Piece',
      rate: 3700,
      amount: 3700,
    },
    {
      id: 'item_7',
      productId: 'pg_p1_item7',
      productName: 'Front Door One Way Vision Sticker 7 x 3',
      categoryName: 'Vinyl & Foam Boards',
      calculationType: 'AREA',
      width: 7,
      height: 3,
      area: 21,
      quantity: 1,
      unit: 'Sq.ft',
      rate: 95,
      amount: 1995,
    },
    {
      id: 'item_8',
      productId: 'pg_p1_item8',
      productName: 'Star Flex With Frame',
      categoryName: 'Flex & Sign Boards',
      calculationType: 'AREA',
      width: 11,
      height: 2,
      area: 22,
      quantity: 1,
      unit: 'Sq.ft',
      rate: 85,
      amount: 1870,
    },
    {
      id: 'item_9',
      productId: 'pg_p1_item9',
      productName: 'Star Flex With Frame',
      categoryName: 'Flex & Sign Boards',
      calculationType: 'AREA',
      width: 9,
      height: 2,
      area: 18,
      quantity: 1,
      unit: 'Sq.ft',
      rate: 85,
      amount: 1530,
    },
    {
      id: 'item_10',
      productId: 'pg_p1_item10',
      productName: 'Acrylic Board',
      categoryName: 'Acrylic Products',
      calculationType: 'AREA',
      width: 4,
      height: 3,
      area: 12,
      quantity: 1,
      unit: 'Sq.ft',
      rate: 260,
      amount: 3120,
    },
  ],
  additionalCharges: [
    {
      id: 'chg_1',
      label: 'Transport & Installation',
      amount: 14395,
      type: 'Transport charges',
    },
  ],
  subtotal: 122820,
  discountType: 'PERCENT',
  discountValue: 0,
  discountAmount: 0,
  additionalChargesTotal: 14395,
  gstEnabled: false,
  gstPercentage: 0,
  gstAmount: 0,
  grandTotal: 137215,
  advancePaid: 0,
  balanceDue: 137215,
  status: 'Sent',
  createdAt: '2026-06-23T10:00:00.000Z',
  updatedAt: '2026-06-23T10:00:00.000Z',
  termsAndConditions: [
    '70% Advance Before Work Starts.',
    'Designing Charge Separate.',
    'Any Design & Spelling Corrections Is At Customer Risk.',
  ],
  payments: [],
};

export function getDocuments(): BillDocument[] {
  const docs = getStored<BillDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  if (docs.length === 0) {
    const legacy = getStored<BillDocument[]>('lividus_documents_v1', []);
    if (legacy.length > 0) {
      setStored(STORAGE_KEYS.DOCUMENTS, legacy);
      return legacy;
    }
    setStored(STORAGE_KEYS.DOCUMENTS, [SAMPLE_QUOTATION_DOCUMENT]);
    return [SAMPLE_QUOTATION_DOCUMENT];
  }
  return docs;
}

export function saveDocuments(docs: BillDocument[]): void {
  setStored(STORAGE_KEYS.DOCUMENTS, docs);
}

export function saveDocument(doc: BillDocument): BillDocument[] {
  const docs = getDocuments();
  const index = docs.findIndex(d => d.id === doc.id);
  let updated: BillDocument[];
  if (index >= 0) {
    updated = [...docs];
    updated[index] = { ...doc, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...doc, createdAt: doc.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }, ...docs];
  }
  saveDocuments(updated);
  return updated;
}

export function deleteDocument(docId: string): BillDocument[] {
  const docs = getDocuments().filter(d => d.id !== docId);
  saveDocuments(docs);
  return docs;
}

// --- Business Settings ---
export function getBusinessSettings(): BusinessSettings {
  const settings = getStored<BusinessSettings>(STORAGE_KEYS.SETTINGS, INITIAL_BUSINESS_SETTINGS);
  return { 
    ...INITIAL_BUSINESS_SETTINGS, 
    ...settings,
    // Official company branding is permanently fixed per user directive:
    businessName: 'addimprez',
    tagline: 'create the dreams...',
    logoUrl: '/assets/addimprez-logo.png'
  };
}

export function saveBusinessSettings(settings: BusinessSettings): void {
  const lockedSettings: BusinessSettings = {
    ...settings,
    businessName: 'addimprez',
    tagline: 'create the dreams...',
    logoUrl: '/assets/addimprez-logo.png'
  };
  setStored(STORAGE_KEYS.SETTINGS, lockedSettings);
}

export function generateNextNumber(type: 'QUOTATION' | 'INVOICE'): { documentNumber: string; updatedSettings: BusinessSettings } {
  const settings = getBusinessSettings();
  if (type === 'QUOTATION') {
    const num = settings.nextQuotationNumber || 101;
    const documentNumber = `${settings.quotationPrefix || 'QT-'}${num}`;
    const updatedSettings = { ...settings, nextQuotationNumber: num + 1 };
    saveBusinessSettings(updatedSettings);
    return { documentNumber, updatedSettings };
  } else {
    const num = settings.nextInvoiceNumber || 201;
    const documentNumber = `${settings.invoicePrefix || 'INV-'}${num}`;
    const updatedSettings = { ...settings, nextInvoiceNumber: num + 1 };
    saveBusinessSettings(updatedSettings);
    return { documentNumber, updatedSettings };
  }
}

// --- Backup & Restore ---
export interface AppBackupData {
  version: number;
  exportedAt: string;
  categories: Category[];
  products: Product[];
  customers: Customer[];
  documents: BillDocument[];
  settings: BusinessSettings;
}

export function exportDatabaseAsJson(): string {
  const data: AppBackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: getCategories(),
    products: getProducts(),
    customers: getCustomers(),
    documents: getDocuments(),
    settings: getBusinessSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDatabaseFromJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as AppBackupData;
    if (!data || !Array.isArray(data.products)) {
      throw new Error('Invalid backup file format.');
    }
    if (data.categories) saveCategories(data.categories);
    if (data.products) saveProducts(data.products);
    if (data.customers) saveCustomers(data.customers);
    if (data.documents) saveDocuments(data.documents);
    if (data.settings) saveBusinessSettings(data.settings);
    return true;
  } catch (err) {
    console.error('Failed to import database:', err);
    return false;
  }
}

// --- Aliases for compatibility ---
export const loadSettings = getBusinessSettings;
export const saveSettings = saveBusinessSettings;
export const loadCategories = getCategories;
export const loadProducts = getProducts;
export const loadCustomers = getCustomers;
export const loadDocuments = getDocuments;

// --- Payment Recording ---
export function recordPayment(docId: string, payment: { id?: string; amount: number; method: any; date: string; reference?: string }): BillDocument | null {
  const docs = getDocuments();
  const index = docs.findIndex(d => d.id === docId);
  if (index === -1) return null;

  const doc = docs[index];
  const payments = doc.payments || [];
  const normalizedPayment = {
    id: payment.id || `pay_${Date.now()}`,
    amount: payment.amount,
    method: payment.method,
    date: payment.date,
    reference: payment.reference
  };
  const updatedPayments = [...payments, normalizedPayment];
  const newAdvance = (doc.advancePaid || 0) + payment.amount;
  const newBalance = Math.max(0, doc.grandTotal - newAdvance);
  const updatedDoc: BillDocument = {
    ...doc,
    advancePaid: newAdvance,
    balanceDue: newBalance,
    payments: updatedPayments,
    status: newBalance <= 0 ? 'Paid' : 'Partial',
    updatedAt: new Date().toISOString()
  };

  docs[index] = updatedDoc;
  saveDocuments(docs);
  return updatedDoc;
}

// --- Convert Quotation to Invoice ---
export function convertQuotationToInvoice(quotation: BillDocument): BillDocument {
  const { documentNumber } = generateNextNumber('INVOICE');
  const newInvoice: BillDocument = {
    ...quotation,
    id: `inv_${Date.now()}`,
    documentType: 'INVOICE',
    documentNumber,
    date: new Date().toISOString(),
    validUntil: undefined,
    status: quotation.balanceDue <= 0 && quotation.grandTotal > 0 ? 'Paid' : (quotation.advancePaid > 0 ? 'Partial' : 'Draft'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mark quotation as converted
  const updatedQuotation: BillDocument = {
    ...quotation,
    convertedToInvoiceId: newInvoice.id,
    updatedAt: new Date().toISOString()
  };

  saveDocument(updatedQuotation);
  saveDocument(newInvoice);
  return newInvoice;
}

// --- Backup File Helpers ---
export function exportDatabaseJson(): void {
  const json = exportDatabaseAsJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lividus_billing_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDatabaseJson(jsonString: string): { success: boolean; error?: string } {
  const ok = importDatabaseFromJson(jsonString);
  if (ok) return { success: true };
  return { success: false, error: 'Invalid or corrupted backup JSON file.' };
}

export function resetToInitialPriceDatabase(): void {
  saveCategories(INITIAL_CATEGORIES);
  saveProducts(INITIAL_PRODUCTS);
  saveCustomers(SAMPLE_CUSTOMERS);
  saveBusinessSettings(INITIAL_BUSINESS_SETTINGS);
}

