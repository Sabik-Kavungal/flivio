import React from 'react';
import { Check, Info, AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../store/useStore';

export const ToastContainer: React.FC = () => {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 lg:bottom-5 right-4 z-[90] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon =
            toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : Check;
          const accentColor =
            toast.type === 'error'
              ? 'text-red-600'
              : toast.type === 'info'
              ? 'text-[#5C5E64]'
              : 'text-[#1B2A4A]';

          return (
            <motion.div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto bg-white border border-[#ECE9E2] shadow-lg px-4 py-3 flex items-start gap-3 min-w-[260px]"
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${accentColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1E2022]">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-[#5C5E64] mt-0.5 truncate">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-[#86888E] hover:text-[#1E2022] p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
