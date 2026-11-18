import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  CheckSquare,
  Square,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  Printer,
  X,
  Bike,
  ShoppingBag,
  Check,
  Receipt,
  Barcode,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

export const GroceryListDetailModal = ({ order, onClose }) => {
  const { updateOrderStatus, addToCart, setActiveTab, showToast } = useStore();
  const { isCashier, isManager } = useAuth();

  const [zoom, setZoom] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  if (!order) return null;

  const isDelivery = order.fulfillmentMode === 'delivery';

  // Standard digitized items catalog breakdown
  const items = order.itemsList || [
    { id: 1, name: 'Aashirvaad Shudh Chakki Atta', brand: 'ITC', pack: '5 kg', barcode: '8901030382910', qty: 1, price: 245, gst: '5%' },
    { id: 2, name: 'Fortune Kachi Ghani Mustard Oil', brand: 'Adani', pack: '1 L Pouch', barcode: '8906007280145', qty: 1, price: 145, gst: '5%' },
    { id: 3, name: 'Tata Tea Gold Leaf Tea', brand: 'Tata', pack: '200 g', barcode: '8901052002102', qty: 1, price: 140, gst: '5%' },
    { id: 4, name: 'Amul Butter Pasteurised', brand: 'Amul', pack: '500 g', barcode: '8901262010052', qty: 1, price: 275, gst: '12%' },
    { id: 5, name: 'Sabut Masoor Dal', brand: 'Local', pack: '1 kg', barcode: '8901537002014', qty: 1, price: 110, gst: '5%' }
  ];

  const totalAmount = items.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handlePushToPosBill = () => {
    items.forEach((item) => {
      addToCart(item.id || 1);
    });
    showToast(`Transferred ${items.length} items from #${order.orderId} to POS Invoice Cart!`, 'success');
    onClose();
    setActiveTab('pos');
  };

  const handleQuickSettleCashier = () => {
    updateOrderStatus(order.orderId, 'COMPLETED');
    showToast(`Order #${order.orderId} paid and settled for ₹${totalAmount}!`, 'success');
    onClose();
  };

  // =========================================================================
  // CASE 1: CASHIER VIEW (ZERO PARCHI! CLEAN DIGITIZED POS BILLING SHEET)
  // =========================================================================
  if (isCashier) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    Digitized POS Billing Sheet (Cashier Desk)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    #{order.orderId}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Customer: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone}) • {order.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  isDelivery
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {isDelivery ? <Bike className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                <span>{isDelivery ? 'Home Delivery' : 'Counter Pickup'}</span>
              </span>
            </div>
          </div>

          {/* Clean Itemized Table for Cashier (NO PARCHI PAPER) */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0E14]">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-mono uppercase text-slate-400 bg-[#0E131F] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 pl-4">Barcode / SKU</th>
                    <th className="py-2.5">Product Name & Brand</th>
                    <th className="py-2.5 text-center">Qty / Pack</th>
                    <th className="py-2.5 text-right">Unit Rate</th>
                    <th className="py-2.5 text-center">GST</th>
                    <th className="py-2.5 text-right pr-4">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 text-slate-200">
                      <td className="py-3 pl-4 font-mono text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-slate-500" />
                          <span>{item.barcode}</span>
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400">Brand: {item.brand}</div>
                      </td>
                      <td className="py-3 text-center font-mono">
                        {item.qty || 1} x ({item.pack})
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">₹{item.price}</td>
                      <td className="py-3 text-center font-mono text-slate-400">{item.gst}</td>
                      <td className="py-3 text-right pr-4 font-mono font-bold text-emerald-400">
                        ₹{item.price * (item.qty || 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Summary Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block">Total Items: {items.length} Products</span>
                <span className="text-[11px] text-emerald-400 font-mono">✓ Weighed & Verified by Packing Desk</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 uppercase">Total Bill Amount</span>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Cashier Desk Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 btn-press"
            >
              Back to Orders
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickSettleCashier}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 btn-press"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mark Paid (₹{totalAmount})</span>
              </button>

              <button
                onClick={handlePushToPosBill}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 btn-press"
              >
                <span>⚡ Transfer All to POS Invoice Cart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: STORE MANAGER VIEW (FULL SPLIT WORKBENCH WITH RAW PARCHI & PACKING)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Store Manager Parchi Verification & Packing Workbench
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  #{order.orderId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customer: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone}) • Placed at {order.placedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                isDelivery
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {isDelivery ? <Bike className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
              <span>{isDelivery ? 'Home Delivery' : 'In-Store Counter Pickup'}</span>
            </span>
          </div>
        </div>

        {/* Split Workbench View: Left = Customer's Raw Parchi Note, Right = Packing Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-y-auto py-4">
          
          {/* LEFT: Customer List Visual (Parchi or Manual Note) (6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>{order.listType === 'Uploaded Parchi Photo' ? '📸 Uploaded Parchi (Handwritten)' : '✍️ Customer Typed List'}</span>
              </span>

              {/* Zoom & Contrast Toolbar */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
                  className="p-1 rounded bg-[#0B0E14] border border-slate-700 text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
                  className="p-1 rounded bg-[#0B0E14] border border-slate-700 text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setZoom(1); setHighContrast(false); }}
                  className="p-1 rounded bg-[#0B0E14] border border-slate-700 text-slate-300 hover:text-white"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    highContrast
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-[#0B0E14] border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Enhance faint handwriting"
                >
                  Enhance Contrast
                </button>
              </div>
            </div>

            {/* Parchi Viewing Canvas */}
            <div className="flex-1 min-h-[300px] overflow-auto border border-slate-800 rounded-2xl bg-[#0B0E14] p-3 flex items-center justify-center">
              {order.parchiImg ? (
                <div style={{ transform: `scale(${zoom})`, filter: highContrast ? 'contrast(180%) brightness(95%)' : 'none', transition: 'transform 0.15s ease' }}>
                  <img
                    src={order.parchiImg}
                    alt="Customer Parchi"
                    className="max-h-[440px] rounded-lg shadow-lg border border-slate-700 object-contain mx-auto"
                  />
                </div>
              ) : (
                <div
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease' }}
                  className="parchi-paper p-5 rounded-xl border border-amber-200 text-slate-900 font-handwritten text-base leading-relaxed shadow-lg max-w-sm w-full text-left"
                >
                  <div className="border-b border-red-300 pb-1.5 mb-2.5 text-red-700 font-bold text-center">
                    GharSe Grocery List • Sector 12
                  </div>
                  <div>1. Aashirvaad Shudh Chakki Atta - 5 kg</div>
                  <div>2. Fortune Kachi Ghani Mustard Oil - 1 packet (1L)</div>
                  <div>3. Tata Tea Gold - 200g Leaf</div>
                  <div>4. Amul Butter - 1 big pack (500g)</div>
                  <div>5. Sabut Masoor Dal - 1 kg</div>
                  <div className="mt-3 pt-2 border-t border-slate-300 text-[11px] font-mono text-slate-600">
                    Delivery Note: Please weigh fresh & pack before 7 PM.
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 p-2 rounded-xl bg-[#0B0E14] border border-slate-800">
              <strong>Delivery Destination:</strong> {order.address}
            </div>
          </div>

          {/* RIGHT: Packing Checklist & Store Verification (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Store Packing Checklist (Tick when packed)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {Object.values(checkedItems).filter(Boolean).length}/{items.length} Packed
                </span>
              </div>

              {/* Checklist Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0B0E14]">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] font-mono uppercase text-slate-400 bg-[#0E131F] border-b border-slate-800">
                    <tr>
                      <th className="py-2 pl-3">Status</th>
                      <th className="py-2">Item Name</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2 text-right pr-3">Est. Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {items.map((item, idx) => {
                      const isChecked = !!checkedItems[idx];
                      return (
                        <tr
                          key={idx}
                          onClick={() => toggleCheck(idx)}
                          className={`cursor-pointer transition ${
                            isChecked ? 'bg-emerald-500/10 text-emerald-200' : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <td className="py-2.5 pl-3">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </td>
                          <td className="py-2.5 font-semibold">
                            <span className={isChecked ? 'line-through text-slate-400' : 'text-white'}>
                              {item.name}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono text-slate-400">{item.pack || item.qty}</td>
                          <td className="py-2.5 text-right pr-3 font-mono text-emerald-400">
                            ₹{item.price}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${(Object.values(checkedItems).filter(Boolean).length / items.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions for Manager */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={handlePushToPosBill}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 btn-press"
              >
                <span>⚡ Transfer Verified Items to POS Invoice Cart</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                {order.status === 'PENDING_REVIEW' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(order.orderId, 'PACKING');
                      showToast(`Order #${order.orderId} marked as PACKING`, 'info');
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs btn-press"
                  >
                    Mark Packing Started
                  </button>
                )}

                {order.status === 'PACKING' && (
                  <button
                    onClick={() => {
                      const next = isDelivery ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP';
                      updateOrderStatus(order.orderId, next);
                      showToast(isDelivery ? 'Assigned Rider & Dispatched' : 'Marked Ready for Pickup at Counter', 'success');
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs btn-press"
                  >
                    {isDelivery ? '🛵 Dispatch with Rider' : '🛍️ Mark Ready at Counter #1'}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs btn-press"
                >
                  Close Workbench
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};