import { useState, useCallback } from 'react'
import { useTasks } from '@/features/dashboard/hooks/use-tasks'
import { TaskCard } from '@/features/dashboard/components/task-card'
import { crearTarea } from '@/features/dashboard/services/tasks-repository'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { AlertTriangle, CheckCircle2, Clock, ListTodo, Send } from 'lucide-react'

export function DashboardGrid() {
  const { tareas, loading, error, refresh, toggleTask, deleteTask } = useTasks()
  const [nuevaText, setNuevaText] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = useCallback(async () => {
    const text = nuevaText.trim()
    if (!text || creating) return
    setCreating(true)
    try {
      await crearTarea({
        texto_original: text,
        texto_pulido: text,
        titulo: text.length > 60 ? text.slice(0, 60) + '...' : text,
        descripcion: text.length > 60 ? text : null,
        categoria: 'Tarea Pendiente',
        nivel_urgencia: 'Medio',
      })
      setNuevaText('')
      refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }, [nuevaText, creating, refresh])

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
  const criticas = pendientes.filter(t => t.nivel_urgencia === 'Crítico')
  const normales = pendientes.filter(t => t.nivel_urgencia !== 'Crítico')
  const completadas = tareas.filter(t => t.completada)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vix-100 dark:bg-vix-900/30">
                <ListTodo className="h-5 w-5 text-vix-600 dark:text-vix-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendientes.length}</p>
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
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-xs dark:border-gray-700 dark:bg-gray-900">
          <input
            value={nuevaText}
            onChange={(e) => setNuevaText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una tarea y presiona Enter..."
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

        {/* Críticas */}
        {criticas.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Críticas ({criticas.length})
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {criticas.map(t => (
                <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          </section>
        )}

        {/* Pendientes normales */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-vix-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Pendientes ({normales.length})
            </h2>
          </div>
          {normales.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-12 dark:border-gray-700">
              <ListTodo className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No hay tareas pendientes. ¡Usa el chat para crear una!
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {normales.map(t => (
                <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
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
                <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
