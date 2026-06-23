import type { TareaEstructurada } from '@/features/chat/services/chat-service';

interface ConfirmationModalProps {
  task: TareaEstructurada;
  onConfirm: () => void;
  onEdit: (updated: TareaEstructurada) => void;
  onCancel: () => void;
  open: boolean;
}

export function ConfirmationModal({ task, onConfirm, onEdit, onCancel, open }: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmar tarea</h3>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Título</label>
            <input
              type="text"
              defaultValue={task.titulo}
              onChange={(e) => onEdit({ ...task, titulo: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Descripción</label>
            <textarea
              defaultValue={task.descripcion ?? ''}
              onChange={(e) => onEdit({ ...task, descripcion: e.target.value })}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Categoría</label>
              <select
                value={task.categoria}
                onChange={(e) => onEdit({ ...task, categoria: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="Tarea Pendiente">Tarea Pendiente</option>
                <option value="Dashboard">Dashboard</option>
                <option value="Idea">Idea</option>
                <option value="Práctica Calificada">Práctica Calificada</option>
                <option value="Tesis">Tesis</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Urgencia</label>
              <select
                value={task.nivel_urgencia}
                onChange={(e) => onEdit({ ...task, nivel_urgencia: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="Crítico">Crítico</option>
                <option value="Medio">Medio</option>
                <option value="Baja">Baja</option>
                <option value="Idea">Idea</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Fecha de vencimiento</label>
            <input
              type="date"
              defaultValue={task.fecha_vencimiento?.split('T')[0] ?? ''}
              onChange={(e) => onEdit({ ...task, fecha_vencimiento: e.target.value ? `${e.target.value}T23:59:59-05:00` : null })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            Guardar tarea
          </button>
        </div>
      </div>
    </div>
  );
}
