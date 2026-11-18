import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { WhatsAppService } from '../../services/whatsappService';
import {
  Bike,
  ShoppingBag,
  Search,
  Check,
  Package,
  Send,
  CheckCircle2,
  FileText,
  Receipt,
  ArrowRight,
  XCircle,
  X,
  AlertTriangle,
  UserCheck,
  MessageCircle
} from 'lucide-react';

export const OrderCard = ({ order, onInspect }) => {
  const { updateOrderStatus } = useStore();
  const { isCashier } = useAuth();

  const isDelivery = order.fulfillmentMode === 'delivery';

  // Rider Assignment Modal (GAP-11)
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [riderForm, setRiderForm] = useState({
    name: 'Ramesh Kumar (Express Rider)',
    phone: '+91 98765 43210'
  });

  // Cancel Order Modal (GAP-08)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Requested items are out of stock');
  const [customReason, setCustomReason] = useState('');

  // Stepper state
  const step1 = true;
  const step2 = ['PACKING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'COMPLETED'].includes(order.status);
  const step3 = ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'COMPLETED'].includes(order.status);
  const step4 = order.status === 'COMPLETED';

  // Step 1 -> 2: Accept Grocery List & Start Working + WhatsApp Notification
  const handleAcceptAndPack = () => {
    updateOrderStatus(order.orderId, 'PACKING');
    if (order.customerPhone) {
      WhatsAppService.sendWhatsAppNotification({ ...order, status: 'PACKING' }, 'PACKING');
    }
  };

  // Step 2 -> 3: Dispatch Rider + WhatsApp Notification
  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    const updatedOrder = {
      ...order,
      status: 'OUT_FOR_DELIVERY',
      riderName: riderForm.name.trim(),
      riderPhone: riderForm.phone.trim()
    };
    updateOrderStatus(order.orderId, 'OUT_FOR_DELIVERY', {
      name: riderForm.name.trim(),
      phone: riderForm.phone.trim()
    });
    if (order.customerPhone) {
      WhatsAppService.sendWhatsAppNotification(updatedOrder, 'OUT_FOR_DELIVERY');
    }
    setShowRiderModal(false);
  };

  // Step 2 -> 3 (Pickup): Mark Ready + WhatsApp Notification
  const handleMarkReadyForPickup = () => {
    updateOrderStatus(order.orderId, 'READY_FOR_PICKUP');
    if (order.customerPhone) {
      WhatsAppService.sendWhatsAppNotification({ ...order, status: 'READY_FOR_PICKUP' }, 'READY_FOR_PICKUP');
    }
  };

  // Step 3 -> 4: Complete & Delivered + WhatsApp Notification
  const handleCompleteOrder = () => {
    updateOrderStatus(order.orderId, 'COMPLETED');
    if (order.customerPhone) {
      WhatsAppService.sendWhatsAppNotification({ ...order, status: 'COMPLETED' }, 'COMPLETED');
    }
  };

  // Cancel / Reject + WhatsApp Notification
  const handleConfirmCancel = (e) => {
    e.preventDefault();
    const finalReason = cancelReason === 'Other' ? customReason.trim() : cancelReason;
    const cancelledOrder = { ...order, status: 'CANCELLED', cancelReason: finalReason };
    updateOrderStatus(order.orderId, 'CANCELLED', null, finalReason || 'Cancelled by Store');
    if (order.customerPhone) {
      WhatsAppService.sendWhatsAppNotification(cancelledOrder, 'CANCELLED');
    }
    setShowCancelModal(false);
  };

  return (
    <div className="bg-[#131722] p-5 rounded-2xl border border-slate-800 space-y-4 shadow-sm hover:border-slate-700/80 transition">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#0B0E14] text-white border border-slate-700">
            #{order.orderId}
          </span>
          <div>
            <h4 className="font-extrabold text-sm text-white">{order.customerName}</h4>
            <p className="text-xs text-slate-400 font-mono">
              {order.customerPhone} • Placed at {order.placedAt}
            </p>
          </div>
        </div>

        {/* Fulfillment Mode Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 ${
              isDelivery
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {isDelivery ? <Bike className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            <span>{isDelivery ? 'HOME DELIVERY' : 'COUNTER PICKUP'}</span>
          </span>
        </div>
      </div>

      {/* Grocery Items Summary Box: Tailored for Cashier vs Manager */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#0B0E14] p-3.5 rounded-xl border border-slate-800/80">
        <div className="md:col-span-8 space-y-1.5">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            {isCashier ? (
              <>
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-mono">
                  Digitized Bill Items (Ready for Billing)
                </span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300">
                  {order.listType === 'Uploaded Parchi Photo'
                    ? 'Handwritten Parchi Attached (Photo)'
                    : 'Manually Typed Grocery List'}
                </span>
              </>
            )}
            <span className="text-[10px] font-mono text-slate-500">
              [Target: {order.storeName || 'Apna Bazar'}]
            </span>
          </div>

          <div className="text-xs text-slate-300">
            {order.itemsSummary || '5kg Aashirvaad Atta, 1L Fortune Mustard Oil, 200g Tata Tea Gold, 1kg Chana Dal'}
          </div>

          <div className="text-[11px] text-slate-400">
            <strong>Address / Instructions:</strong> {order.address}
          </div>
        </div>

        {/* Action Button: Cashier gets "View Digitized Items & Bill", Manager gets "Inspect Parchi" */}
        <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-2">
          <button
            onClick={() => onInspect(order)}
            className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition btn-press shadow-sm ${
              isCashier
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300'
            }`}
          >
            {isCashier ? <Receipt className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
            <span>{isCashier ? 'View Digitized Items & Bill' : 'View Grocery List & Parchi'}</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">ESTIMATED BILL</span>
            <span className="text-base font-black font-mono text-emerald-400">
              ₹{order.estimatedTotal || 640}
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Rider Info Banner (GAP-11) */}
      {order.riderName && (
        <div className="text-xs font-mono px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-cyan-400" />
            <span>Assigned Rider: <strong className="text-white">{order.riderName}</strong> ({order.riderPhone})</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-cyan-400">En Route</span>
        </div>
      )}

      {/* 4-Step Live Pipeline Status Indicators OR Cancelled Banner (GAP-08) */}
      {order.status === 'CANCELLED' ? (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Order Rejected / Cancelled:</strong> {order.cancelReason || 'Customer requested or items out of stock'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            CANCELLED
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 pt-2">
          <div
            className={`text-center p-2 rounded-lg ${
              step1
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <span className="text-xs font-bold block">1. Received</span>
            <span className="text-[10px] font-mono">Reviewing</span>
          </div>
          <div
            className={`text-center p-2 rounded-lg ${
              step2
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <span className="text-xs font-bold block">2. Packing</span>
            <span className="text-[10px] font-mono">Items Bagged</span>
          </div>
          <div
            className={`text-center p-2 rounded-lg ${
              step3
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <span className="text-xs font-bold block">
              3. {isDelivery ? 'Dispatched' : 'Ready'}
            </span>
            <span className="text-[10px] font-mono">
              {isDelivery ? 'Rider Assigned' : 'At Counter #1'}
            </span>
          </div>
          <div
            className={`text-center p-2 rounded-lg ${
              step4
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <span className="text-xs font-bold block">4. Completed</span>
            <span className="text-[10px] font-mono">Paid & Closed</span>
          </div>
        </div>
      )}

      {/* Order Actions Pipeline */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div>
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition flex items-center gap-1.5 btn-press"
              title="Reject or cancel this inward order"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Cancel / Reject</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp Direct Notify Button for Store Manager */}
          {order.customerPhone && (
            <button
              type="button"
              onClick={() => WhatsAppService.sendWhatsAppNotification(order, order.status === 'PENDING_REVIEW' ? 'RECEIVED' : order.status)}
              className="px-3 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition btn-press"
              title="Send WhatsApp update to customer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Update</span>
            </button>
          )}

          {order.status === 'PENDING_REVIEW' && (
            <button
              onClick={handleAcceptAndPack}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 btn-press shadow-md shadow-amber-500/20"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Accept & Start Packing</span>
            </button>
          )}

          {order.status === 'PACKING' &&
            (isDelivery ? (
              <button
                onClick={() => setShowRiderModal(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 btn-press shadow-md shadow-cyan-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Assign Delivery Rider & Dispatch</span>
              </button>
            ) : (
              <button
                onClick={handleMarkReadyForPickup}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 btn-press shadow-md shadow-cyan-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Bag Ready at Counter #1</span>
              </button>
            ))}

          {(order.status === 'OUT_FOR_DELIVERY' || order.status === 'READY_FOR_PICKUP') && (
            <button
              onClick={handleCompleteOrder}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 btn-press shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Collect Payment & Settle Invoice (₹{order.estimatedTotal || 640})</span>
            </button>
          )}

          {order.status === 'COMPLETED' && (
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Order Fulfilled & Revenue Settled</span>
            </span>
          )}
        </div>
      </div>

      {/* MODAL: ASSIGN DELIVERY RIDER (GAP-11) */}
      {showRiderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRiderModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Assign Delivery Rider</h3>
                <p className="text-xs text-slate-400">Dispatch order #{order.orderId} to customer address.</p>
              </div>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rider Name</label>
                <input
                  type="text"
                  value={riderForm.name}
                  onChange={(e) => setRiderForm({ ...riderForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rider Mobile Number</label>
                <input
                  type="text"
                  value={riderForm.phone}
                  onChange={(e) => setRiderForm({ ...riderForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800 text-[11px] text-slate-400">
                <span>Deliver to: <strong className="text-white">{order.customerName}</strong> ({order.address || 'Local Home Address'})</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRiderModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 btn-press flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL / REJECT ORDER (GAP-08) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Cancel / Reject Order</h3>
                <p className="text-xs text-slate-400">Specify why order #{order.orderId} cannot be fulfilled.</p>
              </div>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="Requested items are out of stock">Requested items are out of stock</option>
                  <option value="Customer unreachable or requested cancellation">Customer unreachable / requested cancellation</option>
                  <option value="Delivery address outside serviceable radius">Delivery address outside serviceable radius</option>
                  <option value="Handwritten parchi photo is unclear/illegible">Handwritten parchi photo is unclear/illegible</option>
                  <option value="Other">Other reason (Write below)</option>
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Custom Reason</label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="e.g. Counter closing for inventory count"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-black shadow-lg shadow-rose-500/20 btn-press flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};