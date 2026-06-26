import { useTasks } from '@/features/dashboard/hooks/use-tasks'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { AlertTriangle, CheckCircle2, Clock, ListTodo, TrendingUp, Calendar, Target, Brain } from 'lucide-react'

export function RealDashboard() {
  const { tareas, loading, error, refresh } = useTasks()

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

  const total = tareas.length
  const completadas = tareas.filter(t => t.completada)
  const pendientes = tareas.filter(t => !t.completada)
  const criticas = pendientes.filter(t => t.nivel_urgencia === 'Crítico')
  const vencidas = pendientes.filter(t => t.fecha_vencimiento && new Date(t.fecha_vencimiento) < new Date())
  const tasaCompletadas = total > 0 ? Math.round((completadas.length / total) * 100) : 0

  const categorias = [...new Set(tareas.map(t => t.categoria))]
  const countsPorCategoria = categorias.map(cat => ({
    nombre: cat,
    total: tareas.filter(t => t.categoria === cat).length,
    completadas: tareas.filter(t => t.categoria === cat && t.completada).length,
  }))

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Panel de Control</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Resumen general de tu productividad
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700/50 dark:bg-white/5">
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

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700/50 dark:bg-white/5">
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

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700/50 dark:bg-white/5">
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

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700/50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{vencidas.length}</p>
                <p className="text-xs text-gray-400">Vencidas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/50 dark:bg-white/5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-vix-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Progreso General</h2>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{tasaCompletadas}%</span>
                  <span className="text-xs text-gray-400">{completadas.length}/{total} tareas</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-vix-500 to-vix-400 transition-all duration-500"
                    style={{ width: `${tasaCompletadas}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/50 dark:bg-white/5">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-vix-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Por Categoría</h2>
            </div>
            <div className="space-y-2.5">
              {countsPorCategoria.map(cat => {
                const pct = cat.total > 0 ? Math.round((cat.completadas / cat.total) * 100) : 0
                return (
                  <div key={cat.nombre}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{cat.nombre}</span>
                      <span className="text-gray-500 dark:text-gray-500">{cat.completadas}/{cat.total}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-1.5 rounded-full bg-vix-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/50 dark:bg-white/5">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-vix-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Próximos Vencimientos</h2>
            </div>
            {pendientes.filter(t => t.fecha_vencimiento).sort((a, b) => new Date(a.fecha_vencimiento!).getTime() - new Date(b.fecha_vencimiento!).getTime()).slice(0, 5).length === 0 ? (
              <p className="text-xs text-gray-400">No hay tareas con fecha de vencimiento</p>
            ) : (
              <div className="space-y-2">
                {pendientes.filter(t => t.fecha_vencimiento).sort((a, b) => new Date(a.fecha_vencimiento!).getTime() - new Date(b.fecha_vencimiento!).getTime()).slice(0, 5).map(t => {
                  const overdue = new Date(t.fecha_vencimiento!) < new Date()
                  return (
                    <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{t.titulo}</p>
                        <p className={`text-[10px] ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                          {new Date(t.fecha_vencimiento!).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        t.nivel_urgencia === 'Crítico' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        t.nivel_urgencia === 'Medio' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {t.nivel_urgencia}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/50 dark:bg-white/5">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4 text-vix-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Resumen Rápido</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                <span className="text-xs text-gray-600 dark:text-gray-400">Total de tareas</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{total}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                <span className="text-xs text-gray-600 dark:text-gray-400">Tasa de finalización</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{tasaCompletadas}%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                <span className="text-xs text-gray-600 dark:text-gray-400">Categorías activas</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{categorias.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                <span className="text-xs text-gray-600 dark:text-gray-400">Urgencia crítica</span>
                <span className="text-sm font-semibold text-red-500">{criticas.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
