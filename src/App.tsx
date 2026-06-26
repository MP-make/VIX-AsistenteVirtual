import { useAuth } from '@/context/auth-context'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/auth-layout'
import { AppLayout } from '@/layouts/app-layout'

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-vix-400/30" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vix-500 to-vix-700 text-lg font-bold text-white shadow-lg shadow-vix-500/25">
            V
          </div>
        </div>
        <p className="animate-pulse text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthLayout />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<AppLayout />} />
      <Route path="/tareas" element={<AppLayout />} />
      <Route path="/dashboard" element={<AppLayout />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}
