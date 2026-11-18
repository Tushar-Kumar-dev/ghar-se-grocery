import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderCard } from './OrderCard';
import { GroceryListDetailModal } from './GroceryListDetailModal';
import { RefreshCw, Radio, FileText, Trash2 } from 'lucide-react';

export const OrdersView = () => {
  const { inwardOrders, checkIncomingOrders, clearAllInwardOrders, showToast } = useStore();
  const [filter, setFilter] = useState('ALL');
  const [selectedOrderForInspect, setSelectedOrderForInspect] = useState(null);

  const handleRefresh = () => {
    checkIncomingOrders();
    showToast('Checked incoming queue', 'info');
  };

  const filteredOrders = inwardOrders.filter((ord) => {
    if (filter === 'DELIVERY') return ord.fulfillmentMode === 'delivery';
    if (filter === 'PICKUP') return ord.fulfillmentMode === 'pickup';
    if (filter === 'PENDING') return ord.status === 'PENDING_REVIEW' || ord.status === 'PACKING';
    if (filter === 'COMPLETED') return ord.status === 'COMPLETED';
    return true;
  });

  const countAll = inwardOrders.length;
  const countDeliv = inwardOrders.filter((o) => o.fulfillmentMode === 'delivery').length;
  const countPickup = inwardOrders.filter((o) => o.fulfillmentMode === 'pickup').length;

  return (
    <div className="space-y-5">
      
      {/* Top Banner with Grocery List indicator */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#131A2A] to-[#131A2A] p-4 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-extrabold text-base text-white">
              GharSe Customer Inward Orders Hub
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              LIVE CROSS-TAB SYNC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Customer lists land directly here. Click <strong className="text-amber-300">"View Grocery List & Parchi"</strong> to inspect handwritten notes or convert items to POS bill.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {inwardOrders.length > 0 && (
            <button
              onClick={clearAllInwardOrders}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition btn-press"
              title="Clear all orders in queue"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Orders</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="px-3.5 py-1.5 rounded-xl bg-[#0B0E14] border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition btn-press"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Incoming</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto scrollbar-none">
        {[
          { id: 'ALL', label: `All Orders (${countAll})` },
          { id: 'DELIVERY', label: `Home Delivery (${countDeliv})` },
          { id: 'PICKUP', label: `In-Store Pickup (${countPickup})` },
          { id: 'PENDING', label: 'Needs Packing' },
          { id: 'COMPLETED', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === tab.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Feed Cards */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            onInspect={(ord) => setSelectedOrderForInspect(ord)}
          />
        ))}

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-[#131722] rounded-2xl border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-400 text-sm">No Inward Orders in Queue</div>
            <p className="text-xs text-slate-500">
              When customers place an online order or upload handwritten grocery parchi from GharSe Customer Portal, it will appear here in real time.
            </p>
          </div>
        )}
      </div>

      {/* Dedicated Grocery List & Parchi Packing Workbench Modal */}
      {selectedOrderForInspect && (
        <GroceryListDetailModal
          order={selectedOrderForInspect}
          onClose={() => setSelectedOrderForInspect(null)}
        />
      )}

    </div>
  );
};