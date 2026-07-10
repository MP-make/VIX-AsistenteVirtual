import { useState, useEffect } from 'react'
import { Brain, Lock, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react'
import { getGeminiApiKey, setGeminiApiKey, clearGeminiApiKey } from '@/lib/gemini'

const SECRET_CODE = '020604'

export function GeminiSettings() {
  const [locked, setLocked] = useState(true)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [apiKey, setApiKey] = useState(getGeminiApiKey() ?? '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasKey, setHasKey] = useState(!!getGeminiApiKey())

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000)
      return () => clearTimeout(t)
    }
  }, [saved])

  const handleUnlock = () => {
    if (code === SECRET_CODE) {
      setLocked(false)
      setCodeError(false)
      setCode('')
    } else {
      setCodeError(true)
    }
  }

  const handleCodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUnlock()
  }

  const handleSave = () => {
    if (apiKey.trim()) {
      setGeminiApiKey(apiKey.trim())
      setHasKey(true)
    } else {
      clearGeminiApiKey()
      setHasKey(false)
    }
    setSaved(true)
  }

  const handleClear = () => {
    clearGeminiApiKey()
    setApiKey('')
    setHasKey(false)
    setSaved(true)
  }

  if (locked) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">IA</h2>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vix-100 dark:bg-vix-900/30">
              <Brain className="h-4 w-4 text-vix-600 dark:text-vix-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Configuración de IA</p>
              <p className="text-xs text-gray-400">
                {hasKey ? 'API key configurada' : 'Activar Gemini'}
              </p>
            </div>
            {hasKey && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"><Check className="h-3 w-3 text-emerald-600" /></div>}
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <Lock className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                value={code}
                onChange={e => { setCode(e.target.value); setCodeError(false) }}
                onKeyDown={handleCodeKeyDown}
                type="password"
                placeholder="Código secreto"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
              />
            </div>
            {codeError && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle className="h-3 w-3" />
                Código incorrecto
              </p>
            )}
            <button
              onClick={handleUnlock}
              disabled={!code.trim()}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-vix-500 px-3 py-2 text-xs font-medium text-white hover:bg-vix-600 disabled:opacity-50"
            >
              Desbloquear
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-vix-600" />
            API Key de Gemini
          </span>
        </h2>
      </div>
      <div className="space-y-3 px-5 py-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Ingresa tu API key de Google Gemini para activar la IA en el chat.
          Sin una API key, las tareas se crearán con la lógica local básica.
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <input
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            type={showKey ? 'text' : 'password'}
            placeholder="AIzaSy..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
          />
          <button onClick={() => setShowKey(!showKey)} className="shrink-0 text-gray-400 hover:text-gray-600">
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-vix-500 px-4 py-2 text-xs font-medium text-white hover:bg-vix-600"
          >
            {saved ? <><Check className="h-3.5 w-3.5" /> Guardado</> : <><Check className="h-3.5 w-3.5" /> Guardar</>}
          </button>
          {hasKey && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <X className="h-3.5 w-3.5" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
