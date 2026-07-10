import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/config/supabase-client'
import { useAuth } from '@/context/auth-context'
import type { Hijo } from '@/types'

function normalizeApodos(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw) {
    try { const p = JSON.parse(raw); if (Array.isArray(p)) return p } catch {}
    return [raw]
  }
  return []
}

export function useHijos() {
  const { user } = useAuth()
  const [hijos, setHijos] = useState<Hijo[]>([])
  const [loading, setLoading] = useState(false)
  const isPadre = user?.tipo_usuario === 'padre'

  const load = useCallback(async () => {
    if (!isPadre || !user) {
      setHijos([])
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('hijos')
      .select('*')
      .eq('padre_id', user.id)
      .order('creado_at', { ascending: true })
    if (data) {
      setHijos((data as any[]).map(h => ({
        ...h,
        apodos: normalizeApodos(h.apodo ?? h.apodos ?? []),
        avatar_url: h.avatar_url ?? null,
      })) as Hijo[])
    }
    setLoading(false)
  }, [isPadre, user])

  useEffect(() => { load() }, [load])

  return { hijos, loading, refresh: load }
}
