import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/layouts/parts/sidebar'
import { BottomNav } from '@/layouts/parts/bottom-nav'
import { ChatViewport } from '@/features/chat/components/chat-viewport'
import { ChatInput } from '@/features/chat/components/chat-input'
import { DashboardGrid } from '@/features/dashboard/components/dashboard-grid'
import { RealDashboard } from '@/features/dashboard/components/real-dashboard'
import { ProfilePage } from '@/features/profile/components/profile-page'
import { HijosPage } from '@/features/hijos/components/hijos-page'
import { useChatStream } from '@/features/chat/hooks/use-chat-stream'
import { useHijos } from '@/features/dashboard/hooks/use-hijos'
import { detectarHijo } from '@/utils/detect-hijo'
import { useAuth } from '@/context/auth-context'
import { MessageSquare, ListTodo, LayoutDashboard, User, Users } from 'lucide-react'

export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const isChat = pathname === '/chat'
  const isTareas = pathname === '/tareas'
  const isDashboard = pathname === '/dashboard'
  const isHijos = pathname === '/hijos'
  const isProfile = pathname === '/perfil'
  const isPadre = user?.tipo_usuario === 'padre'

  const chat = useChatStream()
  const { hijos } = useHijos()

  const handleChatSend = useCallback(async (text: string) => {
    if (isPadre) {
      const detectedHijo = detectarHijo(text, hijos)
      if (detectedHijo) {
        await chat.sendMessage(text, detectedHijo.id, false)
      } else {
        await chat.sendMessage(text, null, true)
      }
    } else {
      await chat.sendMessage(text, null, true)
    }
  }, [chat, hijos, isPadre])

  const activeClass = 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
  const inactiveClass = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'

  return (
    <div className="relative flex h-screen h-dvh bg-white text-gray-900 dark:text-white">
      <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block">
        <div className="absolute inset-0 bg-dark-warm" />
        <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-vix-600/10 to-transparent" />
      </div>
      <div className="relative z-10 flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex flex-1 flex-col min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 backdrop-blur-lg dark:border-gray-800/30 dark:bg-header-warm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.03)]">

          <div className="hidden lg:flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            <button
              onClick={() => navigate('/chat')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${isChat ? activeClass : inactiveClass}`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              onClick={() => navigate('/tareas')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${isTareas ? activeClass : inactiveClass}`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              Tareas
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${isDashboard ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Panel
            </button>
            <button
              onClick={() => navigate('/hijos')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${isHijos ? activeClass : inactiveClass}`}
            >
              <Users className="h-3.5 w-3.5" />
              Hijos
            </button>
            <button
              onClick={() => navigate('/perfil')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${isProfile ? activeClass : inactiveClass}`}
            >
              <User className="h-3.5 w-3.5" />
              Perfil
            </button>
          </div>
        </header>

        {isHijos ? (
          <HijosPage />
        ) : isProfile ? (
          <ProfilePage />
        ) : isDashboard ? (
          <RealDashboard />
        ) : isTareas ? (
          <DashboardGrid />
        ) : (
          <ChatViewport
            messages={chat.messages}
            isStreaming={chat.isStreaming}
          />
        )}

        {isChat && (
          <ChatInput
            onSend={handleChatSend}
            isStreaming={chat.isStreaming}
            onAudioTranscriptReady={(t) => {
              if (t.trim()) handleChatSend(t)
            }}
          />
        )}
      </main>
      </div>
      <BottomNav />
    </div>
  )
}
