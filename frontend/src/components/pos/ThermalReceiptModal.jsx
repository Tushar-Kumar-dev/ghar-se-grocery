import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Printer, X } from 'lucide-react';

export const ThermalReceiptModal = () => {
  const { activeReceipt, setActiveReceipt, settings } = useStore();

  if (!activeReceipt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveReceipt(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">
            Thermal Printer Preview
          </span>
          <h3 className="text-base font-bold text-white">80mm POS Receipt Slip</h3>
        </div>

        {/* RECEIPT PAPER ROLL */}
        <div
          id="printable-receipt"
          className="receipt-paper p-6 mx-auto rounded font-mono text-xs leading-relaxed max-w-[340px]"
        >
          <div className="text-center space-y-0.5 border-b border-dashed border-gray-400 pb-3 mb-3">
            <div className="font-black text-sm tracking-tight text-gray-950 uppercase">
              {settings.storeName}
            </div>
            <div className="text-[10px] text-gray-600 uppercase">{settings.address}</div>
            <div className="text-[10px] text-gray-600">
              PH: {settings.phone} • GSTIN: {settings.gstin}
            </div>
            <div className="text-[10px] text-gray-700 font-bold pt-1">TAX INVOICE / CASH MEMO</div>
          </div>

          <div className="text-[10px] text-gray-700 border-b border-dashed border-gray-400 pb-2 mb-2">
            <div className="flex justify-between">
              <span>
                INV: <strong>{activeReceipt.invoiceNumber}</strong>
              </span>
              <span>{activeReceipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span>CASHIER: {settings.cashierName.toUpperCase()}</span>
              <span>{activeReceipt.time}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span>CUSTOMER: {activeReceipt.customerName.toUpperCase()}</span>
              <span className="font-bold">[{activeReceipt.paymentMode}]</span>
            </div>
          </div>

          {/* Receipt Items Table */}
          <table className="w-full text-[10px] mb-3">
            <thead>
              <tr className="border-b border-gray-400 text-left">
                <th className="py-1">ITEM</th>
                <th className="py-1 text-center">QTY</th>
                <th className="py-1 text-right">RATE</th>
                <th className="py-1 text-right">AMT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dotted divide-gray-300">
              {activeReceipt.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 text-gray-900 font-semibold">{item.name.substring(0, 20)}</td>
                  <td className="py-1 text-center">{item.qty}</td>
                  <td className="py-1 text-right">{item.price}</td>
                  <td className="py-1 text-right font-bold text-gray-950">
                    {item.price * item.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-[10px] text-gray-800">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>₹{activeReceipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (2.5%):</span>
              <span>₹{(activeReceipt.gst / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (2.5%):</span>
              <span>₹{(activeReceipt.gst / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>DISCOUNT:</span>
              <span>-₹{activeReceipt.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-black border-t-2 border-gray-900 pt-1.5 text-gray-950">
              <span>NET PAYABLE:</span>
              <span>₹{activeReceipt.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-400 space-y-1">
            <p className="text-[10px] font-bold text-gray-800">Payment: {activeReceipt.paymentMode || 'CASH'}</p>
            <p className="text-[9px] text-gray-600">Goods once sold will not be taken back after 7 days.</p>
            <p className="text-[9px] text-gray-800 uppercase font-extrabold tracking-wider pt-1">
              Thank you for shopping at Apna Bazar! 🙏
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 btn-press"
          >
            <Printer className="w-4 h-4" />
            <span>Send to Thermal Printer (Ctrl+P)</span>
          </button>
          <button
            onClick={() => setActiveReceipt(null)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold btn-press"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};