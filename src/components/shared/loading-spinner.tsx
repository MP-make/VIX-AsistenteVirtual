interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const dim = size === 'lg' ? 'h-10 w-10' : size === 'md' ? 'h-7 w-7' : 'h-4 w-4'

  return (
    <div className="relative flex items-center justify-center">
      <div className={`${dim} animate-spin rounded-full border-2 border-vix-200 border-t-vix-600 dark:border-vix-800 dark:border-t-vix-400`} />
    </div>
  )
}
