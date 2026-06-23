import { clsx } from 'clsx';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
          checked
            ? 'border-purple-600 bg-purple-600 text-white'
            : 'border-gray-300 dark:border-gray-600',
        )}
      >
        {checked && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      {label && (
        <span className={clsx('text-sm', checked && 'text-gray-400 line-through dark:text-gray-500')}>
          {label}
        </span>
      )}
    </label>
  );
}
