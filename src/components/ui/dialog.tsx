import { type ReactNode, useEffect } from 'react'
import { clsx } from 'clsx'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={clsx(
          'animate-scale-in relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900',
          className,
        )}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
