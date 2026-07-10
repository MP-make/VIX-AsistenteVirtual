import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useTasks } from '@/features/dashboard/hooks/use-tasks'
import { useHijos } from '@/features/dashboard/hooks/use-hijos'
import { TaskCard } from '@/features/dashboard/components/task-card'
import { crearTarea, actualizarTarea } from '@/features/dashboard/services/tasks-repository'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { AlertTriangle, CheckCircle2, Clock, ListTodo, Send, ChevronDown, User } from 'lucide-react'
import { detectarHijo } from '@/utils/detect-hijo'
import { getInitials } from '@/services/upload-avatar'

export function DashboardGrid() {
  const { user } = useAuth()
  const { tareas, loading, error, refresh, toggleTask, deleteTask } = useTasks()
  const { hijos } = useHijos()
  const [nuevaText, setNuevaText] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedHijoId, setSelectedHijoId] = useState<string | null>(null)
  const [filterHijoId, setFilterHijoId] = useState<string | null>(null)
  const isPadre = user?.tipo_usuario === 'padre'
  const PERSONAL = '__personal__'

  // Auto-detectar hijo mientras se escribe
  useEffect(() => {
    if (isPadre && nuevaText.trim()) {
      const detected = detectarHijo(nuevaText, hijos)
      if (detected) {
        setSelectedHijoId(detected.id)
      }
    }
  }, [isPadre, nuevaText, hijos])

  const handleCreate = useCallback(async () => {
    const text = nuevaText.trim()
    if (!text || creating) return
    setCreating(true)
    try {
      const esPersonal = isPadre && selectedHijoId === PERSONAL
      await crearTarea({
        texto_original: text,
        texto_pulido: text,
        titulo: text.length > 60 ? text.slice(0, 60) + '...' : text,
        descripcion: text.length > 60 ? text : null,
        categoria: 'Tarea Pendiente',
        nivel_urgencia: 'Medio',
        hijo_id: isPadre && !esPersonal ? selectedHijoId : null,
        es_personal: esPersonal,
      })
      setNuevaText('')
      refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }, [nuevaText, creating, refresh, isPadre, selectedHijoId])

  const handleAssignHijo = useCallback(async (taskId: string, hijoId: string | null) => {
    try {
      await actualizarTarea(taskId, { hijo_id: hijoId, es_personal: !hijoId })
      refresh()
    } catch (err) {
      console.error(err)
    }
  }, [refresh])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    }
  }, [handleCreate])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={refresh}
          className="rounded-xl bg-vix-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-vix-600"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const pendientes = tareas.filter(t => !t.completada)
  let criticas = pendientes.filter(t => t.nivel_urgencia === 'Crítico')
  let normales = pendientes.filter(t => t.nivel_urgencia !== 'Crítico')
  let completadas = tareas.filter(t => t.completada)

  // Cuando el padre filtra por un hijo específico, acotar las tareas
  if (isPadre && filterHijoId) {
    if (filterHijoId === PERSONAL) {
      criticas = criticas.filter(t => t.es_personal)
      normales = normales.filter(t => t.es_personal)
      completadas = completadas.filter(t => t.es_personal)
    } else {
      criticas = criticas.filter(t => t.hijo_id === filterHijoId)
      normales = normales.filter(t => t.hijo_id === filterHijoId)
      completadas = completadas.filter(t => t.hijo_id === filterHijoId)
    }
  }

  const pendientesFiltradas = [...criticas, ...normales]

  return (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto min-h-full w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vix-100 dark:bg-vix-900/30">
                <ListTodo className="h-5 w-5 text-vix-600 dark:text-vix-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendientesFiltradas.length}</p>
                <p className="text-xs text-gray-400">Pendientes</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{criticas.length}</p>
                <p className="text-xs text-gray-400">Críticas</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendientes.filter(t => t.fecha_vencimiento && new Date(t.fecha_vencimiento) < new Date()).length}
                </p>
                <p className="text-xs text-gray-400">Vencidas</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completadas.length}</p>
                <p className="text-xs text-gray-400">Completadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crear tarea rápida */}
        <div className="space-y-2">
          {isPadre && hijos.length > 0 && (
            <div className="relative">
              <select
                value={selectedHijoId ?? ''}
                onChange={(e) => setSelectedHijoId(e.target.value || null)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm outline-none focus:border-vix-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Asignar a...</option>
                <option value={PERSONAL}>👤 Personal / Para mí</option>
                {hijos.map(h => (
                  <option key={h.id} value={h.id}>{h.nombre_completo}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-xs dark:border-gray-700 dark:bg-gray-900">
            <input
              value={nuevaText}
              onChange={(e) => setNuevaText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isPadre ? 'Escribe una tarea para tu hijo...' : 'Escribe una tarea y presiona Enter...'}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !nuevaText.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-vix-600 text-white transition-colors hover:bg-vix-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filtro por hijo (solo padres) */}
        {isPadre && hijos.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterHijoId(null)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterHijoId === null
                    ? 'bg-gradient-to-r from-vix-500 to-vix-600 text-white shadow-sm'
                    : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Todos
              </button>
              <button
                onClick={() => setFilterHijoId(PERSONAL)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterHijoId === PERSONAL
                    ? 'bg-gradient-to-r from-vix-500 to-vix-600 text-white shadow-sm'
                    : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                }`}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : user?.nombre ? (
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                    filterHijoId === PERSONAL ? 'bg-white/20' : 'bg-vix-100 text-vix-600 dark:bg-vix-900/50 dark:text-vix-400'
                  }`}>
                    {getInitials(user.nombre)}
                  </span>
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                Yo
              </button>
              {hijos.map(h => {
                const initials = getInitials(h.nombre_completo)
                const isActive = filterHijoId === h.id
                return (
                  <button
                    key={h.id}
                    onClick={() => setFilterHijoId(h.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-vix-500 to-vix-600 text-white shadow-sm'
                        : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                    }`}
                  >
                    {h.avatar_url ? (
                      <img src={h.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                    ) : (
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                        isActive ? 'bg-white/20' : 'bg-vix-100 text-vix-600 dark:bg-vix-900/50 dark:text-vix-400'
                      }`}>
                        {initials}
                      </span>
                    )}
                    {h.nombre_completo.split(' ')[0]}
                  </button>
                )
              })}
            </div>
        )}

        {/* Pendientes */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-vix-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Pendientes ({pendientesFiltradas.length})
            </h2>
          </div>
          {pendientesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-12 dark:border-gray-700">
              <ListTodo className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No hay tareas pendientes. ¡Usa el chat para crear una!
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendientesFiltradas.map(t => (
                <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} hijos={isPadre ? hijos : undefined} onAssignHijo={isPadre ? handleAssignHijo : undefined} />
              ))}
            </div>
          )}
        </section>

        {/* Completadas */}
        {completadas.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                Completadas ({completadas.length})
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {completadas.map(t => (
                <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} hijos={isPadre ? hijos : undefined} onAssignHijo={isPadre ? handleAssignHijo : undefined} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
