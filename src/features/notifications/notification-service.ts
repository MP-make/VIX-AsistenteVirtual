import type { Tarea } from '@/types'

const CHANNEL_ID = 'vix-tasks'

function hashId(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) || 1
}

function calcularIntervalo(horasRestantes: number): number {
  if (horasRestantes > 168) return 24 * 60
  if (horasRestantes > 48) return 12 * 60
  if (horasRestantes > 24) return 6 * 60
  if (horasRestantes > 4) return 60
  if (horasRestantes > 1) return 30
  if (horasRestantes > 0.5) return 15
  return 5
}

let scheduledIds: number[] = []

export async function scheduleTaskNotifications(tareas: Tarea[]) {
  const { LocalNotifications } = await import('@capacitor/local-notifications')

  try {
    await LocalNotifications.cancel({ notifications: scheduledIds.map(id => ({ id })) })
  } catch (e) {
    console.warn('Error cancelando notificaciones previas:', e)
  }
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
    const baseId = hashId(tarea.id)
    let notifCount = 0

    const primerNotif = new Date(ahora.getTime() + 1 * 60 * 1000)
    if (primerNotif < vencimiento) {
      const remainingMs = vencimiento.getTime() - primerNotif.getTime()
      const remainingHoras = Math.floor(remainingMs / (1000 * 60 * 60))
      const remainingMin = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
      const body = remainingHoras > 0
        ? `"${tarea.titulo}" — restan ${remainingHoras}h ${remainingMin}min`
        : `"${tarea.titulo}" — restan ${remainingMin}min ⏰`
      const notifId = baseId + notifCount
      scheduledIds.push(notifId)
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: notifId,
            title: `🔔 ${tarea.titulo}`,
            body,
            schedule: { at: primerNotif, allowWhileIdle: true },
            smallIcon: 'ic_launcher_foreground',
            channelId: CHANNEL_ID,
            extra: { taskId: tarea.id },
            actionTypeId: 'view-task',
          }],
        })
      } catch (e) {
        console.warn(`Error agendando notificación para "${tarea.titulo}":`, e)
      }
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

      const notifId = baseId + notifCount
      scheduledIds.push(notifId)

      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: notifId,
            title: `🔔 ${tarea.titulo}`,
            body,
            schedule: { at: fechaNotif, allowWhileIdle: true },
            smallIcon: 'ic_launcher_foreground',
            channelId: CHANNEL_ID,
            extra: { taskId: tarea.id },
            actionTypeId: 'view-task',
          }],
        })
      } catch (e) {
        console.warn(`Error agendando notificación para "${tarea.titulo}":`, e)
      }
      notifCount++
    }
  }
}

export async function cancelAllNotifications() {
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  try {
    await LocalNotifications.cancel({ notifications: scheduledIds.map(id => ({ id })) })
  } catch (e) {
    console.warn('Error cancelando notificaciones:', e)
  }
  scheduledIds = []
}
