import { Checkbox } from '@/components/ui/checkbox'
import { formatDateShort, isOverdue } from '@/utils/date-helpers'
import { Trash2, Clock, AlertTriangle } from 'lucide-react'
import type { Tarea } from '@/types'

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

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const overdue = isOverdue(task.fecha_vencimiento) && !task.completada
  const borderColor = task.completada ? 'border-l-gray-300 dark:border-l-gray-600' : (borderColors[task.nivel_urgencia] ?? 'border-l-gray-300')

  return (
    <div
      className={`group rounded-xl border border-gray-200 border-l-4 bg-white p-4 shadow-xs transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900 ${borderColor} ${
        task.completada ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completada}
          onChange={(checked) => onToggle(task.id, checked)}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm font-medium leading-snug ${
              task.completada
                ? 'text-gray-400 line-through dark:text-gray-500'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {task.titulo}
          </h3>

          {task.descripcion && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
              {task.descripcion}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
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
                {overdue ? 'Vencida' : formatDateShort(task.fecha_vencimiento)}
              </span>
            )}
          </div>
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
