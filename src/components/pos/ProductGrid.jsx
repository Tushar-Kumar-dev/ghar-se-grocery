import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Zap, Plus } from 'lucide-react';

export const ProductGrid = () => {
  const { products, categories: backendCategories, addToCart, showToast, isLoadingProducts } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Dynamically derive categories from backend
  const productCats = Array.from(new Set(products.map((p) => p.cat).filter(Boolean)));
  const categories = [
    'ALL',
    ...Array.from(new Set([...(backendCategories || []), ...productCats]))
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'ALL' || p.cat === activeCategory;
    const query = search.toLowerCase();
    const matchQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      p.brand.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  const simulateBarcodeScan = () => {
    const randomProd = products[Math.floor(Math.random() * products.length)];
    if (randomProd) {
      addToCart(randomProd.id);
      showToast(`⚡ Scanned: ${randomProd.name} (Barcode: ${randomProd.barcode})`, 'info');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Search Bar + Barcode Gun Button + Category Filter */}
      <div className="bg-[#131722] p-3.5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product by name, barcode or brand (e.g. Atta, Oil)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0E14] border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition"
            />
          </div>

          {/* Simulate Barcode Gun Trigger */}
          <button
            onClick={simulateBarcodeScan}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition btn-press shrink-0"
            title="Simulate Barcode Scanner Beep"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Scan Barcode Gun</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-[#1A2234] text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
        {filteredProducts.map((p) => {
          const isLow = p.stock <= 10;
          return (
            <div
              key={p.id}
              onClick={() => addToCart(p.id)}
              className={`p-3 rounded-xl bg-[#171D2B] border ${
                isLow ? 'border-amber-500/30' : 'border-slate-800'
              } hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between btn-press group`}
            >
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {p.brand}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isLow
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {p.stock} left
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white leading-snug group-hover:text-emerald-400 transition">
                  {p.name}
                </h4>
                <div className="text-[10px] text-slate-400 mt-0.5">{p.pack}</div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800">
                <span className="font-black font-mono text-sm text-emerald-400">₹{p.price}</span>
                <button
                  type="button"
                  className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs group-hover:bg-emerald-500 group-hover:text-slate-950 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            {isLoadingProducts
              ? 'Loading live grocery catalog from backend...'
              : 'No grocery products found in catalog.'}
          </div>
        )}
      </div>

    </div>
  );
};