import { clsx } from 'clsx'
import { Check } from 'lucide-react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function Checkbox({ checked, onChange, className, disabled }: CheckboxProps) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
        disabled && 'cursor-not-allowed opacity-50',
        checked
          ? 'border-vix-600 bg-vix-600 text-white dark:border-vix-500 dark:bg-vix-500'
          : 'border-gray-300 hover:border-vix-400 dark:border-gray-600 dark:hover:border-vix-500',
        className,
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  )
}
