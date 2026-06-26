import type { Tarea } from '@/types'

type Urgencia = 'Crítico' | 'Medio' | 'Baja' | 'Idea'

const intervalMap: Record<Urgencia, number> = {
  'Crítico': 60,
  'Medio': 240,
  'Baja': 720,
  'Idea': 1440,
}

let scheduledIds: string[] = []

export async function scheduleTaskNotifications(tareas: Tarea[]) {
  const { LocalNotifications } = await import('@capacitor/local-notifications')

  await LocalNotifications.cancel({ notifications: scheduledIds.map(id => ({ id: parseInt(id) })) })
  scheduledIds = []

  const pendientes = tareas.filter(t => !t.completada && t.fecha_vencimiento)

  for (const tarea of pendientes) {
    const vencimiento = new Date(tarea.fecha_vencimiento!)
    const ahora = new Date()
    const diasRestantes = Math.ceil((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
    if (diasRestantes < 0) continue

    const urgencia = (tarea.nivel_urgencia || 'Medio') as Urgencia
    const intervalo = intervalMap[urgencia] || 1440
    const numNotifs = Math.min(Math.ceil(diasRestantes * (1440 / intervalo)), 10)
    const id = parseInt(tarea.id.replace(/-/g, '').slice(0, 8), 16)

    for (let i = 0; i < numNotifs; i++) {
      const notifId = id + i
      const fechaNotif = new Date(ahora.getTime() + (i + 1) * intervalo * 60 * 1000)
      if (fechaNotif > vencimiento) break

      scheduledIds.push(notifId.toString())
      await LocalNotifications.schedule({
        notifications: [{
          id: notifId,
          title: urgencia === 'Crítico' ? '⚠️ Tarea Crítica' : `📌 ${tarea.titulo}`,
          body: urgencia === 'Crítico'
            ? `¡URGENTE! "${tarea.titulo}" vence ${new Date(tarea.fecha_vencimiento!).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`
            : `"${tarea.titulo}" — vence ${new Date(tarea.fecha_vencimiento!).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`,
          smallIcon: 'ic_launcher_foreground',
          extra: { taskId: tarea.id },
        }],
      })
    }
  }
}

export async function cancelAllNotifications() {
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  await LocalNotifications.cancel({ notifications: scheduledIds.map(id => ({ id: parseInt(id) })) })
  scheduledIds = []
}
