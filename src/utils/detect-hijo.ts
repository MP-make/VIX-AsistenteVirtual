import type { Hijo } from '@/types'

export function detectarHijo(texto: string, hijos: Hijo[]): Hijo | null {
  if (!texto || hijos.length === 0) return null

  const lower = texto.toLowerCase()

  // 1. Apodo (coincidencia exacta dentro del texto)
  for (const hijo of hijos) {
    if (hijo.apodos?.length) {
      for (const apodo of hijo.apodos) {
        if (lower.includes(apodo.toLowerCase())) {
          return hijo
        }
      }
    }
  }

  // 2. Coincidencia por nombre completo: cada palabra del nombre
  let bestMatch: Hijo | null = null
  let bestScore = 0

  for (const hijo of hijos) {
    const nameParts = hijo.nombre_completo.toLowerCase().split(/\s+/)
    let score = 0
    for (const part of nameParts) {
      if (part.length > 1 && lower.includes(part)) {
        score++
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = hijo
    }
  }

  if (bestScore > 0) return bestMatch

  // 3. Patrón "hijo 1", "hijo 2" según orden de registro
  const hijoMatch = lower.match(/hijo\s+(\d+)/)
  if (hijoMatch) {
    const index = parseInt(hijoMatch[1]) - 1
    if (index >= 0 && index < hijos.length) {
      return hijos[index]
    }
  }

  return null
}
