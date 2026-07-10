import { useState, useEffect, useCallback, useRef } from 'react'
import { obtenerTareas, toggleCompletada, eliminarTarea } from '@/features/dashboard/services/tasks-repository'
import { scheduleTaskNotifications } from '@/features/notifications/notification-service'
import type { Tarea } from '@/types'

const REINTERVALO_NOTIFS = 30 * 60 * 1000

export function useTasks() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const notifRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const agendarNotificaciones = useCallback((lista: Tarea[]) => {
    scheduleTaskNotifications(lista).catch(e => console.warn('Error al agendar notificaciones:', e))
  }, [])

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await obtenerTareas()
      setTareas(data)
      agendarNotificaciones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tareas')
    } finally {
      setLoading(false)
    }
  }, [agendarNotificaciones])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (!loading && tareas.length > 0) {
      agendarNotificaciones(tareas)
    }
    if (notifRef.current) clearInterval(notifRef.current)
    notifRef.current = setInterval(() => {
      if (tareas.length > 0) agendarNotificaciones(tareas)
    }, REINTERVALO_NOTIFS)
    return () => {
      if (notifRef.current) clearInterval(notifRef.current)
    }
  }, [loading, tareas, agendarNotificaciones])

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
