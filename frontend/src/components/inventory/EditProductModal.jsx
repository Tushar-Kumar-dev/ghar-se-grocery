import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_CATEGORIES } from '../../data/initialData';
import {
  X,
  Check,
  TrendingUp,
  AlertCircle,
  Package,
  Layers,
  Edit3
} from 'lucide-react';

export const EditProductModal = ({ product, onClose }) => {
  const { updateProduct, categories: backendCategories, addCategory, products } = useStore();

  const [formData, setFormData] = useState({
    name: product.name || '',
    brand: product.brand || '',
    cat: product.cat || 'General Grocery',
    pack: product.pack || '1 pc',
    stock: product.stock !== undefined ? product.stock : 0,
    price: product.price || '',
    cost: product.cost || '',
    minStock: product.minStock || 10,
    gstRate: product.gstRate !== undefined ? product.gstRate : 0.05
  });

  const categoriesList = Array.from(new Set([
    ...(backendCategories || []),
    ...DEFAULT_CATEGORIES,
    ...products.map((p) => p.cat).filter(Boolean),
    formData.cat,
    'General Grocery'
  ])).filter(Boolean);

  const [isCustomCat, setIsCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Live Margin & Loss Calculation (GAP-07)
  const sellingNum = parseFloat(formData.price) || 0;
  const costNum = parseFloat(formData.cost) || 0;
  const diff = sellingNum - costNum;
  const isLoss = costNum > sellingNum && sellingNum > 0 && costNum > 0;
  const profitNum = Math.max(0, diff);
  const marginPercent = sellingNum > 0 ? ((diff / sellingNum) * 100).toFixed(1) : '0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter product name');
      return;
    }
    if (!formData.price || sellingNum <= 0) {
      setErrorMsg('Please enter a valid selling price');
      return;
    }

    const resolvedCat = isCustomCat && customCatName.trim()
      ? customCatName.trim()
      : (formData.cat || 'General Grocery');

    if (isCustomCat && customCatName.trim() && addCategory) {
      addCategory(customCatName.trim());
    }

    setSubmitting(true);
    try {
      await updateProduct(product.id, {
        name: formData.name.trim(),
        brand: formData.brand.trim() || 'Store Item',
        cat: resolvedCat,
        pack: formData.pack.trim(),
        stock: parseInt(formData.stock) || 0,
        price: sellingNum,
        cost: costNum > 0 ? costNum : Math.round(sellingNum * 0.8),
        minStock: parseInt(formData.minStock) || 10,
        gstRate: parseFloat(formData.gstRate) || 0.05
      });
      onClose();
    } catch (err) {
      setErrorMsg('Failed to update product details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              Edit Product Details
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                #{product.id}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Update pricing, barcode specifications, wholesale cost, and alerts.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Product Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Product Title *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Brand & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Brand / Manufacturer</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300 text-xs">Category</label>
                <button
                  type="button"
                  onClick={() => setIsCustomCat(!isCustomCat)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition"
                >
                  {isCustomCat ? '← Choose Existing' : '+ Custom Category'}
                </button>
              </div>

              {isCustomCat ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customCatName}
                    onChange={(e) => setCustomCatName(e.target.value)}
                    placeholder="Enter new category (e.g. Pooja Samagri)"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0B0E14] border border-cyan-500 text-white text-xs focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCatName.trim()) {
                        addCategory && addCategory(customCatName.trim());
                        setFormData((p) => ({ ...p, cat: customCatName.trim() }));
                        setIsCustomCat(false);
                      }
                    }}
                    className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold rounded-xl transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <select
                  name="cat"
                  value={formData.cat}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomCat(true);
                    } else {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__CUSTOM__" className="text-cyan-400 font-semibold">
                    + Add New Category...
                  </option>
                </select>
              )}
            </div>
          </div>

          {/* Pack Size, Stock Quantity, & Low Stock Alert */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Pack Size / Unit</label>
              <input
                type="text"
                name="pack"
                value={formData.pack}
                onChange={handleChange}
                placeholder="e.g. 5 kg bag"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Current Stock Qty *</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Low Stock Alert</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Pricing, Wholesale Cost, & Margin Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.5"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Wholesale Cost (₹)</label>
              <input
                type="number"
                step="0.5"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <TrendingUp className={`w-3.5 h-3.5 ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`} />
                <span>Gross Profit & Margin</span>
              </label>
              <div
                className={`px-3 py-2 rounded-xl border font-mono text-xs flex items-center justify-between ${
                  isLoss
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-[#0B0E14] border-emerald-500/30 text-emerald-300'
                }`}
              >
                <span>{isLoss ? `-₹${(costNum - sellingNum).toFixed(1)} loss` : `₹${profitNum.toFixed(1)} profit`}</span>
                <span className={`font-bold ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ({marginPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Loss Warning Banner */}
          {isLoss && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>⚠️ Loss Alert:</strong> Wholesale Cost (₹{costNum}) exceeds Selling Price (₹{sellingNum}). You will lose <strong>₹{(costNum - sellingNum).toFixed(1)}</strong> per unit sold!
              </span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20 transition btn-press flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Update Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
