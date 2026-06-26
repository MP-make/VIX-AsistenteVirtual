import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
        {
          'bg-gradient-to-r from-vix-500 to-vix-700 text-white shadow-sm shadow-vix-500/20 hover:shadow-md hover:shadow-vix-500/30':
            variant === 'primary',
          'border border-gray-200 bg-white text-gray-700 shadow-xs hover:bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700':
            variant === 'secondary',
          'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800':
            variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 shadow-xs':
            variant === 'danger',
        },
        {
          'px-3 py-1.5 text-xs gap-1.5': size === 'sm',
          'px-4 py-2 text-sm gap-2': size === 'md',
          'px-6 py-3 text-base gap-2.5': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
