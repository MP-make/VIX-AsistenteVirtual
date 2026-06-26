import { useState, useEffect, useCallback } from 'react'
import { obtenerTareas, toggleCompletada, eliminarTarea } from '@/features/dashboard/services/tasks-repository'
import { scheduleTaskNotifications } from '@/features/notifications/notification-service'
import type { Tarea } from '@/types'

export function useTasks() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setTareas(await obtenerTareas())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tareas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (!loading && tareas.length > 0) {
      scheduleTaskNotifications(tareas).catch(() => {})
    }
  }, [loading, tareas])

  const toggleTask = useCallback(async (id: string, completada: boolean) => {
    try {
      await toggleCompletada(id, completada)
      setTareas(prev => prev.map(t => t.id === id ? { ...t, completada } : t))
    } catch (err) {
      console.error('Error al cambiar estado:', err)
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    try {
      await eliminarTarea(id)
      setTareas(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error al eliminar:', err)
    }
  }, [])

  return { tareas, loading, error, refresh, toggleTask, deleteTask }
}
