import { useTasks } from '@/features/dashboard/hooks/use-tasks';
import { TaskCard } from '@/features/dashboard/components/task-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export function DashboardGrid() {
  const { tareas, loading, toggleTask, deleteTask } = useTasks();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const criticas = tareas.filter(t => t.nivel_urgencia === 'Crítico' && !t.completada);
  const pendientes = tareas.filter(t => t.nivel_urgencia !== 'Crítico' && !t.completada);
  const completadas = tareas.filter(t => t.completada);

  return (
    <div className="space-y-8 p-6">
      {criticas.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-red-600 dark:text-red-400">Críticas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {criticas.map(t => (
              <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Pendientes</h2>
        {pendientes.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500">No hay tareas pendientes</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendientes.map(t => (
              <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        )}
      </section>

      {completadas.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-500 dark:text-gray-400">Completadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {completadas.map(t => (
              <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
