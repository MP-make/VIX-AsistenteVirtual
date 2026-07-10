import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/config/supabase-client'
import { GraduationCap, Users, Loader2 } from 'lucide-react'

export function RoleSelector() {
  const { user, refreshUser } = useAuth()
  const [saving, setSaving] = useState(false)

  const handleSelect = async (rol: 'estudiante' | 'padre') => {
    if (!user || saving) return
    setSaving(true)
    try {
      await supabase
        .from('usuarios')
        .update({ tipo_usuario: rol, rol_confirmado: true })
        .eq('id', user.id)
      await refreshUser()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-gradient-to-br from-vix-50 to-indigo-100 p-4 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="VIX" className="mx-auto h-24 w-24 object-contain brightness-0 opacity-60 dark:brightness-100" />
          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            Bienvenido a VIX
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ¿Cómo vas a usar VIX?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSelect('estudiante')}
            disabled={saving}
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 text-left transition-all hover:border-vix-400 hover:shadow-md disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-vix-500"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-vix-400 to-vix-600">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-900 dark:text-white">Estudiante</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administra tus tareas y trabajos escolares
              </p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('padre')}
            disabled={saving}
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 text-left transition-all hover:border-vix-400 hover:shadow-md disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-vix-500"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-900 dark:text-white">Padre de familia</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestiona las tareas de tus hijos
              </p>
            </div>
          </button>
        </div>

        {saving && (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-vix-500" />
          </div>
        )}
      </div>
    </div>
  )
}
