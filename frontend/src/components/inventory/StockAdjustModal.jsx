import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Package, X } from 'lucide-react';

export const StockAdjustModal = ({ product, onClose }) => {
  const { adjustStock } = useStore();
  const [qty, setQty] = useState(20);
  const [type, setType] = useState('ADD'); // ADD or DEDUCT
  const [reason, setReason] = useState('Direct Wholesale Delivery');

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const delta = type === 'ADD' ? parseInt(qty) : -parseInt(qty);
    adjustStock(product.id, delta);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Stock Adjustment</h3>
            <p className="text-xs text-slate-400">
              {product.name} ({product.pack})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Adjustment Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('ADD')}
                className={`py-2 rounded-xl font-bold border transition ${
                  type === 'ADD'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#0B0E14] border-slate-700 text-slate-400'
                }`}
              >
                + Stock Inward (Received)
              </button>
              <button
                type="button"
                onClick={() => setType('DEDUCT')}
                className={`py-2 rounded-xl font-bold border transition ${
                  type === 'DEDUCT'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                    : 'bg-[#0B0E14] border-slate-700 text-slate-400'
                }`}
              >
                - Stock Outward (Damage/Audit)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Quantity (Units)</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min="1"
              required
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Current Stock: <strong>{product.stock} units</strong> ➔ New Projected Stock:{' '}
              <strong className="text-emerald-400">
                {type === 'ADD' ? product.stock + parseInt(qty || 0) : Math.max(0, product.stock - parseInt(qty || 0))} units
              </strong>
            </span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Reason / Reference</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Direct Wholesale Delivery">Direct Wholesale Delivery</option>
              <option value="Physical Audit Variance">Physical Audit Count Reconciliation</option>
              <option value="Damaged / Expired Goods">Damaged / Expired Write-off</option>
              <option value="Customer Return">Customer Return</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20 btn-press"
            >
              Apply Adjustment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};