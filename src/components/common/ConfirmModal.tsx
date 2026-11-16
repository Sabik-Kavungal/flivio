import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancel();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[1px] p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-[#ECE9E2] max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id="confirm-modal-title" className="text-base font-semibold text-[#1E2022]">
                {title}
              </h3>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Close modal"
                className="text-[#5C5E64] hover:text-[#1E2022] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p id="confirm-modal-desc" className="mt-2 text-sm text-[#5C5E64] leading-relaxed">
              {description}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium border border-[#ECE9E2] text-[#1E2022] hover:bg-[#F7F6F2] transition-colors whitespace-nowrap active:scale-[0.98]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-xs font-medium text-white transition-colors whitespace-nowrap active:scale-[0.98] ${
                  destructive
                    ? 'bg-red-700 hover:bg-red-800'
                    : 'bg-[#1E2022] hover:bg-[#1B2A4A]'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
