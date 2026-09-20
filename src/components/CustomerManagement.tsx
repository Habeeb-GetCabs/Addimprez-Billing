import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Mail, 
  FileText, 
  Receipt, 
  Edit2, 
  IndianRupee, 
  Clock, 
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Customer, BillDocument, BusinessSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface CustomerManagementProps {
  customers: Customer[];
  documents: BillDocument[];
  settings: BusinessSettings;
  onSaveCustomer: (customer: Customer) => void;
  onSelectDocument: (doc: BillDocument) => void;
  onNewBillingForCustomer: (customer: Customer, type: 'QUOTATION' | 'INVOICE') => void;
}

export function CustomerManagement({
  customers,
  documents,
  settings,
  onSaveCustomer,
  onSelectDocument,
  onNewBillingForCustomer
}: CustomerManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    address: '',
    email: '',
    gstNumber: '',
    notes: ''
  });

  // Filtered customer list
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Active customer object if selected
  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  // Customer documents
  const customerDocuments = documents.filter(d => 
    activeCustomer && (d.customerId === activeCustomer.id || d.customerMobile === activeCustomer.mobile)
  );

  const customerQuotations = customerDocuments.filter(d => d.documentType === 'QUOTATION');
  const customerInvoices = customerDocuments.filter(d => d.documentType === 'INVOICE');

  const totalBilled = customerInvoices.reduce((sum, d) => sum + (d.grandTotal || 0), 0);
  const totalPaid = customerInvoices.reduce((sum, d) => sum + (d.advancePaid || 0), 0);
  const outstandingBalance = customerInvoices.reduce((sum, d) => sum + (d.balanceDue || 0), 0);

  const handleOpenAdd = () => {
    setFormData({
      id: `cust_${Date.now()}`,
      name: '',
      mobile: '',
      address: '',
      email: '',
      gstNumber: '',
      notes: '',
      createdAt: new Date().toISOString()
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setFormData({ ...customer });
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Please enter customer name');
      return;
    }
    const customerToSave: Customer = {
      id: formData.id || `cust_${Date.now()}`,
      name: formData.name.trim(),
      mobile: formData.mobile?.trim() || '',
      address: formData.address?.trim() || '',
      email: formData.email?.trim() || undefined,
      gstNumber: formData.gstNumber?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      createdAt: formData.createdAt || new Date().toISOString()
    };
    onSaveCustomer(customerToSave);
    setIsEditing(false);
    setSelectedCustomerId(customerToSave.id);
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 pt-3 pb-24 space-y-4">
      {/* Title & Add Button Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users size={19} className="text-indigo-600" />
            <span>Customer Database</span>
          </h2>
          <p className="text-xs text-slate-500">
            Manage clients, review previous quotes, invoices & balances
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>New Customer</span>
        </button>
      </div>

      {/* Main Grid: Left Customer List, Right Customer Detail Profile */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Customer List Column */}
        <div className="md:col-span-5 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No customers found. Tap "+ New Customer" to register.
              </div>
            ) : (
              filteredCustomers.map(cust => {
                // Calculate quick balance for each customer
                const custInvoices = documents.filter(d => 
                  d.documentType === 'INVOICE' && (d.customerId === cust.id || d.customerMobile === cust.mobile)
                );
                const due = custInvoices.reduce((s, d) => s + (d.balanceDue || 0), 0);
                const isSelected = selectedCustomerId === cust.id;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-3.5 cursor-pointer transition flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate">{cust.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Phone size={11} />
                        <span>{cust.mobile || 'No mobile'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {due > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          Due: {formatCurrency(due)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Clear
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Customer Detail Profile Column */}
        <div className="md:col-span-7">
          {activeCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
              {/* Header Profile Info */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{activeCustomer.name}</h3>
                  <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} className="text-indigo-600" />
                      <span>{activeCustomer.mobile || 'Not provided'}</span>
                    </p>
                    {activeCustomer.address && (
                      <p className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{activeCustomer.address}</span>
                      </p>
                    )}
                    {activeCustomer.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        <span>{activeCustomer.email}</span>
                      </p>
                    )}
                    {activeCustomer.gstNumber && (
                      <p className="font-semibold text-slate-700 text-[11px]">
                        GSTIN: {activeCustomer.gstNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(activeCustomer)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                    title="Edit Customer"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Financial Stats Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 block">Total Billed</span>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                    {formatCurrency(totalBilled)}
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-semibold text-emerald-700 block">Paid Amount</span>
                  <div className="text-xs sm:text-sm font-black text-emerald-800 mt-0.5">
                    {formatCurrency(totalPaid)}
                  </div>
                </div>

                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-[10px] font-semibold text-rose-700 block">Outstanding</span>
                  <div className="text-xs sm:text-sm font-black text-rose-700 mt-0.5">
                    {formatCurrency(outstandingBalance)}
                  </div>
                </div>
              </div>

              {/* Fast Action: New Bill for this customer */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onNewBillingForCustomer(activeCustomer, 'QUOTATION')}
                  className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                >
                  <FileText size={13} />
                  <span>+ New Quotation</span>
                </button>
                <button
                  onClick={() => onNewBillingForCustomer(activeCustomer, 'INVOICE')}
                  className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                >
                  <Receipt size={13} />
                  <span>+ New Invoice</span>
                </button>
              </div>

              {/* History Tabs: Quotations & Invoices */}
              <div className="space-y-3 pt-2">
                {/* Previous Invoices */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Receipt size={14} className="text-blue-600" />
                    <span>Invoices ({customerInvoices.length})</span>
                  </h4>

                  {customerInvoices.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                      No invoices recorded yet for this client.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {customerInvoices.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => onSelectDocument(doc)}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200/70 transition flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-800">{doc.documentNumber}</div>
                            <div className="text-[11px] text-slate-400">{formatDate(doc.date)} • {doc.items.length} items</div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-slate-900">{formatCurrency(doc.grandTotal)}</div>
                            <div className={`text-[10px] font-bold ${doc.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {doc.balanceDue > 0 ? `Due: ${formatCurrency(doc.balanceDue)}` : 'Fully Paid'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Previous Quotations */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-600" />
                    <span>Quotations ({customerQuotations.length})</span>
                  </h4>

                  {customerQuotations.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                      No quotations recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {customerQuotations.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => onSelectDocument(doc)}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200/70 transition flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-800">{doc.documentNumber}</div>
                            <div className="text-[11px] text-slate-400">{formatDate(doc.date)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-slate-900">{formatCurrency(doc.grandTotal)}</div>
                            {doc.convertedToInvoiceId ? (
                              <span className="text-[10px] text-violet-600 font-semibold">Converted</span>
                            ) : (
                              <span className="text-[10px] text-indigo-600 font-semibold">Open Quote</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              <Users size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-600">Select a customer from the list</p>
              <p className="mt-1">View billing history, invoices, quotations, and outstanding dues.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 shadow-2xl space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
              {formData.id && customers.some(c => c.id === formData.id) ? 'Edit Customer' : 'Add New Customer'}
            </h4>

            <form onSubmit={handleSaveForm} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Customer / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Dental Care"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile No.</label>
                  <input
                    type="tel"
                    value={formData.mobile || ''}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={formData.gstNumber || ''}
                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="27ABCDE..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, Pin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
