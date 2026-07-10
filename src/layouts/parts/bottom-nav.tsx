import { useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, ListTodo, LayoutDashboard, User, Users } from 'lucide-react'

const tabs = [
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/tareas', label: 'Tareas', icon: ListTodo },
  { path: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { path: '/hijos', label: 'Hijos', icon: Users },
  { path: '/perfil', label: 'Perfil', icon: User },
] as const

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  const activeIndex = tabs.findIndex((t) => t.path === pathname)
  const safeIndex = activeIndex === -1 ? 0 : activeIndex

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200/80 bg-white/90 backdrop-blur-2xl pb-safe lg:hidden dark:border-gray-800/30 dark:bg-gray-950/90">
      <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-11 rounded-2xl bg-gradient-to-r from-vix-500 via-vix-400 to-vix-500 shadow-lg shadow-vix-500/30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:from-vix-600 dark:via-vix-500 dark:to-vix-600"
          style={{
            width: `calc(${100 / tabs.length}% - 8px)`,
            left: `calc(${safeIndex * (100 / tabs.length)}% + 4px)`,
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -inset-4 animate-[liquid-wave_4s_ease-in-out_infinite] bg-gradient-to-r from-white/20 via-transparent to-white/10" />
          </div>
        </div>

        {tabs.map((tab, i) => {
          const Icon = tab.icon
          const isActive = i === safeIndex
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 h-full transition-colors"
            >
              <Icon
                className={`h-5 w-5 transition-all duration-300 ${
                  isActive
                    ? 'text-white drop-shadow-sm'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
