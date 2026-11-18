import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { StockAdjustModal } from './StockAdjustModal';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { ParchiStockParserModal } from './ParchiStockParserModal';
import {
  Package,
  AlertCircle,
  TrendingUp,
  Search,
  Plus,
  PackagePlus,
  Trash2,
  Barcode,
  FileSpreadsheet,
  Edit3,
  RotateCcw
} from 'lucide-react';

export const InventoryView = () => {
  const { products, deleteProduct, refreshProducts, isLoadingProducts } = useStore();
  const { isManager } = useAuth();

  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState('ALL'); // ALL | LOW | OUT
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isParchiModalOpen, setIsParchiModalOpen] = useState(false);

  const totalProducts = products.length;
  const totalValuation = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock <= 10);
  const outOfStockItems = products.filter((p) => p.stock === 0);

  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase();
    const matchQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.barcode?.includes(query) ||
      p.brand?.toLowerCase().includes(query) ||
      p.cat?.toLowerCase().includes(query);

    if (filterStock === 'LOW') return matchQuery && p.stock <= 10 && p.stock > 0;
    if (filterStock === 'OUT') return matchQuery && p.stock === 0;
    return matchQuery;
  });

  return (
    <div className="space-y-4">
      
      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131722] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">TOTAL CATALOG SKUS</div>
          <div className="text-2xl font-black text-white mt-1">{totalProducts}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Active Store Items</div>
        </div>

        <div className="bg-[#131722] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">INVENTORY VALUATION</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Valued at wholesale cost</div>
        </div>

        <div className="bg-[#131722] p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <div className="text-[11px] font-mono text-rose-300">LOW STOCK WARNINGS</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {lowStockItems.length} Items
          </div>
          <div className="text-[10px] text-rose-300 mt-0.5">Threshold &lt;= 10 units</div>
        </div>

        <div className="bg-[#131722] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">DAILY STOCK UNITS SOLD</div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">86 Units</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across retail POS invoices</div>
        </div>
      </div>

      {/* Inventory Catalog Table */}
      <div className="bg-[#131722] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Live Stock Catalog & Inventory Control
              {isManager && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Manager Permissions
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time synchronization with POS register & wholesale inward receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog or barcode..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0B0E14] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Refresh / Sync with Spring Boot Backend */}
            <button
              onClick={() => refreshProducts()}
              disabled={isLoadingProducts}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center transition btn-press shrink-0"
              title="Refresh products & stock directly from Spring Boot backend"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingProducts ? 'animate-spin' : ''}`} />
            </button>

            {/* Quick Stock Inward */}
            <button
              onClick={() => setSelectedProductForAdjust(products[0])}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 btn-press shrink-0"
              title="Record incoming wholesale stock"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Stock Inward</span>
            </button>

            {/* SCAN HANDWRITTEN SLIP / PARCHI INWARD (STORE MANAGER FEATURE) */}
            {isManager && (
              <button
                onClick={() => setIsParchiModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition btn-press shrink-0"
                title="Upload photo of handwritten paper list / wholesale bill to parse items and update stock quantities"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Scan Handwritten Slip</span>
              </button>
            )}

            {/* ADD NEW PRODUCT BUTTON (STORE MANAGER & ADMIN FEATURE) */}
            {isManager && (
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition btn-press flex items-center gap-1.5 shrink-0"
              >
                <PackagePlus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-[#0E131F] flex items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Filter:</span>
          <button
            onClick={() => setFilterStock('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              filterStock === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Items ({totalProducts})
          </button>
          <button
            onClick={() => setFilterStock('LOW')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              filterStock === 'LOW'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Low Stock ({lowStockItems.length})
          </button>
          <button
            onClick={() => setFilterStock('OUT')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              filterStock === 'OUT'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Out of Stock ({outOfStockItems.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 bg-[#0E131F]">
              <tr>
                <th className="py-2.5 pl-4">Product Name & Brand</th>
                <th className="py-2.5">Barcode / SKU</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Cost Price</th>
                <th className="py-2.5 text-right">Selling (MRP)</th>
                <th className="py-2.5 text-center">Current Stock</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= 10 && p.stock > 0;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 pl-4">
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Brand: {p.brand} • Pack: {p.pack}
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-slate-500" />
                        <span>{p.barcode}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{p.sku || `SKU-${p.id}`}</div>
                    </td>
                    <td className="py-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px]">
                        {p.cat}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-300">₹{p.cost}</td>
                    <td className="py-3 text-right font-mono font-bold text-white">₹{p.price}</td>
                    <td
                      className={`py-3 text-center font-mono font-bold ${
                        isOut ? 'text-rose-500' : isLow ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {p.stock} units
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : isLow
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedProductForAdjust(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 btn-press"
                          title="Adjust stock quantity"
                        >
                          + Stock
                        </button>

                        {isManager && (
                          <>
                            <button
                              onClick={() => setSelectedProductForEdit(p)}
                              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                              title="Edit product details & prices"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Remove product from catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 text-xs">
                    No products matched your search. Click "Add New Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add New Product Modal */}
      {isAddProductOpen && (
        <AddProductModal onClose={() => setIsAddProductOpen(false)} />
      )}

      {/* Handwritten Paper Slip / Parchi Stock Parser Modal */}
      {isParchiModalOpen && (
        <ParchiStockParserModal onClose={() => setIsParchiModalOpen(false)} />
      )}

      {/* Edit Product Modal (GAP-06) */}
      {selectedProductForEdit && (
        <EditProductModal
          product={selectedProductForEdit}
          onClose={() => setSelectedProductForEdit(null)}
        />
      )}

      {/* Stock Adjust Modal */}
      {selectedProductForAdjust && (
        <StockAdjustModal
          product={selectedProductForAdjust}
          onClose={() => setSelectedProductForAdjust(null)}
        />
      )}

    </div>
  );
};
