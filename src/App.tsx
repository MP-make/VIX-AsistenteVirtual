import { useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { Capacitor } from '@capacitor/core'
import { Brain } from 'lucide-react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/auth-layout'
import { AppLayout } from '@/layouts/app-layout'
import { RoleSelector } from '@/features/auth/components/role-selector'

const NOTIF_CHANNEL_ID = 'vix-tasks'

async function initNotifications() {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    await LocalNotifications.requestPermissions()

    if (Capacitor.isNativePlatform()) {
      const { channels } = await LocalNotifications.listChannels()
      const existing = channels.find(c => c.id === NOTIF_CHANNEL_ID)
      if (!existing || (existing.importance ?? 0) < 4) {
        try {
          await LocalNotifications.deleteChannel({ id: NOTIF_CHANNEL_ID })
        } catch {
          // may not exist
        }
        await LocalNotifications.createChannel({
          id: NOTIF_CHANNEL_ID,
          name: 'Recordatorios de tareas',
          description: 'Notificaciones de tareas pendientes',
          importance: 4,
          vibration: true,
          lights: true,
        })
      }

      const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting()
      if (exact_alarm !== 'granted') {
        await LocalNotifications.changeExactNotificationSetting()
      }
    }
  } catch (e) {
    console.warn('Error al inicializar notificaciones:', e)
  }
}

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-indigo-500/25" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-violet-500/30">
            <Brain className="h-7 w-7 text-white" />
          </div>
        </div>
        <p className="animate-pulse text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user) initNotifications()
  }, [user])

  if (loading) return <LoadingScreen />

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthLayout />} />
      </Routes>
    )
  }

  if (!user.rol_confirmado) {
    return <RoleSelector />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<AppLayout />} />
      <Route path="/tareas" element={<AppLayout />} />
      <Route path="/dashboard" element={<AppLayout />} />
      <Route path="/hijos" element={<AppLayout />} />
      <Route path="/perfil" element={<AppLayout />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}
