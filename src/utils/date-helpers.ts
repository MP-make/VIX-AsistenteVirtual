export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Sin fecha'
  return new Date(iso).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Lima',
  })
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Lima',
  })
}

export function isOverdue(iso: string | null | undefined): boolean {
  if (!iso) return false
  return new Date(iso) < new Date()
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}
