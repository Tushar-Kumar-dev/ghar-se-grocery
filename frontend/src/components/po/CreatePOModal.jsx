import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Check,
  Truck,
  Plus,
  AlertCircle,
  Building2,
  Calendar,
  IndianRupee
} from 'lucide-react';

const COMMON_VENDORS = [
  'ITC Limited (Foods & Personal Care)',
  'Hindustan Unilever Limited (HUL)',
  'Nestle India FMCG Depot',
  'Marico Industries (Saffola & Parachute)',
  'Adani Wilmar (Fortune Foods)',
  'Britannia Industries Wholesale',
  'Tata Consumer Products Ltd',
  'Custom FMCG Distributor'
];

export const CreatePOModal = ({ onClose }) => {
  const { createPurchaseOrder } = useStore();

  const [selectedVendor, setSelectedVendor] = useState(COMMON_VENDORS[0]);
  const [customVendorName, setCustomVendorName] = useState('');
  const [items, setItems] = useState('');
  const [amount, setAmount] = useState('');
  const [eta, setEta] = useState('Tomorrow 11:00 AM');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const vendorName =
      selectedVendor === 'Custom FMCG Distributor'
        ? customVendorName.trim()
        : selectedVendor;

    if (!vendorName) {
      setErrorMsg('Please select or enter supplier/vendor name');
      return;
    }
    if (!items.trim()) {
      setErrorMsg('Please specify items or lot descriptions for this purchase order');
      return;
    }
    const amountVal = parseFloat(amount);
    if (!amountVal || amountVal <= 0) {
      setErrorMsg('Please enter a valid purchase order amount');
      return;
    }

    setSubmitting(true);
    try {
      await createPurchaseOrder({
        vendor: vendorName,
        items: items.trim(),
        amount: amountVal,
        eta: eta.trim() || 'Tomorrow 11:00 AM'
      });
      onClose();
    } catch (err) {
      setErrorMsg('Failed to create purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">
              Create Supplier Purchase Order (PO)
            </h3>
            <p className="text-xs text-slate-400">
              Procure wholesale grocery & FMCG lots with automated GRN stock crediting.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Supplier Vendor Selector */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supplier / FMCG Vendor *</span>
            </label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {COMMON_VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {selectedVendor === 'Custom FMCG Distributor' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Custom Distributor Name *</label>
              <input
                type="text"
                value={customVendorName}
                onChange={(e) => setCustomVendorName(e.target.value)}
                placeholder="e.g. Laxmi Agro Mandi Traders"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          )}

          {/* Items & Lots Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Ordered Items & Bulk Quantities *
            </label>
            <textarea
              rows={3}
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="e.g. Aashirvaad Atta 10kg (40 bags), Fortune Mustard Oil 1L (60 btl), Tata Gold 500g (20 pkt)"
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
              required
            />
          </div>

          {/* PO Amount & Expected Delivery ETA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>PO Total Amount (₹) *</span>
              </label>
              <input
                type="number"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="38500"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Expected Arrival (ETA)</span>
              </label>
              <input
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="e.g. Tomorrow 11:00 AM"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 transition btn-press flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Creating PO...' : 'Issue Purchase Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
