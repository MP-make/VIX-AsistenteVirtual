import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import { Sun, Moon, LogOut, Trophy, Calendar, TrendingUp, Star, ChevronRight, Music, VolumeX, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase-client'
import type { Recompensa } from '@/types'
import { obtenerNivel, obtenerProgresoNivel, NIVELES } from '@/features/profile/levels'
import { NotificationSound } from '@/plugins/notificationsound'

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [recompensas, setRecompensas] = useState<Recompensa[]>([])
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [puntos, setPuntos] = useState(user?.puntos ?? 0)
  const [soundLabel, setSoundLabel] = useState<string>('Predeterminado')
  const [settingSound, setSettingSound] = useState(false)

  const nivel = obtenerNivel(puntos)
  const progreso = obtenerProgresoNivel(puntos)

  useEffect(() => {
    (async () => {
      const [resRewards, resPuntos] = await Promise.all([
        supabase.from('recompensas').select('*').order('creado_at', { ascending: false }).limit(20),
        supabase.from('usuarios').select('puntos, notif_sound').eq('id', user?.id).single(),
      ])
      if (resRewards.data) setRecompensas(resRewards.data as Recompensa[])
      if (resPuntos.data) {
        setPuntos(resPuntos.data.puntos)
        if (resPuntos.data.notif_sound) {
          setSoundLabel('Personalizado')
        }
      }
      setLoadingRewards(false)
    })()
  }, [user?.id])

  const initials = user?.nombre
    ? user.nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const avatarSrc = user?.avatar_url ? user.avatar_url.replace('=s96-c', '=s256-c') : null

  const indiceNivel = NIVELES.indexOf(nivel)
  const nivelesRestantes = NIVELES.slice(indiceNivel + 1)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6">
        {/* Profile header with level badge */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.nombre ?? 'Usuario'}
                className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg dark:border-gray-800"
              />
            ) : (
              <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${nivel.color} text-2xl font-bold text-white shadow-lg`}>
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-sm dark:bg-gray-800">
              {nivel.icono}
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.nombre ?? 'Usuario'}
            </h1>
            <p className="mt-0.5 text-xs font-medium text-vix-600 dark:text-vix-400">
              {nivel.titulo}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>

          {/* Level progress bar */}
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Nivel {nivel.id}
              </span>
              {progreso.siguiente ? (
                <span>{puntos} / {progreso.siguiente.puntosMin} pts</span>
              ) : (
                <span>¡Nivel máximo! {puntos} pts</span>
              )}
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${nivel.color} transition-all duration-500`}
                style={{ width: `${Math.min(progreso.progreso * 100, 100)}%` }}
              />
            </div>
            {progreso.siguiente && (
              <p className="text-right text-[10px] text-gray-400">
                Siguiente: {progreso.siguiente.icono} {progreso.siguiente.titulo}
              </p>
            )}
          </div>

          {/* Puntos acumulados */}
          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-vix-50 px-5 py-3 dark:from-amber-900/20 dark:to-vix-900/20">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">{puntos}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">puntos</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Miembro</span>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {user?.creado_at
                ? new Date(user.creado_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'short' })
                : '-'}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
              <Trophy className="h-4 w-4" />
              <span className="text-xs">Logros</span>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {recompensas.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Racha</span>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {recompensas.length > 0 ? `${Math.min(recompensas.length, 7)} días` : '0 días'}
            </p>
          </div>
        </div>

        {/* Next levels preview */}
        {nivelesRestantes.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Próximos niveles</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {nivelesRestantes.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-lg">{n.icono}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{n.titulo}</p>
                    <p className="text-xs text-gray-400">{n.puntosMin} pts requeridos</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Configuración</h2>
          </div>

          {/* Sound picker */}
          <button
            onClick={async () => {
              if (settingSound) return;
              setSettingSound(true);
              try {
                const { FilePicker } = await import('@capawesome/capacitor-file-picker');
                const result = await FilePicker.pickFiles({
                  types: ['audio/*'],
                  limit: 1,
                });
                if (result.files?.length > 0) {
                  const file = result.files[0];
                  await NotificationSound.setCustomSound({ fileUri: file.path! });
                  await supabase.from('usuarios').update({ notif_sound: file.path }).eq('id', user?.id);
                  setSoundLabel(file.name ?? 'Audio');
                }
              } catch (e: unknown) {
                if (e instanceof Error && e.message?.includes('cancel')) return;
                setSoundLabel('Predeterminado');
              } finally {
                setSettingSound(false);
              }
            }}
            disabled={settingSound}
            className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              {settingSound ? (
                <Loader2 className="h-4 w-4 animate-spin text-vix-500" />
              ) : (
                <Music className="h-4 w-4 text-vix-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {settingSound ? 'Configurando...' : 'Sonido de notificación'}
              </p>
              <p className="text-xs text-gray-400">{soundLabel}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          </button>

          {/* Reset sound */}
          <button
            onClick={async () => {
              await NotificationSound.resetToDefault();
              await supabase.from('usuarios').update({ notif_sound: null }).eq('id', user?.id);
              setSoundLabel('Predeterminado');
            }}
            className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <VolumeX className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Restablecer sonido</p>
              <p className="text-xs text-gray-400">Volver al sonido por defecto</p>
            </div>
          </button>

          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-vix-600" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              </p>
              <p className="text-xs text-gray-400">Cambiar apariencia de la app</p>
            </div>
            <div className={`h-6 w-10 rounded-full transition-colors ${theme === 'dark' ? 'bg-vix-500' : 'bg-gray-300'}`}>
              <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} />
            </div>
          </button>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-b-2xl px-5 py-4 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <LogOut className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Cerrar sesión</p>
              <p className="text-xs text-red-400">Desconectarte de tu cuenta</p>
            </div>
          </button>
        </div>

        {/* Rewards history */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Historial de recompensas</h2>
          </div>

          {loadingRewards ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-vix-500 border-t-transparent" />
            </div>
          ) : recompensas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Trophy className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Completa tareas para ganar puntos
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recompensas.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Tarea completada
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.creado_at).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +{r.puntos}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
