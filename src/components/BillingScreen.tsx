import { useState, useEffect } from 'react';
import { 
  FileText, 
  Receipt, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  ArrowLeft, 
  Calculator, 
  DollarSign, 
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  Users,
  ChevronDown
} from 'lucide-react';
import { 
  BillDocument, 
  BillingItem, 
  AdditionalCharge, 
  AdditionalChargeType,
  Customer, 
  Product, 
  Category, 
  BusinessSettings, 
  CalculationType,
  PaymentMethod 
} from '../types';
import { 
  calculateArea, 
  calculateItemAmount, 
  calculateDocumentSummary, 
  formatCurrency 
} from '../utils/calculations';
import { generateNextNumber } from '../utils/storage';

interface BillingScreenProps {
  initialDocument?: BillDocument | null;
  defaultType?: 'QUOTATION' | 'INVOICE';
  categories: Category[];
  products: Product[];
  customers: Customer[];
  settings: BusinessSettings;
  onSaveDocument: (doc: BillDocument) => void;
  onPreviewDocument: (doc: BillDocument) => void;
  onCancel: () => void;
  onAddNewCustomer: (customer: Customer) => void;
}

const PRESET_ADDITIONAL_CHARGES: { type: AdditionalChargeType; defaultLabel: string }[] = [
  { type: 'Designing', defaultLabel: 'Graphic & Artwork Designing Charges' },
  { type: 'Angle charges', defaultLabel: 'Iron Angle & Structural Mounting Charges' },
  { type: 'Fitting labour', defaultLabel: 'On-site Fitting & Installation Labour' },
  { type: 'Ladder/scuff folding charges', defaultLabel: 'Scaffolding & Ladder Setup Charges' },
  { type: 'Transport charges', defaultLabel: 'Delivery & Transport Charges' },
];

