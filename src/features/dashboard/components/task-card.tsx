import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { formatDateShort, isOverdue } from '@/utils/date-helpers';
import type { Tarea } from '@/types';

interface TaskCardProps {
  task: Tarea;
  onToggle: (id: string, completada: boolean) => void;
  onDelete: (id: string) => void;
}

const urgencyColors: Record<string, string> = {
  Crítico: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
  Medio: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  Baja: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
  Idea: 'border-l-gray-400 bg-gray-50 dark:bg-gray-800',
};

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const overdue = isOverdue(task.fecha_vencimiento) && !task.completada;
  const colorClass = urgencyColors[task.nivel_urgencia] ?? urgencyColors.Medio;

  return (
    <div className={`rounded-lg border-l-4 p-4 shadow-sm ${colorClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={task.completada}
              onChange={(checked) => onToggle(task.id, checked)}
            />
            <h3 className={`truncate text-sm font-medium ${task.completada ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
              {task.titulo}
            </h3>
          </div>
          {task.descripcion && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.descripcion}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {task.categoria}
            </span>
            {task.fecha_vencimiento && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${overdue ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                {overdue ? '⚠ ' : ''}{formatDateShort(task.fecha_vencimiento)}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(task.id)}
          className="shrink-0 text-gray-400 hover:text-red-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
