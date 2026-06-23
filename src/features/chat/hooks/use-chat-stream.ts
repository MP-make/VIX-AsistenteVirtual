import { useState, useCallback } from 'react';
import { procesarTexto, confirmarTarea } from '@/features/chat/services/chat-service';
import type { ChatMessage } from '@/types';

interface UseChatStreamReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  confirmTask: (originalText: string, taskData: any) => Promise<void>;
  clearMessages: () => void;
}

export function useChatStream(): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    setIsStreaming(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const taskData = await procesarTexto(text);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `He procesado tu tarea. Confirma los detalles para guardarla.`,
        timestamp: new Date().toISOString(),
        task: {
          id: '',
          user_id: '',
          texto_original: text,
          texto_pulido: taskData.texto_pulido,
          titulo: taskData.titulo,
          descripcion: taskData.descripcion,
          categoria: taskData.categoria as any,
          nivel_urgencia: taskData.nivel_urgencia as any,
          fecha_vencimiento: taskData.fecha_vencimiento,
          completada: false,
          creado_at: new Date().toISOString(),
        },
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Error al procesar la tarea'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const confirmTask = useCallback(async (originalText: string, taskData: any) => {
    setIsStreaming(true);
    try {
      const saved = await confirmarTarea(originalText, taskData);
      const confirmMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `✅ Tarea guardada: "${saved.titulo}"`,
        timestamp: new Date().toISOString(),
        task: {
          id: saved.id,
          user_id: saved.user_id,
          texto_original: saved.texto_original,
          texto_pulido: saved.texto_pulido,
          titulo: saved.titulo,
          descripcion: saved.descripcion,
          categoria: saved.categoria as any,
          nivel_urgencia: saved.nivel_urgencia as any,
          fecha_vencimiento: saved.fecha_vencimiento,
          completada: saved.completada,
          creado_at: saved.creado_at,
        },
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error al guardar: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, sendMessage, confirmTask, clearMessages };
}
