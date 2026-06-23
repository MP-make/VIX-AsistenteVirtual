import { useState, useEffect, useCallback } from 'react';
import { obtenerTareas, toggleCompletada, eliminarTarea } from '@/features/dashboard/services/tasks-repository';
import type { Tarea } from '@/types';

interface UseTasksReturn {
  tareas: Tarea[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  toggleTask: (id: string, completada: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerTareas();
      setTareas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleTask = useCallback(async (id: string, completada: boolean) => {
    try {
      await toggleCompletada(id, completada);
      setTareas(prev => prev.map(t => t.id === id ? { ...t, completada } : t));
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await eliminarTarea(id);
      setTareas(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
    }
  }, []);

  return { tareas, loading, error, refresh, toggleTask, deleteTask };
}
