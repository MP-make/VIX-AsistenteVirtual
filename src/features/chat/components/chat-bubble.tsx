import { useState } from 'react'
import { Sparkles, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import type { ChatMessage } from '@/types'

const MAX_CHARS = 200

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const [expanded, setExpanded] = useState(false)
  const isLong = message.content.length > MAX_CHARS
  const displayText = isLong && !expanded ? message.content.slice(0, MAX_CHARS) + '...' : message.content

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-vix-500 to-vix-700 shadow-sm shadow-vix-500/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={`group max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-vix-600 text-white'
              : 'rounded-tl-sm bg-gray-100 text-gray-800 ring-1 ring-gray-200 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{displayText}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                isUser ? 'text-vix-200' : 'text-vix-600 dark:text-vix-400'
              }`}
            >
              {expanded ? <>Ver menos <ChevronUp className="h-3 w-3" /></> : <>Ver más <ChevronDown className="h-3 w-3" /></>}
            </button>
          )}

          {message.task && (
            <div
              className={`mt-3 space-y-2 rounded-xl border p-3 ${
                isUser
                  ? 'border-vix-500/30 bg-vix-500/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60'
              }`}
            >
              <p className={`text-xs font-semibold ${isUser ? 'text-vix-100' : 'text-gray-800 dark:text-gray-100'}`}>
                {message.task.titulo}
              </p>
              {message.task.descripcion && (
                <p className={`text-xs ${isUser ? 'text-vix-200/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {message.task.descripcion}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {message.task.fecha_vencimiento && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <Clock className="h-3 w-3" />
                    {new Date(message.task.fecha_vencimiento).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-vix-100 px-2 py-0.5 text-[10px] font-medium text-vix-700 dark:bg-vix-900/50 dark:text-vix-300">
                  {message.task.categoria}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {message.task.nivel_urgencia === 'Crítico' && (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {message.task.nivel_urgencia}
                </span>
              </div>
            </div>
          )}
        </div>

        <p
          className={`mt-1 px-1 text-[10px] text-gray-600 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
