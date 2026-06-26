import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  ListTodo,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  onNavClick?: () => void
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const isChat = pathname === '/chat'
  const isTareas = pathname === '/tareas'
  const isDashboard = pathname === '/dashboard'

  const initials = user?.nombre
    ? user.nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <aside className="flex h-full flex-col border-r border-gray-200/80 bg-white dark:border-gray-800/30 dark:bg-surface-warm dark:shadow-[2px_0_12px_-4px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <img
          src="/logo.png"
          alt="VIX"
          className="h-9 w-9 brightness-0 dark:brightness-100"
        />
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">VIX</span>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Asistente inteligente</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Navegación
        </p>

        <button
          onClick={() => { navigate('/chat'); onNavClick?.() }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            isChat
              ? 'bg-vix-50 text-vix-700 dark:bg-vix-900/30 dark:text-vix-300'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Chat
          {isChat && (
            <span className="ml-auto flex h-5 items-center rounded-full bg-vix-200 px-2 text-[10px] font-medium text-vix-700 dark:bg-vix-800 dark:text-vix-300">
              nuevo
            </span>
          )}
        </button>

        <button
          onClick={() => { navigate('/tareas'); onNavClick?.() }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            isTareas
              ? 'bg-vix-50 text-vix-700 dark:bg-vix-900/30 dark:text-vix-300'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <ListTodo className="h-4 w-4" />
          Tareas
        </button>

        <button
          onClick={() => { navigate('/dashboard'); onNavClick?.() }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            isDashboard
              ? 'bg-vix-50 text-vix-700 dark:bg-vix-900/30 dark:text-vix-300'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Panel
        </button>
      </nav>

      <div className="border-t border-gray-100 px-3 py-3 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </button>

        <div className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-vix-400 to-vix-600 text-xs font-bold text-white shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {user?.nombre ?? 'Usuario'}
            </p>
            <p className="truncate text-xs text-gray-400 dark:text-gray-500">
              {user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800 dark:hover:text-red-400"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
