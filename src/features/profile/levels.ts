export interface Nivel {
  id: number
  nombre: string
  titulo: string
  icono: string
  puntosMin: number
  color: string
}

export const NIVELES: Nivel[] = [
  { id: 1, nombre: 'Novato', titulo: 'Novato', icono: '🌱', puntosMin: 0, color: 'from-gray-400 to-gray-500' },
  { id: 2, nombre: 'Estudiante', titulo: 'Estudiante', icono: '📚', puntosMin: 50, color: 'from-blue-400 to-blue-600' },
  { id: 3, nombre: 'Profesor', titulo: 'Profesor', icono: '👨‍🏫', puntosMin: 150, color: 'from-violet-400 to-violet-600' },
  { id: 4, nombre: 'Maestro', titulo: 'Maestro', icono: '🎓', puntosMin: 350, color: 'from-amber-400 to-amber-600' },
  { id: 5, nombre: 'Doctor', titulo: 'Doctor', icono: '🏆', puntosMin: 700, color: 'from-rose-400 to-rose-600' },
  { id: 6, nombre: 'Sabio', titulo: 'Sabio', icono: '👑', puntosMin: 1200, color: 'from-purple-500 to-purple-700' },
]

export function obtenerNivel(puntos: number): Nivel {
  let nivel = NIVELES[0]
  for (const n of NIVELES) {
    if (puntos >= n.puntosMin) nivel = n
  }
  return nivel
}

export function obtenerSiguienteNivel(puntos: number): Nivel | null {
  for (const n of NIVELES) {
    if (puntos < n.puntosMin) return n
  }
  return null
}

export function obtenerProgresoNivel(puntos: number): { actual: Nivel; siguiente: Nivel | null; progreso: number } {
  const actual = obtenerNivel(puntos)
  const siguiente = obtenerSiguienteNivel(puntos)
  if (!siguiente) return { actual, siguiente: null, progreso: 1 }
  const rango = siguiente.puntosMin - actual.puntosMin
  const avance = puntos - actual.puntosMin
  return { actual, siguiente, progreso: Math.min(avance / rango, 1) }
}
