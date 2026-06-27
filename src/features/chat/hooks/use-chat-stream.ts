import { useState, useCallback } from 'react'
import { sendChatMessage } from '@/features/chat/services/chat-service'
import { crearTareaLocal } from '@/features/chat/services/local-task-parser'
import { scheduleTaskNotifications } from '@/features/notifications/notification-service'
import { obtenerTareas } from '@/features/dashboard/services/tasks-repository'
import type { ChatMessage, Tarea } from '@/types'

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true)
    setError(null)

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await sendChatMessage(history)
      let task: Tarea | undefined

      if (response.tipo === 'tarea' && response.tarea) {
        task = response.tarea
        const tareas = await obtenerTareas()
        scheduleTaskNotifications(tareas).catch(() => {})
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.respuesta,
        timestamp: new Date().toISOString(),
        task: task ? { ...task } : undefined,
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch {
      try {
        const { tarea } = await crearTareaLocal(text)
        const tareas = await obtenerTareas()
        scheduleTaskNotifications(tareas).catch(() => {})
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `✅ Tarea creada`,
          timestamp: new Date().toISOString(),
          task: tarea ? { ...tarea } : undefined,
        }
        setMessages(prev => [...prev, assistantMsg])
      } catch (fallbackErr) {
        const msg = fallbackErr instanceof Error ? fallbackErr.message : 'Error al crear tarea'
        setError(msg)
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${msg}`,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const sendAudioTranscript = useCallback(async (transcript: string) => {
    await sendMessage(transcript)
  }, [sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isStreaming: isLoading,
    isLoading,
    error,
    sendMessage,
    sendAudioTranscript,
    clearMessages,
  }
}
