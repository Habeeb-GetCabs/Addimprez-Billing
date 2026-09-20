import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Receipt, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  ArrowLeft, 
  Calculator, 
  Package as PackageIcon,
  Check, 
  AlertTriangle, 
  Users, 
  ChevronDown,
  Search,
  Image as ImageIcon,
  X,
  Upload,
  Sparkles,
  CheckCircle2
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
import { generateNextNumber, saveProduct } from '../utils/storage';

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
  onAddNewProduct?: (product: Product) => void;
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
  onAddNewCustomer,
  onAddNewProduct
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
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Line Items state
  const [items, setItems] = useState<BillingItem[]>(initialDocument?.items || []);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Product Search & Add Item state
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemCalculationType, setItemCalculationType] = useState<CalculationType>('AREA');
  const [itemWidth, setItemWidth] = useState<string>('10');
  const [itemHeight, setItemHeight] = useState<string>('5');
  const [itemQuantity, setItemQuantity] = useState<string>('1');
  const [itemUnit, setItemUnit] = useState<string>('Sq.ft');
  const [itemPackageSize, setItemPackageSize] = useState<string>('1000');
  const [itemPackageUnit, setItemPackageUnit] = useState<string>('Flyers');
  const [itemRate, setItemRate] = useState<string>('50');
  const [itemMinRate, setItemMinRate] = useState<number | undefined>(undefined);
  const [itemMaxRate, setItemMaxRate] = useState<number | undefined>(undefined);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [itemCustomName, setItemCustomName] = useState<string>('');
  const [itemHsnCode, setItemHsnCode] = useState<string>('998314');

  // Quick "+ Add New Product" Sub-Form State
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategoryId, setNewProdCategoryId] = useState(categories[0]?.id || '');
  const [newProdCalcType, setNewProdCalcType] = useState<CalculationType>('QUANTITY');
  const [newProdRate, setNewProdRate] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Pcs');
  const [newProdPackageSize, setNewProdPackageSize] = useState('1000');

  // Product Showcase Image state
  const [showcaseImage, setShowcaseImage] = useState<string | undefined>(
    initialDocument?.showcaseImage
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Filter products based on search query or category
  const filteredProducts = products.filter(p => {
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.defaultUnit.toLowerCase().includes(q)
      );
    }
    return p.categoryId === selectedCategoryId;
  });

  // Handle Document Type change
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

  // Handle Product Selection
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
      } else if (prod.calculationType === 'PACKAGE') {
        setItemPackageSize('1000');
        setItemPackageUnit(prod.defaultUnit || 'Flyers');
      }
    }
  };

  // Open modal to add new line item
  const handleStartAddItem = () => {
    setEditingItemId(null);
    setProductSearchQuery('');
    setIsCreatingProduct(false);
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
    setProductSearchQuery('');
    setIsCreatingProduct(false);
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      setSelectedCategoryId(prod.categoryId);
      setSelectedProductId(prod.id);
    }
    setItemCustomName(item.productName);
    setItemCalculationType(item.calculationType);
    setItemWidth(item.width?.toString() || '10');
    setItemHeight(item.height?.toString() || '5');
    setItemQuantity(item.quantity.toString());
    setItemUnit(item.unit);
    setItemRate(item.rate.toString());
    setItemMinRate(item.minRate);
    setItemMaxRate(item.maxRate);
    setItemPackageSize(item.packageSize?.toString() || '1000');
    setItemPackageUnit(item.packageUnit || 'Flyers');
    setItemHsnCode(item.hsnCode || '998314');
    setItemNotes(item.notes || '');
    setIsAddingItem(true);
  };

  // Quick Save New Product to Permanent Database
  const handleQuickCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert('Please enter a product name.');
      return;
    }
    const cat = categories.find(c => c.id === newProdCategoryId) || categories[0];
    const rateVal = Number(newProdRate) || 100;
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      categoryId: cat.id,
      categoryName: cat.name,
      name: newProdName.trim(),
      calculationType: newProdCalcType,
      minPrice: rateVal,
      maxPrice: rateVal,
      defaultRate: rateVal,
      defaultUnit: newProdCalcType === 'AREA' ? 'Sq.ft' : (newProdCalcType === 'PACKAGE' ? 'Pkg' : newProdUnit),
      notes: newProdCalcType === 'PACKAGE' ? `1 Pkg = ${newProdPackageSize} flyers` : undefined
    };

    saveProduct(newProduct);
    if (onAddNewProduct) {
      onAddNewProduct(newProduct);
    }

    // Immediately select this product for the current line item
    setSelectedCategoryId(newProduct.categoryId);
    setSelectedProductId(newProduct.id);
    setItemCustomName(newProduct.name);
    setItemCalculationType(newProduct.calculationType);
    setItemRate(newProduct.defaultRate.toString());
    setItemUnit(newProduct.defaultUnit);
    if (newProduct.calculationType === 'PACKAGE') {
      setItemPackageSize(newProdPackageSize);
      setItemPackageUnit('Flyers');
    }
    setIsCreatingProduct(false);
    setNewProdName('');
  };

  // Save Item to list
  const handleSaveItemToList = () => {
    const qty = Number(itemQuantity);
    const rate = Number(itemRate);
    const width = Number(itemWidth);
    const height = Number(itemHeight);
    const pkgSize = Number(itemPackageSize);

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
      productName: itemCustomName || prod?.name || 'Custom Product',
      categoryName: cat?.name || prod?.categoryName || 'General',
      calculationType: itemCalculationType,
      width: itemCalculationType === 'AREA' ? width : 0,
      height: itemCalculationType === 'AREA' ? height : 0,
      area: calculatedArea,
      quantity: qty,
      unit: itemCalculationType === 'PACKAGE' ? 'Pkg' : (itemUnit || (itemCalculationType === 'AREA' ? 'Sq.ft' : 'Pcs')),
      packageSize: itemCalculationType === 'PACKAGE' ? pkgSize : undefined,
      packageUnit: itemCalculationType === 'PACKAGE' ? itemPackageUnit : undefined,
      hsnCode: gstEnabled ? itemHsnCode : undefined,
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
    const newCharge: AdditionalCharge = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type: preset.type,
      label: preset.defaultLabel,
      amount: 500
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

  // Handle Image Upload for Showcase
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      setShowcaseImage(dataUrl);
    };
    reader.readAsDataURL(file);
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

  // Construct Document Object
  const buildCurrentDocument = (): BillDocument => {
    const isPaid = docType === 'INVOICE' && summary.balanceDue <= 0 && summary.grandTotal > 0;
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
      gstPercentage: gstEnabled ? gstPercentage : 0,
      gstAmount: gstEnabled ? summary.gstAmount : 0,
      grandTotal: summary.grandTotal,
      advancePaid,
      balanceDue: summary.balanceDue,
      showcaseImage,
      quotationStatus: docType === 'QUOTATION' ? (initialDocument?.quotationStatus || 'PENDING') : undefined,
      isPaid,
      paidAt: isPaid ? (initialDocument?.paidAt || new Date().toISOString()) : undefined,
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
      status: isPaid ? 'Paid' : (advancePaid > 0 ? 'Partial' : 'Draft'),
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
      setValidationError('Please add at least one line item.');
      return;
    }

    const doc = buildCurrentDocument();

    // Auto-save customer if mobile is provided
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

          {/* Quotation vs Tax Invoice Toggle */}
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
                  placeholder="Search name or mobile..."
                  value={customerSearchQuery}
                  onChange={e => setCustomerSearchQuery(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded-lg mb-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {customers
                    .filter(c =>
                      c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                      c.mobile.includes(customerSearchQuery)
                    )
                    .map(cust => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className="w-full text-left p-1.5 hover:bg-indigo-50 rounded text-xs transition"
                      >
                        <div className="font-bold text-slate-900">{cust.name}</div>
                        <div className="text-[10px] text-slate-500">{cust.mobile}</div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Customer / Business Name *
            </label>
            <input
              type="text"
              placeholder="e.g. The Maple Waffle - Bangalore"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Mobile Phone Number
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={customerMobile}
              onChange={e => setCustomerMobile(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Delivery Address / Site Location
            </label>
            <input
              type="text"
              placeholder="e.g. D.B Road, Coimbatore"
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {gstEnabled && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Customer GSTIN
              </label>
              <input
                type="text"
                placeholder="33AAAAA0000A1Z5"
                value={customerGst}
                onChange={e => setCustomerGst(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Line Items Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Quotation / Bill Items ({items.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={handleStartAddItem}
            className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition shadow-xs"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Empty state or Items List */}
        {items.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Calculator size={28} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-700">No products added yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5 mb-3">
              Tap the button below to pick an item from the preloaded pricing catalog or create a package.
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
                      {item.calculationType === 'AREA' ? 'Sq.ft' : (item.calculationType === 'PACKAGE' ? 'Package' : 'Unit')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 pl-7">
                    {item.calculationType === 'AREA' ? (
                      <span>
                        Size: <strong className="text-slate-800">{item.width}ft × {item.height}ft</strong> = <strong className="text-indigo-600">{item.area} Sq.ft</strong> | Rate: {formatCurrency(item.rate)}/sq.ft
                      </span>
                    ) : item.calculationType === 'PACKAGE' ? (
                      <span>
                        Qty: <strong className="text-slate-800">{item.quantity} {item.quantity > 1 ? 'Packages' : 'Package'}</strong> ({((item.packageSize || 1000) * item.quantity).toLocaleString()} {item.packageUnit || 'Flyers'}) | Rate: <strong className="text-indigo-600">{formatCurrency(item.rate)} / pkg</strong>
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
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition text-xs font-semibold"
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
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>{editingItemId ? 'Edit Line Item' : 'Add Product to Bill'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick "+ Add New Product" button & Product Search */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Product / Service Catalog
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingProduct(!isCreatingProduct)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>+ Add New Product</span>
                </button>
              </div>

              {/* Inline Quick Add Product Sub-Form (Requirement #6) */}
              {isCreatingProduct && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-900">
                      Create & Save New Product to Database
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProduct(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Product Name (e.g. 1000 Flyers / Acrylic Letters)"
                      value={newProdName}
                      onChange={e => setNewProdName(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select
                        value={newProdCalcType}
                        onChange={e => setNewProdCalcType(e.target.value as CalculationType)}
                        className="w-full text-xs bg-white border border-indigo-200 rounded-lg px-2 py-1.5 font-semibold"
                      >
                        <option value="QUANTITY">Quantity (Pcs/Units)</option>
                        <option value="AREA">Area (Sq.ft)</option>
                        <option value="PACKAGE">Package (e.g. 1000 Flyers)</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Rate / Price (₹)"
                        value={newProdRate}
                        onChange={e => setNewProdRate(e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                  {newProdCalcType === 'PACKAGE' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-indigo-900 font-semibold">1 Package =</span>
                      <input
                        type="number"
                        value={newProdPackageSize}
                        onChange={e => setNewProdPackageSize(e.target.value)}
                        className="w-20 text-xs bg-white border border-indigo-200 rounded px-2 py-1 font-bold"
                      />
                      <span className="text-[11px] text-indigo-900 font-semibold">Flyers / Pieces</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleQuickCreateProduct}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                  >
                    Save & Select This Product
                  </button>
                </div>
              )}

              {/* Search Box in Add Item Flow (Requirement #5) */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products: type FL, STAMP, ACP, LED, FLYER..."
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Product Selector Dropdown */}
              <div>
                <select
                  value={selectedProductId}
                  onChange={e => handleSelectProduct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {filteredProducts.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.calculationType === 'AREA' ? 'Sq.ft' : (prod.calculationType === 'PACKAGE' ? 'Pkg' : prod.defaultUnit)})
                      {prod.minPrice && prod.maxPrice && prod.minPrice !== prod.maxPrice 
                        ? ` [Range: ₹${prod.minPrice} - ₹${prod.maxPrice}]` 
                        : ` [₹${prod.defaultRate}]`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Item Name (Editable Title on Bill) */}
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

            {/* Calculation Method Selection: Area vs Quantity vs Package (Requirements #7, #8) */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Calculation Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setItemCalculationType('AREA');
                    setItemUnit('Sq.ft');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                    itemCalculationType === 'AREA'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Calculator size={13} />
                  <span>Sq.ft Area</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setItemCalculationType('QUANTITY');
                    if (itemUnit === 'Sq.ft' || itemUnit === 'Pkg') setItemUnit('Pcs');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                    itemCalculationType === 'QUANTITY'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Plus size={13} />
                  <span>Per Unit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setItemCalculationType('PACKAGE');
                    setItemUnit('Pkg');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                    itemCalculationType === 'PACKAGE'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <PackageIcon size={13} />
                  <span>Package</span>
                </button>
              </div>
            </div>

            {/* Area-based Inputs */}
            {itemCalculationType === 'AREA' && (
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

                <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60 text-xs font-semibold text-indigo-950">
                  <span>Calculated Area:</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-black">
                    {calculateArea(Number(itemWidth), Number(itemHeight))} Sq.ft
                  </span>
                </div>
              </div>
            )}

            {/* Package-based Pricing Inputs (Requirement #8) */}
            {itemCalculationType === 'PACKAGE' && (
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2.5">
                <div className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                  <PackageIcon size={14} className="text-amber-700" />
                  <span>Package Pricing Details (e.g. 1000 Flyers = ₹2,500)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-0.5">
                      Number of Packages
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={e => setItemQuantity(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-0.5">
                      Units per Package
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="100"
                      value={itemPackageSize}
                      onChange={e => setItemPackageSize(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-amber-900 font-semibold bg-amber-100/70 p-2 rounded-lg">
                  Total Items: <strong>{(Number(itemQuantity) * Number(itemPackageSize || 1000)).toLocaleString()} {itemPackageUnit}</strong> across <strong>{itemQuantity} package(s)</strong>.
                  <span className="block text-[10px] text-amber-800 font-normal mt-0.5">
                    * The quotation displays package rate directly without converting into a per-piece price.
                  </span>
                </div>
              </div>
            )}

            {/* Standard Quantity & Unit if not area and not package */}
            {itemCalculationType === 'QUANTITY' && (
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
                    placeholder="Pcs / Sets / Books"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Rate / Price Row */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Rate per {itemCalculationType === 'AREA' ? 'Sq.ft' : (itemCalculationType === 'PACKAGE' ? 'Package' : itemUnit || 'Unit')} (₹)
                </label>
                {itemMinRate !== undefined && itemMaxRate !== undefined && itemMinRate !== itemMaxRate && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Range: ₹{itemMinRate} – ₹{itemMaxRate}
                  </span>
                )}
              </div>

              <input
                type="number"
                step="0.5"
                min="0"
                value={itemRate}
                onChange={e => setItemRate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Conditional HSN Code (Only when GST is enabled - Requirement #9) */}
            {gstEnabled && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  HSN / SAC Code
                </label>
                <input
                  type="text"
                  value={itemHsnCode}
                  onChange={e => setItemHsnCode(e.target.value)}
                  placeholder="e.g. 998314 for design & printing"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            )}

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

      {/* Product Showcase Image Section (Requirement #3) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ImageIcon size={15} className="text-indigo-600" />
              <span>Product / Design Showcase Image (Optional)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Attach storefront or signage design reference to display on the quotation
            </p>
          </div>
        </div>

        {showcaseImage ? (
          <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 flex flex-col sm:flex-row items-center gap-4">
            <div className="max-h-40 max-w-sm overflow-hidden rounded-lg border border-slate-300 bg-white p-1">
              <img
                src={showcaseImage}
                alt="Showcase"
                className="max-h-36 w-auto object-contain"
              />
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 size={14} />
                <span>Showcase Image Attached</span>
              </span>
              <p className="text-xs text-slate-500">
                This design will appear framed on the first page of the quotation and generated PDF.
              </p>
              <button
                type="button"
                onClick={() => setShowcaseImage(undefined)}
                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition inline-flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Remove Image</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              <span>Upload Design Image from Device</span>
            </button>
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

        {/* Conditional GST Functionality (Requirement #9) */}
        <div className="space-y-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={e => setGstEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-bold text-slate-800">Apply GST Tax (CGST + SGST)</span>
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

          {gstEnabled && (
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>CGST ({gstPercentage / 2}%):</span>
                <span className="font-semibold">{formatCurrency(summary.gstAmount / 2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({gstPercentage / 2}%):</span>
                <span className="font-semibold">{formatCurrency(summary.gstAmount / 2)}</span>
              </div>
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

        {/* Invoice Payment Status Selection (Requirement #15) */}
        {docType === 'INVOICE' && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Invoice Payment Status:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdvancePaid(summary.grandTotal)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  advancePaid >= summary.grandTotal && summary.grandTotal > 0
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Check size={14} />
                <span>Mark as PAID (Full)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdvancePaid(0)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  advancePaid < summary.grandTotal
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Mark as UNPAID (Due)</span>
              </button>
            </div>
          </div>
        )}

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
                onClick={() => setAdvancePaid(Math.round(summary.grandTotal * 0.8))}
                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-1.5 py-0.5 rounded transition shadow-xs"
                title="80% Advance before work starts as per quotation terms"
              >
                80% Adv
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
              Payment Method:
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