export function BillingScreen({
  initialDocument,
  defaultType = 'QUOTATION',
  categories,
  products,
  customers,
  settings,
  onSaveDocument,
  onPreviewDocument,
  onCancel,
  onAddNewCustomer
}: BillingScreenProps) {
  // Document Type: Quotation vs Invoice
  const [docType, setDocType] = useState<'QUOTATION' | 'INVOICE'>(
    initialDocument?.documentType || defaultType
  );

  // Document Number & Dates
  const [docNumber, setDocNumber] = useState<string>(() => {
    if (initialDocument?.documentNumber) return initialDocument.documentNumber;
    return generateNextNumber(defaultType).documentNumber;
  });

  const [date, setDate] = useState<string>(() => {
    if (initialDocument?.date) return initialDocument.date.split('T')[0];
    return new Date().toISOString().split('T')[0];
  });

  const [validUntil, setValidUntil] = useState<string>(() => {
    if (initialDocument?.validUntil) return initialDocument.validUntil.split('T')[0];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 15);
    return expiry.toISOString().split('T')[0];
  });

  // Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialDocument?.customerId || '');
  const [customerName, setCustomerName] = useState<string>(initialDocument?.customerName || '');
  const [customerMobile, setCustomerMobile] = useState<string>(initialDocument?.customerMobile || '');
  const [customerAddress, setCustomerAddress] = useState<string>(initialDocument?.customerAddress || '');
  const [customerGst, setCustomerGst] = useState<string>(initialDocument?.customerGst || '');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Line items state
  const [items, setItems] = useState<BillingItem[]>(() => {
    if (initialDocument?.items && initialDocument.items.length > 0) {
      return initialDocument.items;
    }
    // Default initial blank item
    return [];
  });

  // Active Line Item Drawer / Form for adding or editing
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Draft item being added/edited
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemCalculationType, setItemCalculationType] = useState<CalculationType>('AREA');
  const [itemWidth, setItemWidth] = useState<string>('10');
  const [itemHeight, setItemHeight] = useState<string>('5');
  const [itemQuantity, setItemQuantity] = useState<string>('1');
  const [itemUnit, setItemUnit] = useState<string>('Sq.ft');
  const [itemRate, setItemRate] = useState<string>('50');
  const [itemMinRate, setItemMinRate] = useState<number | undefined>(undefined);
  const [itemMaxRate, setItemMaxRate] = useState<number | undefined>(undefined);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [itemCustomName, setItemCustomName] = useState<string>('');

  // Additional Charges state
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>(
    initialDocument?.additionalCharges || []
  );

  // Discounts, GST & Payments
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>(
    initialDocument?.discountType || 'FIXED'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialDocument?.discountValue || 0
  );
  const [gstEnabled, setGstEnabled] = useState<boolean>(
    initialDocument ? initialDocument.gstEnabled : settings.taxEnabledByDefault
  );
  const [gstPercentage, setGstPercentage] = useState<number>(
    initialDocument?.gstPercentage || settings.defaultTaxPercentage || 18
  );
  const [advancePaid, setAdvancePaid] = useState<number>(
    initialDocument?.advancePaid || 0
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialDocument?.payments?.[0]?.method || 'UPI'
  );
  const [paymentReference, setPaymentReference] = useState<string>(
    initialDocument?.payments?.[0]?.reference || ''
  );

  // Validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // On type change, update prefix if creating fresh
  const handleDocTypeChange = (newType: 'QUOTATION' | 'INVOICE') => {
    if (newType === docType) return;
    setDocType(newType);
    if (!initialDocument) {
      const generated = generateNextNumber(newType);
      setDocNumber(generated.documentNumber);
    }
  };

  // Handle Customer Selection
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.id);
    setCustomerName(cust.name);
    setCustomerMobile(cust.mobile);
    setCustomerAddress(cust.address);
    setCustomerGst(cust.gstNumber || '');
    setShowCustomerDropdown(false);
    setCustomerSearchQuery('');
  };

  // When Product is selected in line item form
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setItemCalculationType(prod.calculationType);
      setItemUnit(prod.defaultUnit);
      setItemMinRate(prod.minPrice);
      setItemMaxRate(prod.maxPrice);
      setItemRate(prod.defaultRate.toString());
      setItemCustomName(prod.name);

      if (prod.calculationType === 'AREA') {
        if (!itemWidth || itemWidth === '0') setItemWidth('10');
        if (!itemHeight || itemHeight === '0') setItemHeight('5');
      }
    }
  };

  // Pre-load first product when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const prods = products.filter(p => p.categoryId === selectedCategoryId);
      if (prods.length > 0 && (!selectedProductId || !prods.some(p => p.id === selectedProductId))) {
        handleSelectProduct(prods[0].id);
      }
    }
  }, [selectedCategoryId]);

  // Open modal to add new line item
  const handleStartAddItem = () => {
    setEditingItemId(null);
    const firstCat = categories[0]?.id || '';
    setSelectedCategoryId(firstCat);
    const catProds = products.filter(p => p.categoryId === firstCat);
    if (catProds.length > 0) {
      handleSelectProduct(catProds[0].id);
    } else {
      setSelectedProductId('');
      setItemCalculationType('AREA');
      setItemUnit('Sq.ft');
      setItemRate('50');
      setItemWidth('10');
      setItemHeight('5');
    }
    setItemQuantity('1');
    setItemNotes('');
    setIsAddingItem(true);
  };

  // Open modal to edit existing line item
  const handleEditItem = (item: BillingItem) => {
    setEditingItemId(item.id);
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      setSelectedCategoryId(prod.categoryId);
      setSelectedProductId(prod.id);
    }
    setItemCustomName(item.productName);
    setItemCalculationType(item.calculationType);
    setItemWidth(item.width.toString());
    setItemHeight(item.height.toString());
    setItemQuantity(item.quantity.toString());
    setItemUnit(item.unit);
    setItemRate(item.rate.toString());
    setItemMinRate(item.minRate);
    setItemMaxRate(item.maxRate);
    setItemNotes(item.notes || '');
    setIsAddingItem(true);
  };

  // Save Item to list
  const handleSaveItemToList = () => {
    // Validation
    const qty = Number(itemQuantity);
    const rate = Number(itemRate);
    const width = Number(itemWidth);
    const height = Number(itemHeight);

    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive quantity.');
      return;
    }
    if (isNaN(rate) || rate < 0) {
      alert('Please enter a valid rate (cannot be negative).');
      return;
    }
    if (itemCalculationType === 'AREA') {
      if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) {
        alert('For Area-based products, both Width and Height must be greater than 0 feet.');
        return;
      }
    }

    const calculatedArea = itemCalculationType === 'AREA' ? calculateArea(width, height) : 0;
    const amount = calculateItemAmount({
      calculationType: itemCalculationType,
      width,
      height,
      area: calculatedArea,
      quantity: qty,
      rate
    });

    const prod = products.find(p => p.id === selectedProductId);
    const cat = categories.find(c => c.id === selectedCategoryId);

    const newItem: BillingItem = {
      id: editingItemId || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: selectedProductId || 'custom_item',
      productName: itemCustomName || prod?.name || 'Custom Printing Item',
      categoryName: cat?.name || prod?.categoryName || 'General',
      calculationType: itemCalculationType,
      width: itemCalculationType === 'AREA' ? width : 0,
      height: itemCalculationType === 'AREA' ? height : 0,
      area: calculatedArea,
      quantity: qty,
      unit: itemUnit || (itemCalculationType === 'AREA' ? 'Sq.ft' : 'Pcs'),
      rate,
      minRate: itemMinRate,
      maxRate: itemMaxRate,
      amount,
      notes: itemNotes
    };

    if (editingItemId) {
      setItems(items.map(it => (it.id === editingItemId ? newItem : it)));
    } else {
      setItems([...items, newItem]);
    }

    setIsAddingItem(false);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  // Add Additional Charge
  const handleAddChargePreset = (preset: { type: AdditionalChargeType; defaultLabel: string }) => {
    // Prevent duplicate of exact same type unless desired
    const newCharge: AdditionalCharge = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type: preset.type,
      label: preset.defaultLabel,
      amount: 500 // default initial sensible value
    };
    setAdditionalCharges([...additionalCharges, newCharge]);
  };

  const handleUpdateCharge = (id: string, updates: Partial<AdditionalCharge>) => {
    setAdditionalCharges(
      additionalCharges.map(chg => (chg.id === id ? { ...chg, ...updates } : chg))
    );
  };

  const handleRemoveCharge = (id: string) => {
    setAdditionalCharges(additionalCharges.filter(chg => chg.id !== id));
  };

  // Live Summary Calculation
  const summary = calculateDocumentSummary({
    items,
    additionalCharges,
    discountType,
    discountValue,
    gstEnabled,
    gstPercentage,
    advancePaid
  });

  // Construct Document Object for saving or previewing
  const buildCurrentDocument = (): BillDocument => {
    return {
      id: initialDocument?.id || `doc_${Date.now()}`,
      documentType: docType,
      documentNumber: docNumber,
      date: new Date(date).toISOString(),
      validUntil: docType === 'QUOTATION' ? new Date(validUntil).toISOString() : undefined,
      customerId: selectedCustomerId || 'guest',
      customerName: customerName.trim() || 'Walk-in Customer',
      customerMobile: customerMobile.trim(),
      customerAddress: customerAddress.trim(),
      customerGst: customerGst.trim() || undefined,
      items,
      additionalCharges,
      subtotal: summary.subtotal,
      discountType,
      discountValue,
      discountAmount: summary.discountAmount,
      additionalChargesTotal: summary.additionalChargesTotal,
      gstEnabled,
      gstPercentage,
      gstAmount: summary.gstAmount,
      grandTotal: summary.grandTotal,
      advancePaid,
      balanceDue: summary.balanceDue,
      payments: advancePaid > 0 ? [
        {
          id: `pay_${Date.now()}`,
          amount: advancePaid,
          method: paymentMethod,
          date: new Date().toISOString(),
          reference: paymentReference
        }
      ] : (initialDocument?.payments || []),
      termsAndConditions: initialDocument?.termsAndConditions || settings.termsAndConditions,
      status: summary.balanceDue <= 0 && summary.grandTotal > 0 ? 'Paid' : (advancePaid > 0 ? 'Partial' : 'Draft'),
      createdAt: initialDocument?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Validate and submit
  const handleSave = () => {
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError('Please enter customer name or select a customer.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (items.length === 0) {
      setValidationError('Please add at least one line item to the bill.');
      return;
    }

    const doc = buildCurrentDocument();

    // Auto-save new customer if mobile is provided and customer does not already exist
    if (customerMobile.trim() && !selectedCustomerId) {
      const exists = customers.some(c => c.mobile.replace(/\D/g, '') === customerMobile.replace(/\D/g, ''));
      if (!exists) {
        onAddNewCustomer({
          id: `cust_${Date.now()}`,
          name: customerName.trim(),
          mobile: customerMobile.trim(),
          address: customerAddress.trim(),
          gstNumber: customerGst.trim() || undefined,
          createdAt: new Date().toISOString()
        });
      }
    }

    onSaveDocument(doc);
  };

  const handlePreview = () => {
    const doc = buildCurrentDocument();
    onPreviewDocument(doc);
  };

  // Filter customers for autocomplete
  const filteredCustomers = customerSearchQuery.trim()
    ? customers.filter(
        c =>
          c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
          c.mobile.includes(customerSearchQuery)
      )
    : customers.slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-3.5 pt-3 pb-28 space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          {/* Quotation vs Invoice Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleDocTypeChange('QUOTATION')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                docType === 'QUOTATION'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>Quotation</span>
            </button>
            <button
              type="button"
              onClick={() => handleDocTypeChange('INVOICE')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                docType === 'INVOICE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt size={14} />
              <span>Tax Invoice</span>
            </button>
          </div>
        </div>

        {/* Document Number & Date Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              {docType === 'INVOICE' ? 'Invoice No.' : 'Quote No.'}
            </label>
            <input
              type="text"
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {docType === 'QUOTATION' && (
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Customer Details Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users size={15} className="text-indigo-600" />
            <span>Customer Details</span>
          </h3>

          {/* Quick Autocomplete Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md"
            >
              <span>Existing Customers</span>
              <ChevronDown size={13} />
            </button>

            {showCustomerDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 space-y-1">
                <input
                  type="text"
                  placeholder="Search customer name/phone..."
                  value={customerSearchQuery}
                  onChange={e => setCustomerSearchQuery(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pt-1">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-2 text-[11px] text-slate-400 text-center">No matching customer found</div>
                  ) : (
                    filteredCustomers.map(cust => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className="w-full text-left p-2 hover:bg-indigo-50 rounded-lg text-xs transition"
                      >
                        <div className="font-bold text-slate-800">{cust.name}</div>
                        <div className="text-[11px] text-slate-500">{cust.mobile}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Customer / Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Hospital, Sharma Traders"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={customerMobile}
              onChange={e => setCustomerMobile(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Delivery / Billing Address
            </label>
            <input
              type="text"
              placeholder="e.g. Shop 4, Main Market, MG Road"
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Customer GSTIN (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 27ABCDE1234F1Z5"
              value={customerGst}
              onChange={e => setCustomerGst(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
            />
          </div>
        </div>
      </div>

      {/* Line Items Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Product & Service Items ({items.length})
            </h3>
            <p className="text-[11px] text-slate-400">Area calculation (Width × Height) or Piece rate</p>
          </div>

          <button
            type="button"
            onClick={handleStartAddItem}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus size={15} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Empty state or Items List */}
        {items.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Calculator size={28} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-700">No products added yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5 mb-3">
              Tap the button below to pick an item from the preloaded pricing catalog.
            </p>
            <button
              type="button"
              onClick={handleStartAddItem}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition inline-flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Select Product</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {item.productName}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 shrink-0">
                      {item.calculationType === 'AREA' ? 'Sq.ft Area' : 'Unit'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 pl-7">
                    {item.calculationType === 'AREA' ? (
                      <span>
                        Size: <strong className="text-slate-800">{item.width}ft × {item.height}ft</strong> = <strong className="text-indigo-600">{item.area} Sq.ft</strong> | Qty: {item.quantity} | Rate: {formatCurrency(item.rate)}/sq.ft
                      </span>
                    ) : (
                      <span>
                        Qty: <strong className="text-slate-800">{item.quantity} {item.unit}</strong> | Rate: {formatCurrency(item.rate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-7 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <div className="text-sm font-black text-slate-900">
                    {formatCurrency(item.amount)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                      title="Edit Item"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Remove Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Line Item Edit/Add Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-900 text-sm">
                {editingItemId ? 'Edit Line Item' : 'Add Product to Bill'}
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base p-1"
              >
                ✕
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Product Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Select Product / Service
              </label>
              <select
                value={selectedProductId}
                onChange={e => handleSelectProduct(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {products
                  .filter(p => p.categoryId === selectedCategoryId)
                  .map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.calculationType === 'AREA' ? 'Sq.ft' : prod.defaultUnit})
                      {prod.minPrice && prod.maxPrice && prod.minPrice !== prod.maxPrice 
                        ? ` [Range: ₹${prod.minPrice} - ₹${prod.maxPrice}]` 
                        : ` [₹${prod.defaultRate}]`}
                    </option>
                  ))}
              </select>
            </div>

            {/* Custom Item Name (Editable) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Item Title / Description on Bill
              </label>
              <input
                type="text"
                value={itemCustomName}
                onChange={e => setItemCustomName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Calculation Type Toggle: Area vs Quantity */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Calculation Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setItemCalculationType('AREA');
                    setItemUnit('Sq.ft');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    itemCalculationType === 'AREA'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Calculator size={14} />
                  <span>Area-Based (Sq.ft)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setItemCalculationType('QUANTITY');
                    if (itemUnit === 'Sq.ft') setItemUnit('Pcs');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    itemCalculationType === 'QUANTITY'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Plus size={14} />
                  <span>Quantity-Based</span>
                </button>
              </div>
            </div>

            {/* Dimensions: Width x Height if Area-based */}
            {itemCalculationType === 'AREA' ? (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <div className="text-xs font-bold text-indigo-900">
                  Enter Dimensions in Feet (Width × Height):
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Width (Feet)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={itemWidth}
                      onChange={e => setItemWidth(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Height (Feet)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={itemHeight}
                      onChange={e => setItemHeight(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Auto Calculated Area Display */}
                <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60 text-xs font-semibold text-indigo-950">
                  <span>Calculated Area:</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-black">
                    {calculateArea(Number(itemWidth), Number(itemHeight))} Sq.ft
                  </span>
                </div>
              </div>
            ) : null}

            {/* Quantity and Unit Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={itemQuantity}
                  onChange={e => setItemQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={itemUnit}
                  onChange={e => setItemUnit(e.target.value)}
                  placeholder="Sq.ft / Pcs / Sets / Books"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Rate & Price Range Handling */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Rate per {itemCalculationType === 'AREA' ? 'Sq.ft' : itemUnit || 'Unit'} (₹)
                </label>
                {itemMinRate !== undefined && itemMaxRate !== undefined && itemMinRate !== itemMaxRate && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Range: ₹{itemMinRate} – ₹{itemMaxRate}
                  </span>
                )}
              </div>

              {/* Price Range helper quick chips */}
              {itemMinRate !== undefined && itemMaxRate !== undefined && itemMinRate !== itemMaxRate && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-medium">Quick select:</span>
                  <button
                    type="button"
                    onClick={() => setItemRate(itemMinRate.toString())}
                    className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-indigo-500 text-[11px] font-semibold text-slate-700"
                  >
                    Min: ₹{itemMinRate}
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemRate(Math.round((itemMinRate + itemMaxRate) / 2).toString())}
                    className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-indigo-500 text-[11px] font-semibold text-slate-700"
                  >
                    Avg: ₹{Math.round((itemMinRate + itemMaxRate) / 2)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemRate(itemMaxRate.toString())}
                    className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-indigo-500 text-[11px] font-semibold text-slate-700"
                  >
                    Max: ₹{itemMaxRate}
                  </button>
                </div>
              )}

              <input
                type="number"
                step="0.5"
                min="0"
                value={itemRate}
                onChange={e => setItemRate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Calculated Item Total Preview */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                Item Total Amount:
              </span>
              <span className="text-base font-black text-emerald-800">
                {formatCurrency(
                  calculateItemAmount({
                    calculationType: itemCalculationType,
                    width: Number(itemWidth),
                    height: Number(itemHeight),
                    area: calculateArea(Number(itemWidth), Number(itemHeight)),
                    quantity: Number(itemQuantity),
                    rate: Number(itemRate)
                  })
                )}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItemToList}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
              >
                {editingItemId ? 'Update Line Item' : 'Add to Bill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Charges Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Additional Charges
            </h3>
            <p className="text-[11px] text-slate-400">Fitting, scaffolding, angles, design, transport</p>
          </div>
        </div>

        {/* Quick presets buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Add:</span>
          {PRESET_ADDITIONAL_CHARGES.map(preset => {
            const alreadyAdded = additionalCharges.some(chg => chg.type === preset.type);
            return (
              <button
                key={preset.type}
                type="button"
                onClick={() => handleAddChargePreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  alreadyAdded
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                <Plus size={12} />
                <span>{preset.type}</span>
              </button>
            );
          })}
        </div>

        {/* List of active additional charges */}
        {additionalCharges.length > 0 && (
          <div className="space-y-2 pt-1">
            {additionalCharges.map(chg => (
              <div
                key={chg.id}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={chg.label}
                    onChange={e => handleUpdateCharge(chg.id, { label: e.target.value })}
                    className="w-full text-xs font-semibold text-slate-800 bg-transparent border-none p-0 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 uppercase">{chg.type}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1">
                    <span className="text-xs text-slate-500 mr-1">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={chg.amount}
                      onChange={e => handleUpdateCharge(chg.id, { amount: Number(e.target.value) || 0 })}
                      className="w-20 text-xs font-bold text-slate-900 focus:outline-none text-right"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCharge(chg.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Summary Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
          Billing Summary & Tax Breakdown
        </h3>

        {/* Subtotal */}
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span>Items Subtotal:</span>
          <span className="font-bold text-slate-900">{formatCurrency(summary.subtotal)}</span>
        </div>

        {/* Discount Control */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Discount:</span>
            <div className="flex items-center gap-1">
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as 'PERCENT' | 'FIXED')}
                className="text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="FIXED">₹ Fixed</option>
                <option value="PERCENT">% Percent</option>
              </select>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value) || 0)}
                className="w-20 text-xs font-bold text-right bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-900 focus:outline-none"
              />
            </div>
          </div>
          {summary.discountAmount > 0 && (
            <div className="flex justify-between text-[11px] text-rose-600 font-medium">
              <span>Applied Discount:</span>
              <span>- {formatCurrency(summary.discountAmount)}</span>
            </div>
          )}
        </div>

        {/* Additional charges total */}
        {summary.additionalChargesTotal > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span>Additional Charges:</span>
            <span className="font-bold text-slate-900">{formatCurrency(summary.additionalChargesTotal)}</span>
          </div>
        )}

        {/* GST Toggle & Rate */}
        <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gstEnabled}
              onChange={e => setGstEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">Apply GST / Tax</span>
          </label>

          {gstEnabled && (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="28"
                value={gstPercentage}
                onChange={e => setGstPercentage(Number(e.target.value) || 0)}
                className="w-12 text-xs font-bold text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
              />
              <span className="text-xs font-semibold text-slate-600">%</span>
              <span className="text-xs font-bold text-slate-900 ml-1">
                ({formatCurrency(summary.gstAmount)})
              </span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300 block">
              Grand Total
            </span>
            <span className="text-xs text-slate-300">All inclusive</span>
          </div>
          <div className="text-xl font-black text-white">
            {formatCurrency(summary.grandTotal)}
          </div>
        </div>

        {/* Advance & Balance Due */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
              Advance Paid (₹)
            </label>
            <input
              type="number"
              min="0"
              value={advancePaid}
              onChange={e => setAdvancePaid(Number(e.target.value) || 0)}
              className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-sm font-black text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setAdvancePaid(Math.round(summary.grandTotal * 0.6))}
                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-1.5 py-0.5 rounded transition shadow-xs"
                title="60% Advance before work starts as per quotation terms"
              >
                60% Adv
              </button>
              <button
                type="button"
                onClick={() => setAdvancePaid(Math.round(summary.grandTotal * 0.5))}
                className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold px-1.5 py-0.5 rounded transition"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setAdvancePaid(summary.grandTotal)}
                className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold px-1.5 py-0.5 rounded transition"
              >
                Full
              </button>
              {advancePaid > 0 && (
                <button
                  type="button"
                  onClick={() => setAdvancePaid(0)}
                  className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold px-1 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
            <span className="block text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">
              Balance Due
            </span>
            <div className="text-base font-black text-rose-700 pt-0.5">
              {formatCurrency(summary.balanceDue)}
            </div>
          </div>
        </div>

        {/* Payment details if advance is recorded */}
        {advancePaid > 0 && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              Advance Payment Method:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['UPI', 'Cash', 'Bank transfer', 'Card', 'Other'] as PaymentMethod[]).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1 px-2 rounded-lg text-xs font-semibold transition ${
                    paymentMethod === method
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Transaction Reference / Note (e.g. GPay UPI Ref 928374...)"
              value={paymentReference}
              onChange={e => setPaymentReference(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 max-w-lg mx-auto md:max-w-3xl shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-300"
          >
            <Eye size={16} />
            <span>Preview PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition"
          >
            <Save size={16} />
            <span>Save {docType === 'INVOICE' ? 'Invoice' : 'Quotation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
