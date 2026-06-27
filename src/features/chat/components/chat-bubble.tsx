import { useState } from 'react'
import { Brain, Clock, AlertTriangle, ChevronDown, ChevronUp, Bell } from 'lucide-react'
import type { ChatMessage } from '@/types'

const MAX_CHARS = 200

const PUNTOS_POR_URGENCIA: Record<string, number> = {
  Crítico: 30, Medio: 20, Baja: 10, Idea: 5,
}

function formatTiempoRestante(vencimiento: string | null): string {
  if (!vencimiento) return ''
  const diffMs = new Date(vencimiento).getTime() - Date.now()
  if (diffMs <= 0) return 'Vencida'
  const horas = Math.floor(diffMs / (1000 * 60 * 60))
  const min = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (horas > 0) return `${horas}h ${min}min`
  return `${min}min`
}

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const [expanded, setExpanded] = useState(false)
  const [taskExpanded, setTaskExpanded] = useState(false)
  const isLong = message.content.length > MAX_CHARS
  const displayText = isLong && !expanded ? message.content.slice(0, MAX_CHARS) + '...' : message.content

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-violet-500/20">
          <div className="absolute inset-0 animate-pulse rounded-xl bg-indigo-400/30" />
          <Brain className="relative h-4 w-4 text-white" />
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
            <div className={`mt-3 rounded-xl border p-3 ${
              isUser
                ? 'border-vix-500/30 bg-vix-500/20'
                : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60'
            }`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold ${isUser ? 'text-vix-100' : 'text-gray-800 dark:text-gray-100'}`}>
                  📌 {message.task.titulo}
                </p>
                <button
                  onClick={() => setTaskExpanded(!taskExpanded)}
                  className={`${isUser ? 'text-vix-200' : 'text-gray-400'}`}
                >
                  {taskExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isUser
                    ? 'bg-vix-500/30 text-vix-100'
                    : 'bg-vix-100 text-vix-700 dark:bg-vix-900/50 dark:text-vix-300'
                }`}>
                  {message.task.categoria}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  message.task.nivel_urgencia === 'Crítico'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                }`}>
                  {message.task.nivel_urgencia === 'Crítico' && <AlertTriangle className="h-3 w-3" />}
                  {message.task.nivel_urgencia}
                </span>
                {message.task.fecha_vencimiento && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isUser
                      ? 'bg-vix-500/30 text-vix-100'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {formatTiempoRestante(message.task.fecha_vencimiento)}
                  </span>
                )}
              </div>

              {taskExpanded && (
                <div className={`mt-2 space-y-1 border-t pt-2 ${
                  isUser ? 'border-vix-500/20' : 'border-gray-200 dark:border-gray-700'
                }`}>
                  {message.task.descripcion && (
                    <p className={`text-[10px] ${isUser ? 'text-vix-200/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      {message.task.descripcion}
                    </p>
                  )}
                  {message.task.fecha_vencimiento && (
                    <div className={`flex items-center gap-1 text-[10px] ${isUser ? 'text-vix-200/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Clock className="h-3 w-3" />
                      Límite: {new Date(message.task.fecha_vencimiento).toLocaleDateString('es-PE', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  )}
                  <div className={`flex items-center gap-1 text-[10px] ${isUser ? 'text-vix-200/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Bell className="h-3 w-3" />
                    +{PUNTOS_POR_URGENCIA[message.task.nivel_urgencia] ?? 10} pts al completar
                  </div>
                </div>
              )}
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
