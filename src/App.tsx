import { useState, useEffect } from 'react';
import { 
  BillDocument, 
  Customer, 
  Product, 
  Category, 
  BusinessSettings, 
  PaymentRecord 
} from './types';
import { 
  loadSettings, 
  saveSettings, 
  loadCategories, 
  saveCategories, 
  loadProducts, 
  saveProducts, 
  loadCustomers, 
  saveCustomer, 
  loadDocuments, 
  saveDocument, 
  deleteDocument, 
  recordPayment, 
  convertQuotationToInvoice,
  resetToInitialPriceDatabase,
  generateNextNumber
} from './utils/storage';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav, NavigationTab } from './components/AndroidBottomNav';
import { DashboardView } from './components/DashboardView';
import { BillingScreen } from './components/BillingScreen';
import { DocumentListView } from './components/DocumentListView';
import { CustomerManagement } from './components/CustomerManagement';
import { PriceCatalogAdmin } from './components/PriceCatalogAdmin';
import { SettingsAndBackup } from './components/SettingsAndBackup';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  
  // Data States
  const [settings, setSettings] = useState<BusinessSettings>(loadSettings);
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);
  const [documents, setDocuments] = useState<BillDocument[]>(loadDocuments);

  // Billing flow state
  const [editingDoc, setEditingDoc] = useState<BillDocument | null>(null);
  const [defaultBillingType, setDefaultBillingType] = useState<'QUOTATION' | 'INVOICE'>('QUOTATION');

  // Modals
  const [viewingDoc, setViewingDoc] = useState<BillDocument | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Re-sync helper for data restore
  const reloadAllData = () => {
    setSettings(loadSettings());
    setCategories(loadCategories());
    setProducts(loadProducts());
    setCustomers(loadCustomers());
    setDocuments(loadDocuments());
  };

  // Start new billing
  const handleStartNewBilling = (type: 'QUOTATION' | 'INVOICE') => {
    setEditingDoc(null);
    setDefaultBillingType(type);
    setActiveTab('billing');
  };

  // Start billing for specific customer
  const handleNewBillingForCustomer = (customer: Customer, type: 'QUOTATION' | 'INVOICE') => {
    const nextNumber = generateNextNumber(type).documentNumber;
    const blankDoc: BillDocument = {
      id: `doc_${Date.now()}`,
      documentType: type,
      documentNumber: nextNumber,
      date: new Date().toISOString(),
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerAddress: customer.address,
      customerGst: customer.gstNumber,
      items: [],
      additionalCharges: [],
      subtotal: 0,
      discountType: 'FIXED',
      discountValue: 0,
      discountAmount: 0,
      additionalChargesTotal: 0,
      gstEnabled: settings.taxEnabledByDefault,
      gstPercentage: settings.defaultTaxPercentage,
      gstAmount: 0,
      grandTotal: 0,
      advancePaid: 0,
      balanceDue: 0,
      payments: [],
      termsAndConditions: settings.termsAndConditions,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingDoc(blankDoc);
    setDefaultBillingType(type);
    setActiveTab('billing');
  };

  // Save Document
  const handleSaveDocument = (doc: BillDocument) => {
    saveDocument(doc);
    const updatedDocs = loadDocuments();
    setDocuments(updatedDocs);
    setViewingDoc(doc);
    setActiveTab('history');
  };

  // Edit existing document
  const handleEditDocument = (doc: BillDocument) => {
    setViewingDoc(null);
    setEditingDoc(doc);
    setDefaultBillingType(doc.documentType);
    setActiveTab('billing');
  };

  // Delete Document
  const handleDeleteDocument = (docId: string) => {
    deleteDocument(docId);
    setDocuments(loadDocuments());
    if (viewingDoc?.id === docId) {
      setViewingDoc(null);
    }
  };

  // Convert Quotation to Invoice with one button
  const handleConvertToInvoice = (quotation: BillDocument) => {
    const newInvoice = convertQuotationToInvoice(quotation);
    setDocuments(loadDocuments());
    setViewingDoc(newInvoice);
  };

  // Record Payment
  const handleRecordPayment = (docId: string, payment: PaymentRecord) => {
    recordPayment(docId, payment);
    const updated = loadDocuments();
    setDocuments(updated);
    const refreshed = updated.find(d => d.id === docId);
    if (refreshed) {
      setViewingDoc(refreshed);
    }
  };

  // Save Customer
  const handleSaveCustomer = (cust: Customer) => {
    saveCustomer(cust);
    setCustomers(loadCustomers());
  };

  // Save Product
  const handleSaveProduct = (prod: Product) => {
    const existingIndex = products.findIndex(p => p.id === prod.id);
    let updated: Product[];
    if (existingIndex >= 0) {
      updated = products.map(p => (p.id === prod.id ? prod : p));
    } else {
      updated = [prod, ...products];
    }
    saveProducts(updated);
    setProducts(updated);
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
    setProducts(updated);
  };

  // Add Category
  const handleAddCategory = (category: Category) => {
    const updated = [...categories, category];
    saveCategories(updated);
    setCategories(updated);
  };

  // Reset to PDF defaults
  const handleResetToDefaults = () => {
    resetToInitialPriceDatabase();
    setCategories(loadCategories());
    setProducts(loadProducts());
    alert('Products and categories restored to initial PDF catalog!');
  };

  // Save Settings
  const handleSaveSettings = (newSettings: BusinessSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Native-style Android Header */}
      <AndroidHeader
        settings={settings}
        activeTab={activeTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNewBilling={handleStartNewBilling}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Screen Body View */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            documents={documents}
            customers={customers}
            settings={settings}
            onNewBilling={handleStartNewBilling}
            onSelectDocument={doc => setViewingDoc(doc)}
            onConvertToInvoice={handleConvertToInvoice}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'billing' && (
          <BillingScreen
            initialDocument={editingDoc}
            defaultType={defaultBillingType}
            categories={categories}
            products={products}
            customers={customers}
            settings={settings}
            onSaveDocument={handleSaveDocument}
            onPreviewDocument={doc => setViewingDoc(doc)}
            onCancel={() => {
              setEditingDoc(null);
              setActiveTab('dashboard');
            }}
            onAddNewCustomer={handleSaveCustomer}
          />
        )}

        {activeTab === 'history' && (
          <DocumentListView
            documents={documents}
            settings={settings}
            onSelectDocument={doc => setViewingDoc(doc)}
            onNewDocument={handleStartNewBilling}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManagement
            customers={customers}
            documents={documents}
            settings={settings}
            onSaveCustomer={handleSaveCustomer}
            onSelectDocument={doc => setViewingDoc(doc)}
            onNewBillingForCustomer={handleNewBillingForCustomer}
          />
        )}

        {activeTab === 'catalog' && (
          <PriceCatalogAdmin
            categories={categories}
            products={products}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onResetToDefaults={handleResetToDefaults}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsAndBackup
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onDatabaseRestored={reloadAllData}
          />
        )}
      </main>

      {/* Document Detail / PDF Modal */}
      {viewingDoc && (
        <DocumentDetailModal
          document={viewingDoc}
          settings={settings}
          onClose={() => setViewingDoc(null)}
          onEdit={handleEditDocument}
          onConvertToInvoice={handleConvertToInvoice}
          onUpdatePayment={handleRecordPayment}
        />
      )}

      {/* Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearchModal
          documents={documents}
          customers={customers}
          products={products}
          onClose={() => setIsSearchOpen(false)}
          onSelectDocument={doc => setViewingDoc(doc)}
          onSelectCustomer={() => {
            setActiveTab('customers');
          }}
          onSelectProduct={() => {
            setActiveTab('catalog');
          }}
        />
      )}

      {/* Native-style Android Bottom Navigation */}
      <AndroidBottomNav
        activeTab={activeTab}
        onTabChange={(tab: NavigationTab) => {
          if (tab === 'billing') {
            setEditingDoc(null);
            setDefaultBillingType('QUOTATION');
          }
          setActiveTab(tab);
        }}
      />
    </div>
  );
}
