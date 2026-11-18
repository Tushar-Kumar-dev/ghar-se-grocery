import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { IndianRupee, X } from 'lucide-react';

export const ReceivePaymentModal = ({ customer, onClose }) => {
  const { recordKhataPayment } = useStore();
  const [amount, setAmount] = useState(customer ? customer.due : 500);
  const [mode, setMode] = useState('UPI');

  if (!customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    recordKhataPayment(customer.id, amount);
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
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Record Khata Payment</h3>
            <p className="text-xs text-slate-400">
              {customer.name} ({customer.phone})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800 flex justify-between items-center font-mono">
            <span className="text-slate-400">Current Outstanding Due:</span>
            <span className="text-base font-bold text-amber-400">
              ₹{customer.due.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Payment Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={customer.due}
              required
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-emerald-400 font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Remaining balance after payment:{' '}
              <strong className="text-white">
                ₹{Math.max(0, customer.due - (parseFloat(amount) || 0)).toLocaleString('en-IN')}
              </strong>
            </span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Settlement Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'CASH', 'CARD'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-2 rounded-xl font-bold border transition text-center ${
                    mode === m
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#0B0E14] border-slate-700 text-slate-400'
                  }`}
                >
                  {m === 'UPI' ? '📱 UPI (GPay)' : m === 'CASH' ? '💵 Cash' : '💳 Card'}
                </button>
              ))}
            </div>
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
              Credit & Settle Khata
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};