import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CreatePOModal } from './CreatePOModal';
import { Truck, Check, Plus, PackageCheck } from 'lucide-react';

export const PurchaseOrdersView = () => {
  const { purchaseOrders, receivePO } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      
      {/* Top Bar */}
      <div className="bg-[#131722] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-white">Supplier Purchase Orders (PO)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage wholesale replenishment from authorized FMCG distributors with instant Goods Receipt Note (GRN).
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 btn-press self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* PO Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {purchaseOrders.map((po) => {
          const isReceived = po.status === 'RECEIVED';

          return (
            <div
              key={po.id}
              className="bg-[#131722] p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    #{po.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      isReceived
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {isReceived ? 'RECEIVED' : 'IN TRANSIT'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">{po.vendor}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{po.items}</p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono border-t border-slate-800/80 pt-2 mb-3">
                  <span className="text-slate-400">
                    Amount: <strong className="text-white">₹{po.amount.toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="text-slate-400">{po.eta}</span>
                </div>

                {isReceived ? (
                  <div className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Stock Inward Completed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => receivePO(po.id)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 flex items-center justify-center gap-1.5 btn-press transition"
                  >
                    <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Goods Received (GRN)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Purchase Order Modal (GAP-09) */}
      {isCreateOpen && <CreatePOModal onClose={() => setIsCreateOpen(false)} />}

    </div>
  );
};