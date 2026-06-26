import { type ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-vix-400/30" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vix-500 to-vix-700 text-lg font-bold text-white shadow-lg shadow-vix-500/25">
              V
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    window.location.href = '/login'
    return null
  }

  return <>{children}</>
}
