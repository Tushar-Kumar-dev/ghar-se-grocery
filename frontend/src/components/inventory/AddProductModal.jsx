import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_CATEGORIES } from '../../data/initialData';
import {
  PackagePlus,
  Barcode,
  Sparkles,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  Tag,
  Layers,
  Percent,
  Hash,
  Plus
} from 'lucide-react';

export const AddProductModal = ({ onClose }) => {
  const { addNewProduct, categories: backendCategories, addCategory, products } = useStore();

  const CATEGORIES = Array.from(new Set([
    ...(backendCategories || []),
    ...DEFAULT_CATEGORIES,
    ...products.map((p) => p.cat).filter(Boolean),
    'General Grocery'
  ])).filter(Boolean);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    cat: CATEGORIES[0] || 'Flours & Rice',
    barcode: '',
    sku: '',
    price: '',
    cost: '',
    stock: '25',
    pack: '',
    gstRate: '0.05',
    unit: 'pc'
  });

  const [isCustomCat, setIsCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Generate 13-digit EAN-13 barcode & SKU
  const handleGenerateBarcode = () => {
    const randomBarcode = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
    const randomSku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      barcode: randomBarcode,
      sku: randomSku
    }));
  };

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
      setErrorMsg('Please enter a valid selling price / MRP');
      return;
    }

    const resolvedCat = isCustomCat && customCatName.trim()
      ? customCatName.trim()
      : (formData.cat || 'Flours & Rice');

    if (isCustomCat && customCatName.trim() && addCategory) {
      addCategory(customCatName.trim());
    }

    setSubmitting(true);
    try {
      await addNewProduct({
        ...formData,
        cat: resolvedCat,
        price: sellingNum,
        cost: costNum > 0 ? costNum : Math.round(sellingNum * 0.8),
        stock: parseInt(formData.stock) || 0,
        gstRate: parseFloat(formData.gstRate) || 0.05,
        barcode: formData.barcode.trim() || '890' + Math.floor(1000000000 + Math.random() * 9000000000),
        sku: formData.sku.trim() || 'SKU-' + Math.floor(1000 + Math.random() * 9000)
      });
      onClose();
    } catch (err) {
      setErrorMsg('Failed to add product. Please check input values.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <PackagePlus className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              Add New Product to Store Catalog
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Store Admin
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Register new inventory items for fast barcode POS billing and customer online ordering.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Row 1: Product Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                Product Title / Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fortune Kachi Ghani Mustard Oil"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Adani Wilmar, ITC"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Category & Package Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Product Category *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCat(!isCustomCat)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition"
                >
                  {isCustomCat ? '← Existing Categories' : '+ Custom Category'}
                </button>
              </div>

              {isCustomCat ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customCatName}
                    onChange={(e) => setCustomCatName(e.target.value)}
                    placeholder="Enter new category (e.g. Pooja Samagri)"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0B0E14] border border-emerald-500 text-white text-xs focus:outline-none"
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
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition"
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
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__CUSTOM__" className="text-emerald-400 font-semibold">
                    + Add New Category...
                  </option>
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5 text-xs">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Package / Unit Description</span>
              </label>
              <input
                type="text"
                name="pack"
                value={formData.pack}
                onChange={handleChange}
                placeholder="e.g. 1 L Pouch, 5 kg Bag, 500 g"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Barcode & SKU with Auto Generator */}
          <div className="p-3.5 rounded-2xl bg-[#0B0E14] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-cyan-400" />
                <span>Barcode & SKU Code</span>
              </span>
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-bold flex items-center gap-1 transition btn-press"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate EAN-13</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                  13-Digit EAN Barcode (Scan with handheld scanner)
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="8901234567890"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#131722] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                  Store Internal SKU Code
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="SKU-8492"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#131722] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Pricing, Wholesale Cost, & Margins */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Selling Price / MRP (₹) *
              </label>
              <input
                type="number"
                step="0.5"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="145"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Wholesale Cost Price (₹)
              </label>
              <input
                type="number"
                step="0.5"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="122"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Profit Margin / Loss Preview Pill */}
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
                <strong>⚠️ Loss Alert:</strong> Wholesale Cost (₹{costNum}) exceeds Selling Price (₹{sellingNum}). You will incur a loss of <strong>₹{(costNum - sellingNum).toFixed(1)}</strong> per unit sold!
              </span>
            </div>
          )}

          {/* Row 5: Stock & GST Slab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-400" />
                <span>Initial Stock Quantity (Units)</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="25"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span>GST Tax Slab</span>
              </label>
              <select
                name="gstRate"
                value={formData.gstRate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="0.0">0% (Exempt / Fresh Vegetables / Milk)</option>
                <option value="0.05">5% (Essential Food / Atta, Oil, Sugar)</option>
                <option value="0.12">12% (Butter, Cheese, Ghee, Processed)</option>
                <option value="0.18">18% (Personal Care, Cleaning, Biscuits)</option>
                <option value="0.28">28% (Luxury / Aerated Drinks)</option>
              </select>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition btn-press flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Product to Catalog</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
