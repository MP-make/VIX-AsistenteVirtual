import { type ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={clsx(
          'relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800',
          className,
        )}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
