import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const bg =
          toast.type === 'success'
            ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
            : toast.type === 'warning'
            ? 'bg-amber-950 border-amber-500 text-amber-200'
            : 'bg-slate-900 border-slate-700 text-slate-200';

        return (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-xl border shadow-xl text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all transform animate-bounce-short ${bg}`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};