import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Check,
  UserPlus,
  AlertCircle,
  Phone,
  MapPin,
  IndianRupee,
  ShieldAlert
} from 'lucide-react';

export const AddCustomerModal = ({ onClose }) => {
  const { addKhataCustomer } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    limit: '5000',
    initialDue: '0'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter customer full name');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      await addKhataCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || 'Local Customer',
        limit: parseFloat(formData.limit) || 5000,
        initialDue: parseFloat(formData.initialDue) || 0
      });
      onClose();
    } catch (err) {
      setErrorMsg('Failed to register Khata customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">
              Register New Khata Customer
            </h3>
            <p className="text-xs text-slate-400">
              Open a trusted digital ledger credit account for regular store patrons.
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
          {/* Customer Full Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Chandra Sharma"
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Mobile Phone Number (WhatsApp Reminders) *</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Address / Locality</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. H-34, Gali No. 4, Block B"
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Credit Limit & Initial Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Credit Limit (₹)</span>
              </label>
              <input
                type="number"
                step="500"
                name="limit"
                value={formData.limit}
                onChange={handleChange}
                placeholder="5000"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                <span>Opening Due Balance (₹)</span>
              </label>
              <input
                type="number"
                step="10"
                name="initialDue"
                value={formData.initialDue}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
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
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition btn-press flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Registering...' : 'Register Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
