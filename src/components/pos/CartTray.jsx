import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingCart,
  Trash2,
  Printer,
  AlertTriangle,
  ArrowDownToLine,
  PauseCircle,
  PlayCircle,
  Clock,
  X
} from 'lucide-react';

export const CartTray = () => {
  const {
    cart,
    addToCart,
    changeCartQty,
    removeFromCart,
    clearCart,
    selectedCustomer,
    setSelectedCustomer,
    discount,
    setDiscount,
    paymentMode,
    setPaymentMode,
    getCartTotals,
    completeInvoice,
    heldBills,
    parkCurrentBill,
    resumeBill,
    discardHeldBill,
    khataCustomers,
    inwardOrders,
    setActiveTab,
    showToast
  } = useStore();

  const [showHeldModal, setShowHeldModal] = useState(false);

  const { subtotal, gst, grandTotal } = getCartTotals();

  const selectedCustObj = khataCustomers.find((c) => c.id === parseInt(selectedCustomer));

  // Find latest pending online order with grocery list
  const latestPendingOrder = inwardOrders.find(
    (o) => o.status === 'PENDING_REVIEW' || o.status === 'PACKING'
  );

  const importOnlineOrderItems = () => {
    if (!latestPendingOrder) return;
    // Add default products
    [1, 2, 3, 4].forEach((id) => addToCart(id));
    showToast(`Loaded grocery list items from ${latestPendingOrder.customerName} (#${latestPendingOrder.orderId}) into POS invoice!`, 'success');
  };

  return (
    <div className="bg-[#131722] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl">
      
      <div>
        {/* Invoice Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Active Invoice Cart</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                #INV-2026-LIVE
              </span>
              {heldBills.length > 0 && (
                <button
                  onClick={() => setShowHeldModal(true)}
                  className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500/25 transition"
                  title="View and resume parked bills"
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{heldBills.length} Held</span>
                </button>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {new Date().toLocaleDateString('en-IN')} • POS Counter #1
            </div>
          </div>

          {/* Customer Selection Dropdown */}
          <div className="w-44">
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full text-xs bg-[#0B0E14] border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="walkin">Walk-in Cash Customer</option>
              {khataCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Khata: ₹{c.due})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Import from Online Inward Order Pill if available */}
        {latestPendingOrder && cart.length === 0 && (
          <div className="mt-2.5 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center justify-between">
            <span className="truncate mr-2">
              📥 Incoming List: <strong>{latestPendingOrder.customerName}</strong> ({latestPendingOrder.orderId})
            </span>
            <button
              onClick={importOnlineOrderItems}
              className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition btn-press shrink-0 flex items-center gap-1"
            >
              <ArrowDownToLine className="w-3 h-3" />
              <span>Import to Bill</span>
            </button>
          </div>
        )}

        {/* Khata Balance Warning if Customer Selected */}
        {selectedCustObj && selectedCustObj.due > 0 && (
          <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Previous Khata Due: <strong>₹{selectedCustObj.due.toLocaleString('en-IN')}</strong>
              </span>
            </span>
            <button
              onClick={() => setActiveTab('khata')}
              className="underline text-amber-400 hover:text-white font-medium"
            >
              View Khata
            </button>
          </div>
        )}

        {/* Cart Items Table */}
        <div className="mt-3 overflow-y-auto max-h-[300px] border border-slate-800/80 rounded-xl bg-[#0B0E14]/70">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 bg-[#0E131F]">
              <tr>
                <th className="py-2 pl-3">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right pr-3">Total</th>
                <th className="py-2 pr-2 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {cart.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="py-2 pl-3 font-semibold text-slate-200">
                    <div className="truncate max-w-[130px] sm:max-w-[160px]">{item.name}</div>
                  </td>
                  <td className="py-2 text-center">
                    <div className="inline-flex items-center gap-1 bg-[#141A28] border border-slate-700 rounded px-1">
                      <button
                        onClick={() => changeCartQty(item.id, -1)}
                        className="text-slate-400 hover:text-white px-1 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white text-[11px] w-5 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => changeCartQty(item.id, 1)}
                        className="text-slate-400 hover:text-white px-1 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-2 text-right font-mono text-slate-300">₹{item.price}</td>
                  <td className="py-2 text-right pr-3 font-mono font-bold text-emerald-400">
                    ₹{item.price * item.qty}
                  </td>
                  <td className="py-2 pr-2 text-center">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-rose-400 hover:text-rose-300 font-bold"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cart.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <span>Cart is empty. Click items on the left or scan barcode gun.</span>
            </div>
          )}
        </div>
      </div>

      {/* Bill Calculations & Payment Modes */}
      <div className="pt-4 border-t border-slate-800 space-y-3 mt-4">
        
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Subtotal:</span>
            <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              GST Break-up <span className="text-[10px] font-mono text-slate-500">(CGST 2.5% + SGST 2.5%)</span>:
            </span>
            <span className="font-mono text-white">₹{gst.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Discount (₹):</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min="0"
              className="w-20 bg-[#0B0E14] border border-slate-700 rounded px-2 py-0.5 text-right font-mono text-emerald-400 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-sm font-extrabold text-white uppercase tracking-wider">Grand Total:</span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Modes Grid */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {[
            { id: 'CASH', label: '💵 Cash' },
            { id: 'UPI', label: '📱 Direct UPI' },
            { id: 'KHATA', label: '📒 Udhaar / Khata' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setPaymentMode(mode.id)}
              className={`py-1.5 rounded-lg text-xs font-bold border transition text-center btn-press ${
                paymentMode === mode.id
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'border-slate-700 bg-slate-800 text-slate-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* GAP-02: Enforce Customer Selection for Khata Payments */}
        {paymentMode === 'KHATA' && selectedCustomer === 'walkin' && (
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>
              <strong>Khata Error:</strong> Walk-in customer par udhar allow nahi hai. Upar dropdown se customer chunein.
            </span>
          </div>
        )}

        {/* Action Buttons with Hold/Park (GAP-12) */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="px-3 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition btn-press disabled:opacity-40"
            title="Clear Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => parkCurrentBill()}
            disabled={cart.length === 0}
            className="px-3.5 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-bold transition btn-press disabled:opacity-40 flex items-center gap-1.5"
            title="Hold/Park this cart to serve next shopper"
          >
            <PauseCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Hold Bill</span>
          </button>

          <button
            onClick={completeInvoice}
            disabled={cart.length === 0 || (paymentMode === 'KHATA' && selectedCustomer === 'walkin')}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition btn-press disabled:opacity-40"
          >
            <Printer className="w-4 h-4" />
            <span>Settle & Print Thermal Receipt</span>
          </button>
        </div>

      </div>

      {/* MODAL: PARKED / HELD BILLS DRAWER (GAP-12) */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowHeldModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Parked / Held Bills ({heldBills.length})</h3>
                <p className="text-xs text-slate-400">Bills paused while shoppers step away. Resume any bill with 1-click.</p>
              </div>
            </div>

            <div className="space-y-3">
              {heldBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-3.5 rounded-2xl bg-[#0B0E14] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                        #{bill.id}
                      </span>
                      <span className="text-xs font-bold text-white">{bill.customerName}</span>
                      <span className="text-[10px] font-mono text-slate-500">• {bill.time}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {bill.cart.length} items: {bill.cart.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                      Total: ₹{bill.totals.grandTotal.toLocaleString('en-IN')} ({bill.paymentMode})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        resumeBill(bill.id);
                        setShowHeldModal(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition btn-press"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                    <button
                      onClick={() => discardHeldBill(bill.id)}
                      className="p-1.5 rounded-xl border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Discard held bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {heldBills.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No parked bills at this time. Click "Hold Bill" on the counter to park a bill.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end">
              <button
                onClick={() => setShowHeldModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};