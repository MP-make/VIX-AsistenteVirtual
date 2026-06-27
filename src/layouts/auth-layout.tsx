import { useAuth } from '@/context/auth-context'

export function AuthLayout() {
  const { signIn } = useAuth()

  return (
    <div className="flex min-h-screen min-h-dvh pb-safe">
      {/* Desktop: left half video */}
      <div className="hidden lg:relative lg:block lg:w-1/2 lg:overflow-hidden">
        <video
          src="/logindesktop.mp4"
          autoPlay
          muted
          playsInline
          poster="/login.png"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
      </div>

      {/* Right half: login form */}
      <div className="texture-marble relative flex flex-1 items-center justify-center p-4">
        {/* Blurred background objects for depth */}
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
          <div className="absolute bottom-16 right-12 h-40 w-32 rounded-xl bg-white/60 shadow-luxury backdrop-blur-sm rotate-6">
            <div className="flex h-full items-center justify-center">
              <div className="h-20 w-14 rounded border border-gray-200/60 bg-gray-50/40" />
            </div>
          </div>
          <div className="absolute top-20 left-8 h-36 w-24 rounded-lg bg-white/50 shadow-luxury backdrop-blur-sm -rotate-3">
            <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-gray-300/40" />
            <div className="mx-auto mt-3 h-16 w-16 rounded bg-gray-100/30" />
          </div>
          <div className="absolute top-1/3 right-8 h-24 w-6 -translate-y-1/2 rounded-full bg-white/40 shadow-luxury backdrop-blur-sm" />
        </div>

        {/* Mobile: full background video */}
        <div className="absolute inset-0 lg:hidden">
          <video
            src="/loginmobil.mp4"
            autoPlay
            muted
            playsInline
            poster="/login.png"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="animate-scale-in relative z-10 mx-auto w-full max-w-sm">
          <div className="shadow-luxury rounded-2xl border border-slate-100/80 bg-white/80 p-8 backdrop-blur-sm">
            <div className="mb-10 text-center">
              <img
                src="/logo.png"
                alt="VIX"
                className="mx-auto h-36 w-36 object-contain brightness-0"
                style={{ filter: 'brightness(0) opacity(0.75)' }}
              />
              <p className="mt-5 text-xs tracking-[0.15em] text-gray-500 uppercase">
                Tu asistente virtual de tareas inteligente
              </p>
            </div>

            <button
              onClick={signIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200/80 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-luxury-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:scale-[0.98]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>

            <p className="mt-8 text-center text-[11px] tracking-wide text-gray-400">
              Al continuar, aceptas nuestros términos de servicio
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
