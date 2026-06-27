import type { Tarea } from '@/types'

function calcularIntervalo(horasRestantes: number): number {
  if (horasRestantes > 168) return 24 * 60
  if (horasRestantes > 48) return 12 * 60
  if (horasRestantes > 24) return 6 * 60
  if (horasRestantes > 4) return 60
  if (horasRestantes > 1) return 30
  if (horasRestantes > 0.5) return 15
  return 5
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
    const diffMs = vencimiento.getTime() - ahora.getTime()
    if (diffMs <= 0) continue

    const horasRestantes = diffMs / (1000 * 60 * 60)
    const intervalo = calcularIntervalo(horasRestantes)
    const maxNotifs = Math.min(Math.ceil(horasRestantes * 60 / intervalo), 30)
    const id = parseInt(tarea.id.replace(/-/g, '').slice(0, 8), 16)
    let notifCount = 0

    const primerNotif = new Date(ahora.getTime() + 1 * 60 * 1000)
    if (primerNotif < vencimiento) {
      const remainingMs = vencimiento.getTime() - primerNotif.getTime()
      const remainingHoras = Math.floor(remainingMs / (1000 * 60 * 60))
      const remainingMin = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
      const body = remainingHoras > 0
        ? `"${tarea.titulo}" — restan ${remainingHoras}h ${remainingMin}min`
        : `"${tarea.titulo}" — restan ${remainingMin}min ⏰`
      const notifId = id + notifCount
      scheduledIds.push(notifId.toString())
      await LocalNotifications.schedule({
        notifications: [{
          id: notifId,
          title: `🔔 ${tarea.titulo}`,
          body,
          schedule: { at: primerNotif },
          smallIcon: 'ic_launcher_foreground',
          sound: 'default',
          extra: { taskId: tarea.id },
          actionTypeId: 'view-task',
        }],
      })
      notifCount++
    }

    for (let i = 1; i <= maxNotifs; i++) {
      const fechaNotif = new Date(ahora.getTime() + i * intervalo * 60 * 1000)
      if (fechaNotif >= vencimiento) break

      const remainingMs = vencimiento.getTime() - fechaNotif.getTime()
      const remainingHoras = Math.floor(remainingMs / (1000 * 60 * 60))
      const remainingMin = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))

      const body = remainingHoras > 0
        ? `"${tarea.titulo}" — restan ${remainingHoras}h ${remainingMin}min`
        : `"${tarea.titulo}" — restan ${remainingMin}min ⏰`

      const notifId = id + notifCount
      scheduledIds.push(notifId.toString())

      await LocalNotifications.schedule({
        notifications: [{
          id: notifId,
          title: `🔔 ${tarea.titulo}`,
          body,
          schedule: { at: fechaNotif },
          smallIcon: 'ic_launcher_foreground',
          sound: 'default',
          extra: { taskId: tarea.id },
          actionTypeId: 'view-task',
        }],
      })
      notifCount++
    }
  }
}

export async function cancelAllNotifications() {
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  await LocalNotifications.cancel({ notifications: scheduledIds.map(id => ({ id: parseInt(id) })) })
  scheduledIds = []
}
