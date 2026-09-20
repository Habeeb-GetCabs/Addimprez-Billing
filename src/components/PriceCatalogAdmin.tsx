import { useState } from 'react';
import { 
  Tag, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  FolderPlus, 
  Calculator, 
  Filter, 
  Check, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Product, Category, CalculationType } from '../types';
import { formatCurrency } from '../utils/calculations';

interface PriceCatalogAdminProps {
  categories: Category[];
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddCategory: (category: Category) => void;
  onResetToDefaults: () => void;
}

export function PriceCatalogAdmin({
  categories,
  products,
  onSaveProduct,
  onDeleteProduct,
  onAddCategory,
  onResetToDefaults
}: PriceCatalogAdminProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCatId === 'ALL' || p.categoryId === selectedCatId;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Open Product Modal for Add
  const handleOpenAddProduct = () => {
    const defaultCat = categories.find(c => c.id === selectedCatId) || categories[0];
    setEditingProduct({
      id: `prod_${Date.now()}`,
      categoryId: defaultCat?.id || 'cat_custom',
      categoryName: defaultCat?.name || 'General',
      name: '',
      calculationType: 'AREA',
      defaultUnit: 'Sq.ft',
      minPrice: 50,
      maxPrice: 80,
      defaultRate: 65,
      description: ''
    });
    setIsProductModalOpen(true);
  };

  // Open Product Modal for Edit
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) {
      alert('Please enter a product name');
      return;
    }

    const cat = categories.find(c => c.id === editingProduct.categoryId);
    const minP = Number(editingProduct.minPrice) || 0;
    const maxP = Number(editingProduct.maxPrice) || minP;
    const defR = Number(editingProduct.defaultRate) || minP;

    const prodToSave: Product = {
      id: editingProduct.id || `prod_${Date.now()}`,
      categoryId: editingProduct.categoryId || categories[0]?.id || 'general',
      categoryName: cat?.name || editingProduct.categoryName || 'General',
      name: editingProduct.name.trim(),
      calculationType: editingProduct.calculationType || 'AREA',
      defaultUnit: editingProduct.defaultUnit?.trim() || (editingProduct.calculationType === 'AREA' ? 'Sq.ft' : 'Pcs'),
      minPrice: Math.min(minP, maxP),
      maxPrice: Math.max(minP, maxP),
      defaultRate: defR,
      description: editingProduct.description?.trim() || ''
    };

    onSaveProduct(prodToSave);
    setIsProductModalOpen(false);
  };

  // Add new Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    const cat: Category = {
      id: `cat_${Date.now()}`,
      name: newCategoryName.trim(),
      description: newCategoryDesc.trim() || undefined
    };
    onAddCategory(cat);
    setNewCategoryName('');
    setNewCategoryDesc('');
    setIsCategoryModalOpen(false);
    setSelectedCatId(cat.id);
  };

  const handleDelete = (prod: Product) => {
    if (confirm(`Delete "${prod.name}" from price database? Existing invoices will not be affected.`)) {
      onDeleteProduct(prod.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 pt-3 pb-24 space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Tag size={19} className="text-indigo-600" />
            <span>Product & Price Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Preloaded from PDF. Add or modify rates without affecting old bills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <FolderPlus size={14} />
            <span>+ Category</span>
          </button>

          <button
            onClick={handleOpenAddProduct}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
          >
            <Plus size={15} />
            <span>+ Product</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, rates, or specs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        {/* Categories Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          <button
            onClick={() => setSelectedCatId('ALL')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
              selectedCatId === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Items ({products.length})
          </button>

          {categories.map(cat => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            const isSelected = selectedCatId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>Item & Description</span>
          <span className="pr-12">Calculation & Price Range</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No products match your filter criteria.
          </div>
        ) : (
          filteredProducts.map(prod => (
            <div
              key={prod.id}
              className="p-3.5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{prod.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    {prod.categoryName}
                  </span>
                </div>

                {prod.description && (
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {prod.description}
                  </p>
                )}
              </div>

              {/* Price Details & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {prod.minPrice !== prod.maxPrice ? (
                      <span>{formatCurrency(prod.minPrice)} – {formatCurrency(prod.maxPrice)}</span>
                    ) : (
                      <span>{formatCurrency(prod.defaultRate)}</span>
                    )}
                    <span className="text-[11px] font-medium text-slate-500 ml-1">
                      /{prod.calculationType === 'AREA' ? 'Sq.ft' : prod.defaultUnit}
                    </span>
                  </div>

                  <div className="text-[10px] font-semibold text-indigo-600">
                    {prod.calculationType === 'AREA' ? 'Area-Based (Width × Height)' : 'Quantity Rate'}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Edit Product Details & Price"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(prod)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                    title="Delete Product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reset to Default PDF Database */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">Need to restore original prices from PDF?</span>
        <button
          onClick={() => {
            if (confirm('Reset product database to original PDF price list? Custom products will be replaced.')) {
              onResetToDefaults();
            }
          }}
          className="px-2.5 py-1 text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
        >
          <RotateCcw size={12} />
          <span>Reset to PDF Defaults</span>
        </button>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 shadow-2xl space-y-3 max-h-[92vh] overflow-y-auto">
            <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
              {editingProduct.id && products.some(p => p.id === editingProduct.id) 
                ? 'Edit Product / Service' 
                : 'Add New Product / Service'}
            </h4>

            <form onSubmit={handleSaveProductForm} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
                <select
                  value={editingProduct.categoryId}
                  onChange={e => {
                    const cat = categories.find(c => c.id === e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      categoryId: e.target.value,
                      categoryName: cat?.name || ''
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Product / Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Star Flex 320 GSM"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Calculation Type Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Calculation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({
                      ...editingProduct,
                      calculationType: 'AREA',
                      defaultUnit: 'Sq.ft'
                    })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                      editingProduct.calculationType === 'AREA'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Calculator size={13} />
                    <span>Area (Sq.ft)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingProduct({
                      ...editingProduct,
                      calculationType: 'QUANTITY',
                      defaultUnit: editingProduct.defaultUnit === 'Sq.ft' ? 'Pcs' : editingProduct.defaultUnit
                    })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                      editingProduct.calculationType === 'QUANTITY'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Plus size={13} />
                    <span>Quantity Based</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit Label</label>
                  <input
                    type="text"
                    value={editingProduct.defaultUnit || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, defaultUnit: e.target.value })}
                    placeholder="Sq.ft / Pcs / Sets / Books"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Default Rate (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.defaultRate ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, defaultRate: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Price Range (e.g. ₹900 - ₹1200)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">Min Rate (₹)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingProduct.minPrice ?? ''}
                      onChange={e => setEditingProduct({ ...editingProduct, minPrice: Number(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Max Rate (₹)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingProduct.maxPrice ?? ''}
                      onChange={e => setEditingProduct({ ...editingProduct, maxPrice: Number(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Specification / Notes</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Material specs, thickness, or finish details..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Add New Product Category
            </h4>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canopy Tents, Sunpack Sheets"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description..."
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
