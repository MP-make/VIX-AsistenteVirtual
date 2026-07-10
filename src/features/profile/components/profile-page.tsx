import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import { Capacitor } from '@capacitor/core'
import { Sun, Moon, LogOut, Trophy, Calendar, TrendingUp, Star, ChevronRight, Music, VolumeX, Loader2, AlertTriangle, GraduationCap, Users, Save, Camera } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/config/supabase-client'
import type { Recompensa } from '@/types'
import { obtenerNivel, obtenerProgresoNivel, NIVELES } from '@/features/profile/levels'
import { NotificationSound } from '@/plugins/notificationsound'

import { ChildrenManager } from '@/features/profile/components/children-manager'
import { GeminiSettings } from '@/features/profile/components/gemini-settings'
import { uploadAvatar } from '@/services/upload-avatar'

export function ProfilePage() {
  const { user, signOut, refreshUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [recompensas, setRecompensas] = useState<Recompensa[]>([])
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [puntos, setPuntos] = useState(user?.puntos ?? 0)
  const [soundLabel, setSoundLabel] = useState<string>('Predeterminado')
  const [settingSound, setSettingSound] = useState(false)

  const [editGrado, setEditGrado] = useState(user?.grado ?? '')
  const [editEdad, setEditEdad] = useState(user?.edad?.toString() ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [showRoleSwitch, setShowRoleSwitch] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(`avatar_url_${user?.id}`) } catch { return null }
  })
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const nivel = obtenerNivel(puntos)
  const progreso = obtenerProgresoNivel(puntos)

  useEffect(() => {
    (async () => {
      try {
        const resRewards = await supabase
          .from('recompensas')
          .select('*')
          .order('creado_at', { ascending: false })
        if (resRewards.error) throw resRewards.error
        if (resRewards.data && resRewards.data.length > 0) {
          const todas = resRewards.data as Recompensa[]
          setRecompensas(todas.filter(r => r.accion === 'completar_tarea'))
          setPuntos(todas.reduce((sum, r) => sum + r.puntos, 0))
        } else {
          const { data: userPts } = await supabase
            .from('usuarios')
            .select('puntos')
            .eq('id', user?.id)
            .single()
          if (userPts) setPuntos(userPts.puntos)
        }
      } catch (e) {
        const { data: userPts } = await supabase
          .from('usuarios')
          .select('puntos')
          .eq('id', user?.id)
          .single()
        if (userPts) setPuntos(userPts.puntos)
      }
      const { data: userData } = await supabase
        .from('usuarios')
        .select('notif_sound')
        .eq('id', user?.id)
        .single()
      if (userData?.notif_sound) {
        setSoundLabel('Personalizado')
      }
      setLoadingRewards(false)
    })()
  }, [user?.id])

  const initials = user?.nombre
    ? user.nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const avatarSrc = localAvatarUrl ?? user?.avatar_url ?? null

  const indiceNivel = NIVELES.indexOf(nivel)
  const nivelesRestantes = NIVELES.slice(indiceNivel + 1)

  const handleAvatarUpload = async (file: File) => {
    if (!user) return
    setAvatarUploading(true)
    const url = await uploadAvatar(user.id, file, 'users')
    if (url) {
      try { localStorage.setItem(`avatar_url_${user.id}`, url) } catch {}
      await supabase.from('usuarios').update({ avatar_url: url }).eq('id', user.id)
      setLocalAvatarUrl(url)
    }
    setAvatarUploading(false)
  }

  return (
    <div className="flex-1 overflow-y-auto w-full">
      {/* Contenedor Responsivo Principal */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        
        {/* Grid de 1 columna en móvil y 3 columnas en escritorio */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* COLUMNA IZQUIERDA: Perfil y Estadísticas */}
          <div className="space-y-5">
            {/* Cabecera del Perfil */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="relative">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg dark:border-gray-800" />
                ) : (
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${nivel.color} text-2xl font-bold text-white shadow-lg`}>
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-sm dark:bg-gray-800">
                  {nivel.icono}
                </div>
              </div>
              
              <input 
                ref={avatarInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  await handleAvatarUpload(file)
                  if (avatarInputRef.current) avatarInputRef.current.value = ''
                }} 
              />
              
              {avatarUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-vix-500" />
              ) : (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Cambiar foto
                </button>
              )}

              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.nombre ?? 'Usuario'}
                </h1>
                <p className="mt-0.5 text-xs font-medium text-vix-600 dark:text-vix-400">
                  {nivel.titulo}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    user?.tipo_usuario === 'padre'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-vix-100 text-vix-700 dark:bg-vix-900/30 dark:text-vix-300'
                  }`}>
                    {user?.tipo_usuario === 'padre' ? (
                      <><Users className="h-3 w-3" /> Padre</>
                    ) : (
                      <><GraduationCap className="h-3 w-3" /> Estudiante</>
                    )}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>

              {/* Barra de progreso de Nivel */}
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
              <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-vix-50 px-5 py-3 dark:from-amber-900/20 dark:to-vix-900/20">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">{puntos}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">puntos</span>
              </div>
            </div>

            {/* Grid de Estadísticas Rápidas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-medium">Miembro</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {user?.creado_at
                    ? new Date(user.creado_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'short' })
                    : '-'}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500">
                  <Trophy className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-medium">Logros</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {recompensas.length}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-medium">Racha</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {recompensas.length > 0 ? `${Math.min(recompensas.length, 7)} d` : '0 d'}
                </p>
              </div>
            </div>

            {/* Información Escolar o Panel de Hijos dependiente del rol */}
            {user?.tipo_usuario === 'estudiante' ? (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Información escolar</h2>
                </div>
                <div className="space-y-3 px-5 py-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Grado</label>
                    <input
                      value={editGrado}
                      onChange={(e) => setEditGrado(e.target.value)}
                      placeholder="Ej: 5to de secundaria"
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-vix-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Edad</label>
                    <input
                      value={editEdad}
                      onChange={(e) => setEditEdad(e.target.value)}
                      placeholder="Ej: 16"
                      type="number"
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-vix-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!user || savingProfile) return
                      setSavingProfile(true)
                      try {
                        await supabase.from('usuarios').update({
                          grado: editGrado || null,
                          edad: editEdad ? parseInt(editEdad) : null,
                        }).eq('id', user.id)
                      } finally {
                        setSavingProfile(false)
                      }
                    }}
                    disabled={savingProfile}
                    className="flex items-center gap-1.5 rounded-lg bg-vix-500 px-4 py-2 text-xs font-medium text-white hover:bg-vix-600 disabled:opacity-50"
                  >
                    {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <ChildrenManager />
            )}

            {/* Advertencia de Optimización de Batería */}
            {Capacitor.isNativePlatform() && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-start gap-3 px-5 py-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium">¿No recibes notificaciones?</p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                      En algunos dispositivos, la optimización de batería bloquea las notificaciones.
                      Ve a <strong>Ajustes → Batería → Optimización de batería</strong>, busca
                      &quot;VIX&quot; y selecciona <strong>&quot;Sin optimizar&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA CENTRAL: Próximos niveles y Configuración */}
          <div className="space-y-5">
            {/* Vista previa de próximos niveles */}
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

            {/* Selector interactivo para Cambiar Rol */}
            {showRoleSwitch && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Cambiar rol</h2>
                </div>
                <div className="space-y-2 px-5 py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ¿Cómo quieres usar VIX?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!user) return
                        await supabase.from('usuarios').update({ tipo_usuario: 'estudiante' }).eq('id', user.id)
                        await refreshUser()
                      }}
                      disabled={user?.tipo_usuario === 'estudiante'}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium transition-all hover:border-vix-400 disabled:border-vix-500 disabled:bg-vix-50 disabled:text-vix-700 dark:border-gray-700 dark:disabled:bg-vix-900/30 dark:disabled:text-vix-300"
                    >
                      <GraduationCap className="h-4 w-4" />
                      Estudiante
                    </button>
                    <button
                      onClick={async () => {
                        if (!user) return
                        await supabase.from('usuarios').update({ tipo_usuario: 'padre' }).eq('id', user.id)
                        await refreshUser()
                      }}
                      disabled={user?.tipo_usuario === 'padre'}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium transition-all hover:border-amber-400 disabled:border-amber-500 disabled:bg-amber-50 disabled:text-amber-700 dark:border-gray-700 dark:disabled:bg-amber-900/30 dark:disabled:text-amber-400"
                    >
                      <Users className="h-4 w-4" />
                      Padre
                    </button>
                  </div>
                  <button
                    onClick={() => setShowRoleSwitch(false)}
                    className="mt-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Ajustes Generales */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Configuración</h2>
              </div>

              {/* Botón Cambiar Rol */}
              <button
                onClick={() => setShowRoleSwitch(prev => !prev)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  {user?.tipo_usuario === 'padre' ? (
                    <Users className="h-4 w-4 text-amber-500" />
                  ) : (
                    <GraduationCap className="h-4 w-4 text-vix-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Cambiar rol</p>
                  <p className="text-xs text-gray-400">
                    Actual: {user?.tipo_usuario === 'padre' ? 'Padre de familia' : 'Estudiante'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
              </button>

              {/* Selector de Sonidos */}
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

              {/* Restablecer Sonido */}
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

              {/* Conmutador de Tema Claro/Oscuro */}
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

              {/* Botón Cerrar Sesión */}
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
          </div>

          {/* COLUMNA DERECHA: Historial de Recompensas y Configuración de IA */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:sticky lg:top-8">
              <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Historial de recompensas</h2>
              </div>

              <div className="max-h-[400px] overflow-y-auto lg:max-h-[50vh]">
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
            <GeminiSettings />
          </div>

        </div> {/* Cierre del Grid Principal */}
      </div> {/* Cierre del Contenedor Principal */}
    </div>
  )
}