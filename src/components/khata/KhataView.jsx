import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ReceivePaymentModal } from './ReceivePaymentModal';
import { AddCustomerModal } from './AddCustomerModal';
import { BookOpen, IndianRupee, MessageCircle, AlertCircle, Plus, UserPlus } from 'lucide-react';

export const KhataView = () => {
  const { khataCustomers, showToast } = useStore();
  const [selectedCustForPay, setSelectedCustForPay] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const totalOutstanding = khataCustomers.reduce((sum, c) => sum + c.due, 0);
  const overdueCount = khataCustomers.filter((c) => c.due > 1000).length;

  const handleSendReminder = (customer) => {
    showToast(
      `📲 WhatsApp payment reminder generated for ${customer.name} (Due: ₹${customer.due})`,
      'info'
    );
  };

  return (
    <div className="space-y-5">
      
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131722] p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="text-xs font-mono text-amber-300">TOTAL KHATA OUTSTANDING (KUL UDHAAR)</div>
          <div className="text-3xl font-black font-mono text-amber-400 mt-1">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {khataCustomers.length} registered regular family accounts
          </div>
        </div>

        <div className="bg-[#131722] p-4 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-emerald-400">COLLECTED THIS MONTH</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">₹74,100</div>
          <div className="text-[11px] text-slate-400 mt-1">Direct UPI & Cash settlements</div>
        </div>

        <div className="bg-[#131722] p-4 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-blue-400">HIGH OUTSTANDING ACCOUNTS</div>
          <div className="text-3xl font-black font-mono text-white mt-1">
            {overdueCount} Accounts
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Balance &gt; ₹1,000 pending</div>
        </div>
      </div>

      {/* Customer Khata Table */}
      <div className="bg-[#131722] rounded-2xl border border-slate-800 overflow-hidden">
        
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">Customer Credit Accounts (Bahi Khata)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Digital ledger with instant payment recording & WhatsApp reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-bold text-xs flex items-center gap-1.5 btn-press transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Customer</span>
            </button>

            <button
              onClick={() => setSelectedCustForPay(khataCustomers[0])}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 btn-press"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 bg-[#0E131F]">
              <tr>
                <th className="py-2.5 pl-4">Customer Name</th>
                <th className="py-2.5">Phone Number</th>
                <th className="py-2.5">Address / Locality</th>
                <th className="py-2.5 text-right">Current Outstanding</th>
                <th className="py-2.5 text-center">Credit Limit</th>
                <th className="py-2.5 text-center">Last Payment</th>
                <th className="py-2.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {khataCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40">
                  <td className="py-3 pl-4 font-bold text-white">{c.name}</td>
                  <td className="py-3 font-mono text-slate-300">{c.phone}</td>
                  <td className="py-3 text-slate-300">{c.address}</td>
                  <td
                    className={`py-3 text-right font-mono font-bold ${
                      c.due > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    ₹{c.due.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-center font-mono text-slate-400">
                    ₹{c.limit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-center font-mono text-slate-400">{c.lastPay}</td>
                  <td className="py-3 pr-4 text-right space-x-1.5">
                    {c.due > 0 ? (
                      <>
                        <button
                          onClick={() => setSelectedCustForPay(c)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-[11px] border border-emerald-500/30 btn-press"
                        >
                          + Receive ₹
                        </button>
                        <button
                          onClick={() => handleSendReminder(c)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] border border-slate-700 btn-press"
                          title="Send WhatsApp Reminder"
                        >
                          📲 Remind
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        ✓ All Clear
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Receive Payment Modal */}
      {selectedCustForPay && (
        <ReceivePaymentModal
          customer={selectedCustForPay}
          onClose={() => setSelectedCustForPay(null)}
        />
      )}

      {/* Add New Khata Customer Modal (GAP-10) */}
      {isAddCustomerOpen && (
        <AddCustomerModal onClose={() => setIsAddCustomerOpen(false)} />
      )}

    </div>
  );
};