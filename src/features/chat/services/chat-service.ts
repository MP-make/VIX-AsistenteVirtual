import { supabase } from '@/config/supabase-client'
import type { ChatMessage, Tarea } from '@/types'

export interface ChatResponse {
  ok: boolean
  tipo: 'chat' | 'tarea'
  respuesta: string
  tarea: Tarea | null
}

export async function sendChatMessage(
  messages: Pick<ChatMessage, 'role' | 'content'>[]
): Promise<ChatResponse> {
  console.log('[sendChatMessage] INICIO', messages.length)

  const { data: { session } } = await supabase.auth.getSession()
  console.log('[sendChatMessage] session', !!session)

  if (!session?.user?.id) throw new Error('Usuario no autenticado')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const accessToken = session.access_token

  console.log('[sendChatMessage] supabaseUrl', supabaseUrl)
  console.log('[sendChatMessage] anonKey', !!anonKey)
  console.log('[sendChatMessage] accessToken', !!accessToken)

  if (!supabaseUrl) throw new Error('Falta VITE_SUPABASE_URL')
  if (!anonKey) throw new Error('Falta VITE_SUPABASE_ANON_KEY')
  if (!accessToken) throw new Error('Sesión sin access_token')

  console.log('[sendChatMessage] haciendo fetch')
  const res = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ messages, user_id: session.user.id }),
  })

  console.log('[sendChatMessage] status', res.status)

  const data = await res.json()
  console.log('[sendChatMessage] data', JSON.stringify(data))

  if (!res.ok) {
    throw new Error(data?.error ?? `Error HTTP ${res.status}`)
  }

  if (!data?.ok) throw new Error(data?.error ?? 'Error al procesar mensaje')

  return data as ChatResponse
}

export async function transcribirAudio(
  audioBase64: string,
  mimeType: string,
): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const res = await fetch(`${supabaseUrl}/functions/v1/transcribe-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
    },
    body: JSON.stringify({ audio_base64: audioBase64, mime_type: mimeType }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Error HTTP ${res.status}`)
  if (data.error) throw new Error(data.error)

  return data.transcript
}
