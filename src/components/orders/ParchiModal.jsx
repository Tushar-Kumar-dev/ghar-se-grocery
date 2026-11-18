import React from 'react';
import { useStore } from '../../context/StoreContext';
import { FileText, X } from 'lucide-react';

export const ParchiModal = () => {
  const { activeParchiOrder, setActiveParchiOrder } = useStore();

  if (!activeParchiOrder) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveParchiOrder(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Customer Handwritten Parchi Inspection
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                High-Res Note
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Order #{activeParchiOrder.orderId} • Placed by {activeParchiOrder.customerName}
            </p>
          </div>
        </div>

        {/* Paper Display Area */}
        <div className="flex-1 min-h-[300px] overflow-auto border border-slate-800 rounded-2xl bg-[#0B0E14] p-4 flex items-center justify-center">
          {activeParchiOrder.parchiImg ? (
            <img
              src={activeParchiOrder.parchiImg}
              alt="Uploaded Customer Parchi"
              className="max-h-[500px] mx-auto rounded-lg shadow-lg border border-slate-700 object-contain"
            />
          ) : (
            <div className="parchi-paper p-6 rounded-xl border border-amber-200 text-slate-900 font-handwritten text-lg leading-relaxed shadow-lg max-w-md w-full text-left">
              <div className="border-b border-red-300 pb-2 mb-3 text-red-700 font-bold text-center">
                Grocery List - Sector 12 (Urgent Delivery)
              </div>
              <div>1. Aashirvaad Atta - 5 kg (Chakki Fresh)</div>
              <div>2. Fortune Mustard Oil - 1 packet (1 Litre)</div>
              <div>3. Tata Tea Gold - 200g Leaf</div>
              <div>4. Amul Butter - 1 big pack (500g)</div>
              <div>5. Sabut Masoor Dal - 1 kg</div>
              <div>6. Dettol Handwash pouch - 1 pc</div>
              <div className="mt-4 pt-2 border-t border-slate-300 text-xs font-mono text-slate-600">
                Customer Note: Please weigh fresh & pack before 7 PM.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400">
            Verify list items, check weights & mark packed when ready.
          </span>
          <button
            onClick={() => setActiveParchiOrder(null)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold btn-press"
          >
            Done Inspecting
          </button>
        </div>

      </div>
    </div>
  );
};