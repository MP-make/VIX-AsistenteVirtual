import type { UrgenciaTarea } from '@/types'
import { crearTarea } from '@/features/dashboard/services/tasks-repository'

const URGENCIAS: Record<string, UrgenciaTarea> = {
  urgente: 'Crítico',
  critico: 'Crítico',
  crítica: 'Crítico',
  crítico: 'Crítico',
  importante: 'Crítico',
  superurgente: 'Crítico',
  alta: 'Crítico',
  media: 'Medio',
  normal: 'Medio',
  baja: 'Baja',
  opcional: 'Idea',
  idea: 'Idea',
}

const DIAS_SEMANA: Record<string, number> = {
  domingo: 0, dom: 0,
  lunes: 1, lun: 1,
  martes: 2, mar: 2,
  miércoles: 3, miercoles: 3, mie: 3, mié: 3,
  jueves: 4, jue: 4,
  viernes: 5, vie: 5,
  sábado: 6, sabado: 6, sab: 6, sáb: 6,
}

function extraerHora(texto: string, ahora: Date = new Date()): { hora: number; minuto: number } | null {
  const lower = texto.toLowerCase()

  if (/\bmedianoche\b/.test(lower)) return { hora: 0, minuto: 0 }
  if (/\bmediod[ií]a\b/.test(lower) || /\bmedio\s+d[ií]a\b/.test(lower)) return { hora: 12, minuto: 0 }

  const regexHora = /(\d{1,2})(?::(\d{2}))?\s*(?:a\.?\s*m\.?|am|p\.?\s*m\.?|pm)?/gi
  const match = regexHora.exec(texto)
  if (!match) return null

  let hora = parseInt(match[1])
  const minuto = match[2] ? parseInt(match[2]) : 0
  const sufijo = match[0].toLowerCase()

  if (sufijo.includes('p.m') || sufijo.includes('pm') || sufijo.includes('p. m')) {
    if (hora < 12) hora += 12
  } else if (sufijo.includes('a.m') || sufijo.includes('am') || sufijo.includes('a. m')) {
    if (hora === 12) hora = 0
  } else if (hora === 12) {
    const noonToday = new Date(ahora)
    noonToday.setHours(12, minuto, 0, 0)
    if (ahora >= noonToday) hora = 0
  } else {
    const hoyAm = new Date(ahora)
    hoyAm.setHours(hora, minuto, 0, 0)
    if (hoyAm <= ahora && hora < 12) {
      const hoyPm = new Date(ahora)
      hoyPm.setHours(hora + 12, minuto, 0, 0)
      if (hoyPm > ahora) hora += 12
    }
  }

  if (hora > 23 || minuto > 59) return null
  return { hora, minuto }
}

function finSemana(hoy: Date): Date {
  const d = new Date(hoy)
  const diasHastaDom = (7 - d.getDay()) % 7
  if (diasHastaDom === 0) d.setDate(d.getDate() + 7)
  else d.setDate(d.getDate() + diasHastaDom)
  d.setHours(23, 59, 0, 0)
  return d
}

function finMes(hoy: Date): Date {
  const d = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 0, 0)
  return d
}

function extraerFecha(texto: string): Date | null {
  const hoy = new Date()
  const lower = texto.toLowerCase()

  // "hoy"
  if (/\bhoy\b/.test(lower)) return hoy

  // "mañana"
  if (/\bmañana\b/.test(lower)) {
    const d = new Date(hoy)
    d.setDate(d.getDate() + 1)
    return d
  }

  // "pasado mañana"
  if (/pasado\s*mañana/.test(lower)) {
    const d = new Date(hoy)
    d.setDate(d.getDate() + 2)
    return d
  }

  // "esta semana" / "esta semana"
  if (/\best[ae]\s*semana\b/.test(lower)) {
    return finSemana(hoy)
  }

  // "este mes" / "esta mes"
  if (/\best[ae]\s*mes\b/.test(lower)) {
    return finMes(hoy)
  }

  // "este año"
  if (/\best[ae]\s*año\b/.test(lower)) {
    return new Date(hoy.getFullYear(), 11, 31, 23, 59, 0, 0)
  }

  // "en N dias/semana/mes"
  const enMatch = lower.match(/en\s+(\d+)\s*(días?|dias?|semanas?|mes(?:es)?)/)
  if (enMatch) {
    const cantidad = parseInt(enMatch[1])
    const unidad = enMatch[2]
    const d = new Date(hoy)
    if (unidad.startsWith('día') || unidad.startsWith('dia')) d.setDate(d.getDate() + cantidad)
    else if (unidad.startsWith('semana')) d.setDate(d.getDate() + cantidad * 7)
    else if (unidad.startsWith('mes')) d.setMonth(d.getMonth() + cantidad)
    return d
  }

  // "el lunes/martes..." o "este lunes/martes..."
  const diaMatch = lower.match(/(?:este|el|próximo|proximo)\s*(domingo|lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|dom|lun|mar|mie|mi[ée]|jue|vie|sab|[áa]b)/)
  if (diaMatch) {
    const diaNombre = diaMatch[1].toLowerCase()
    const diaTarget = DIAS_SEMANA[diaNombre]
    if (diaTarget !== undefined) {
      const d = new Date(hoy)
      const diff = (diaTarget - d.getDay() + 7) % 7
      if (diff === 0) d.setDate(d.getDate() + 7)
      else d.setDate(d.getDate() + diff)
      return d
    }
  }

  // "dd/mm" o "dd-mm"
  const fechaMatch = lower.match(/(\d{1,2})\s*[\/\-]\s*(\d{1,2})/)
  if (fechaMatch) {
    const dia = parseInt(fechaMatch[1])
    const mes = parseInt(fechaMatch[2]) - 1
    if (dia >= 1 && dia <= 31 && mes >= 0 && mes <= 11) {
      const d = new Date(hoy.getFullYear(), mes, dia)
      if (d < hoy) d.setFullYear(d.getFullYear() + 1)
      return d
    }
  }

  return null
}

