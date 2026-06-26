import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-900',
        onClick && 'cursor-pointer transition-all hover:shadow-md active:scale-[0.99]',
        className,
      )}
    >
      {children}
    </div>
  )
}
