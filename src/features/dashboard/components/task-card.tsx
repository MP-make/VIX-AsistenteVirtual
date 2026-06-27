import { useState, useCallback } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { isOverdue } from '@/utils/date-helpers'
import { Trash2, Clock, AlertTriangle, ChevronDown, ChevronUp, Bell } from 'lucide-react'
import type { Tarea } from '@/types'
import { FloatingPoints } from '@/features/dashboard/components/floating-points'

const PUNTOS_POR_URGENCIA: Record<string, number> = {
  Crítico: 30,
  Medio: 20,
  Baja: 10,
  Idea: 5,
}

interface TaskCardProps {
  task: Tarea
  onToggle: (id: string, completada: boolean) => void
  onDelete: (id: string) => void
}

const borderColors: Record<string, string> = {
  Crítico: 'border-l-red-500',
  Medio: 'border-l-amber-500',
  Baja: 'border-l-emerald-500',
  Idea: 'border-l-gray-300 dark:border-l-gray-600',
}

const categoryBadge: Record<string, string> = {
  Dashboard: 'bg-vix-100 text-vix-700 dark:bg-vix-900/40 dark:text-vix-300',
  'Tarea Pendiente': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Idea: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Práctica Calificada': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Tesis: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

function formatNotifSchedule(vencimiento: string | null): string {
  if (!vencimiento) return 'Sin fecha límite — Sin notificaciones'
  const diffMs = new Date(vencimiento).getTime() - Date.now()
  if (diffMs <= 0) return 'Vencida'
  const horas = diffMs / (1000 * 60 * 60)
  if (horas > 168) return 'Cada 24h → Cada 12h → Cada 4h'
  if (horas > 48) return 'Cada 12h → Cada 6h → Cada 1h'
  if (horas > 24) return 'Cada 8h → Cada 3h → Cada 30min'
  if (horas > 4) return 'Cada 1h → Cada 30min → Cada 10min'
  if (horas > 1) return 'Cada 30min → Cada 10min → Cada 5min'
  return 'Cada 10min → Cada 5min → Cada 2min'
}

function formatTiempoRestante(vencimiento: string | null): string {
  if (!vencimiento) return ''
  const diffMs = new Date(vencimiento).getTime() - Date.now()
  if (diffMs <= 0) return 'Vencida'
  const horas = Math.floor(diffMs / (1000 * 60 * 60))
  const min = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (horas > 0) return `${horas}h ${min}min`
  return `${min}min`
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const [showPoints, setShowPoints] = useState(false)
  const [puntosGanados, setPuntosGanados] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const overdue = isOverdue(task.fecha_vencimiento) && !task.completada
  const borderColor = task.completada ? 'border-l-gray-300 dark:border-l-gray-600' : (borderColors[task.nivel_urgencia] ?? 'border-l-gray-300')

  const handleToggle = useCallback((checked: boolean) => {
    if (checked) {
      setPuntosGanados(PUNTOS_POR_URGENCIA[task.nivel_urgencia] ?? 10)
      setShowPoints(true)
    }
    onToggle(task.id, checked)
  }, [task.id, task.nivel_urgencia, onToggle])

  return (
    <div
      className={`group rounded-xl border border-gray-200 border-l-4 bg-white shadow-xs transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900 ${borderColor} ${
        task.completada ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <Checkbox
          checked={task.completada}
          onChange={handleToggle}
          className="mt-0.5"
        />

        {showPoints && (
          <FloatingPoints puntos={puntosGanados} onDone={() => setShowPoints(false)} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-medium leading-snug ${
                task.completada
                  ? 'text-gray-400 line-through dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {task.titulo}
            </h3>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-0.5 shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryBadge[task.categoria] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
              {task.categoria}
            </span>

            {task.fecha_vencimiento && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  overdue
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {overdue ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {overdue ? 'Vencida' : formatTiempoRestante(task.fecha_vencimiento)}
              </span>
            )}
          </div>

          {expanded && (
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              {task.descripcion && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{task.descripcion}</p>
              )}

              {task.fecha_vencimiento && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  Límite: {new Date(task.fecha_vencimiento).toLocaleDateString('es-PE', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Notificaciones:</p>
                  <p>{formatNotifSchedule(task.fecha_vencimiento)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {task.nivel_urgencia}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-400">+{PUNTOS_POR_URGENCIA[task.nivel_urgencia] ?? 10} pts al completar</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
