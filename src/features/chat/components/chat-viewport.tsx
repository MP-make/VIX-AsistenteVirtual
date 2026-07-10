import { useEffect, useRef } from 'react'
import { ChatBubble } from '@/features/chat/components/chat-bubble'
import { Brain } from 'lucide-react'
import type { ChatMessage } from '@/types'

interface ChatViewportProps {
  messages: ChatMessage[]
  isStreaming: boolean
}

export function ChatViewport({
  messages,
  isStreaming,
}: ChatViewportProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-3xl bg-indigo-500/25" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-violet-500/30">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="bg-gradient-to-r from-vix-300 to-vix-100 bg-clip-text text-2xl font-semibold text-transparent">
                ¿En qué puedo ayudarte?
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Pregúntame lo que sea o descríbeme una tarea. Yo me encargo.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Ensayar exposición',
                'Comprar regalo cumpleaños',
                'Terminar tesis capítulo 3',
              ].map((hint: string) => (
                <button
                  key={hint}
                  className="rounded-full border border-gray-200 bg-gray-100 px-3.5 py-2 text-xs text-gray-500 shadow-xs transition-all hover:border-vix-500 hover:text-vix-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400 dark:hover:border-vix-600 dark:hover:text-vix-300"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5 py-6">
          {messages.map((msg: ChatMessage, i: number) => (
            <div
              key={msg.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ChatBubble message={msg} />
            </div>
          ))}
        </div>

        {isStreaming && (
          <div className="flex items-start gap-3 pb-6">
            <img
              src="/logo.png"
              alt="VIX"
              className="h-8 w-8 brightness-0 dark:brightness-100"
            />
            <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-900/60">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-vix-400" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-vix-400" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-vix-400" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
