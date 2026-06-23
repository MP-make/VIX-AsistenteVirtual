import type { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-br-sm bg-purple-600 text-white'
            : 'rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        {message.task && (
          <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/30">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              {message.task.titulo}
            </p>
            {message.task.descripcion && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {message.task.descripcion}
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-purple-200 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-800 dark:text-purple-200">
                {message.task.categoria}
              </span>
              <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200">
                {message.task.nivel_urgencia}
              </span>
            </div>
          </div>
        )}
        <p className="mt-1 text-right text-[10px] opacity-60">
          {new Date(message.timestamp).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
