import { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Receipt, 
  Users, 
  Tag, 
  Phone, 
  ArrowRight 
} from 'lucide-react';
import { BillDocument, Customer, Product } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface GlobalSearchModalProps {
  documents: BillDocument[];
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  onSelectDocument: (doc: BillDocument) => void;
  onSelectCustomer: (cust: Customer) => void;
  onSelectProduct: (prod: Product) => void;
}

export function GlobalSearchModal({
  documents,
  customers,
  products,
  onClose,
  onSelectDocument,
  onSelectCustomer,
  onSelectProduct
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();

  const matchingDocuments = useMemo(() => {
    if (!trimmed) return [];
    return documents.filter(d => 
      d.documentNumber.toLowerCase().includes(trimmed) ||
      d.customerName.toLowerCase().includes(trimmed) ||
      d.customerMobile.includes(trimmed) ||
      d.date.includes(trimmed) ||
      d.items.some(i => i.productName.toLowerCase().includes(trimmed))
    ).slice(0, 8);
  }, [documents, trimmed]);

  const matchingCustomers = useMemo(() => {
    if (!trimmed) return [];
    return customers.filter(c =>
      c.name.toLowerCase().includes(trimmed) ||
      c.mobile.includes(trimmed) ||
      (c.address && c.address.toLowerCase().includes(trimmed))
    ).slice(0, 5);
  }, [customers, trimmed]);

  const matchingProducts = useMemo(() => {
    if (!trimmed) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(trimmed) ||
      p.categoryName.toLowerCase().includes(trimmed) ||
      (p.description && p.description.toLowerCase().includes(trimmed))
    ).slice(0, 6);
  }, [products, trimmed]);

  const totalResults = matchingDocuments.length + matchingCustomers.length + matchingProducts.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 pt-12 sm:pt-20">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-fade-in flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-2.5">
          <Search size={18} className="text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by customer, phone, quote/bill #, date, product..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg ml-1"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs divide-y divide-slate-100">
          {!trimmed ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <Search size={28} className="mx-auto text-slate-300 mb-1" />
              <p className="font-bold text-slate-600">Global Search</p>
              <p className="text-[11px]">Type a name, phone number, quote number, or product name.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No results found for "{query}".
            </div>
          ) : (
            <>
              {/* Documents */}
              {matchingDocuments.length > 0 && (
                <div className="pt-2 first:pt-0">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                    Documents ({matchingDocuments.length})
                  </div>
                  <div className="space-y-1">
                    {matchingDocuments.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onSelectDocument(doc);
                          onClose();
                        }}
                        className="p-2 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`p-1 rounded ${doc.documentType === 'INVOICE' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                            {doc.documentType === 'INVOICE' ? <Receipt size={14} /> : <FileText size={14} />}
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-slate-900">{doc.documentNumber}</span>
                            <span className="text-slate-500 text-[11px] ml-1.5 truncate">
                              • {doc.customerName} ({doc.customerMobile || 'No phone'})
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-slate-900">{formatCurrency(doc.grandTotal)}</span>
                          <span className="text-[10px] text-slate-400 block">{formatDate(doc.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchingCustomers.length > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                    Customers ({matchingCustomers.length})
                  </div>
                  <div className="space-y-1">
                    {matchingCustomers.map(cust => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          onSelectCustomer(cust);
                          onClose();
                        }}
                        className="p-2 hover:bg-emerald-50/60 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-emerald-100 text-emerald-800">
                            <Users size={14} />
                          </span>
                          <div>
                            <span className="font-bold text-slate-900">{cust.name}</span>
                            {cust.address && <span className="text-slate-400 text-[11px] ml-1.5">{cust.address}</span>}
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                          <Phone size={11} />
                          <span>{cust.mobile || '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {matchingProducts.length > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                    Catalog Items ({matchingProducts.length})
                  </div>
                  <div className="space-y-1">
                    {matchingProducts.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          onClose();
                        }}
                        className="p-2 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="p-1 rounded bg-amber-100 text-amber-800">
                            <Tag size={14} />
                          </span>
                          <span className="font-bold text-slate-900 truncate">{prod.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase">({prod.categoryName})</span>
                        </div>

                        <div className="text-right shrink-0 font-extrabold text-slate-900">
                          {prod.minPrice !== prod.maxPrice ? (
                            <span>{formatCurrency(prod.minPrice)} – {formatCurrency(prod.maxPrice)}</span>
                          ) : (
                            <span>{formatCurrency(prod.defaultRate)}</span>
                          )}
                          <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                            /{prod.calculationType === 'AREA' ? 'sqft' : prod.defaultUnit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