function extraerUrgencia(texto: string, fechaVencimiento?: string | null): UrgenciaTarea {
  const lower = texto.toLowerCase()
  for (const [palabra, urgencia] of Object.entries(URGENCIAS)) {
    if (lower.includes(palabra)) return urgencia
  }

  if (fechaVencimiento) {
    const diffMs = new Date(fechaVencimiento).getTime() - Date.now()
    const horas = diffMs / (1000 * 60 * 60)
    if (horas <= 0) return 'Crítico'
    if (horas <= 4) return 'Crítico'
    if (horas <= 24) return 'Medio'
  }

  return 'Medio'
}

function extraerTitulo(texto: string): string {
  let t = texto.trim()

  // Quitar prefijos comunes
  t = t.replace(/^(tengo\s+que|necesito|debo|hay\s+que|quiero|voy\s+a|tengo\s+pendiente)\s+/i, '')
  t = t.replace(/^(crear|agregar|añadir|registrar|programar)\s+(una\s+|un\s+)?(tarea|recordatorio|alarma)\s+/i, '')
  t = t.replace(/\s+(para|antes\s+de|despu[ée]s\s+de)\s+.*$/i, '')
  t = t.replace(/\s+(urgente|importante|cr[ií]tico|superurgente|idea|opcional|baja|medio|alta)\s*/gi, '')
  t = t.replace(/\s+(hoy|mañana|pasado\s*mañana|en\s+\d+\s*(d[ií]as?|dias?|semanas?|mes(?:es)?))\s*/gi, '')
  t = t.replace(/\s+(ahora|ya|inmediatamente)\s*/gi, '')
  t = t.replace(/\s+a\s+las?\s+\d{1,2}(?::\d{2})?\s*(?:a\.?\s*m\.?|am|p\.?\s*m\.?|pm)?\s*/gi, '')
  t = t.replace(/\s+antes?\s+de\s+las?\s+\d{1,2}(?::\d{2})?\s*(?:a\.?\s*m\.?|am|p\.?\s*m\.?|pm)?\s*/gi, '')

  return t.charAt(0).toUpperCase() + t.slice(1)
}

export async function crearTareaLocal(texto: string, hijo_id?: string | null, es_personal?: boolean): Promise<{ titulo: string; tarea: any }> {
  const titulo = extraerTitulo(texto) || texto.trim().slice(0, 80)
  const fecha = extraerFecha(texto)
  const hora = extraerHora(texto)

  let fecha_vencimiento: string | null = null
  if (fecha) {
    if (hora) {
      fecha.setHours(hora.hora, hora.minuto, 0, 0)
    } else {
      fecha.setHours(23, 59, 0, 0)
    }
    if (fecha > new Date()) {
      fecha_vencimiento = fecha.toISOString()
    }
  } else if (hora) {
    const d = new Date()
    d.setHours(hora.hora, hora.minuto, 0, 0)
    if (d > new Date()) {
      fecha_vencimiento = d.toISOString()
    } else if (hora.hora === 0 && hora.minuto === 0) {
      d.setDate(d.getDate() + 1)
      fecha_vencimiento = d.toISOString()
    }
  } else {
    const finSemanaActual = finSemana(new Date())
    if (finSemanaActual > new Date()) {
      fecha_vencimiento = finSemanaActual.toISOString()
    }
  }

  const urgencia = extraerUrgencia(texto, fecha_vencimiento)

  const tarea = await crearTarea({
    texto_original: texto,
    texto_pulido: texto,
    titulo,
    descripcion: texto !== titulo ? texto : null,
    categoria: 'Tarea Pendiente',
    nivel_urgencia: urgencia,
    fecha_vencimiento,
    hijo_id: hijo_id ?? null,
    es_personal: es_personal ?? false,
  })

  return { titulo, tarea }
}
