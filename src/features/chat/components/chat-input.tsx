import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Square, Sparkles, Loader2 } from 'lucide-react'
import { useVoiceRecorder } from '@/features/chat/hooks/use-voice-recorder'
import { AudioWave } from '@/components/shared/audio-wave'
import { transcribirAudio } from '@/features/chat/services/chat-service'

interface ChatInputProps {
  onSend: (text: string) => Promise<void>
  isStreaming: boolean
  onAudioTranscriptReady?: (transcript: string) => void
}

export function ChatInput({ onSend, isStreaming, onAudioTranscriptReady }: ChatInputProps) {
  const [text, setText] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder()

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }, [text])

  const handleSend = async () => {
    const val = text.trim()
    if (!val || isStreaming) return
    setText('')
    await onSend(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMic = async () => {
    if (isRecording) {
      const result = await stopRecording()
      if (!result?.base64 || !onAudioTranscriptReady) return

      setTranscribing(true)
      try {
        const transcript = await transcribirAudio(result.base64, result.mimeType)
        onAudioTranscriptReady(transcript)
      } catch {
        onAudioTranscriptReady('')
      } finally {
        setTranscribing(false)
      }
    } else {
      startRecording().catch(() => {})
    }
  }

  if (isRecording || transcribing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-vix-950 to-gray-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 h-80 w-80 animate-blob rounded-full bg-vix-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-blob rounded-full bg-vix-500/15 blur-3xl" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex items-center gap-2">
            {transcribing ? (
              <Loader2 className="h-4 w-4 animate-spin text-vix-400" />
            ) : (
              <Sparkles className="h-4 w-4 text-vix-400" />
            )}
            <span className="text-xs font-medium uppercase tracking-widest text-vix-400/80">
              {transcribing ? 'Transcribiendo audio...' : 'Grabando audio'}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <AudioWave isActive={isRecording} className="w-72 h-16" />
          </div>

          {isRecording && (
            <>
              <p className="text-center text-lg font-light text-gray-300">
                Sí, te escucho perfectamente.
                <br />
                <span className="text-gray-500">¿Qué tienes en mente hoy?</span>
              </p>

              <button
                onClick={handleMic}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-600 active:scale-90"
              >
                <Square className="h-5 w-5" />
              </button>

              <p className="text-xs text-gray-600">Toca para detener</p>
            </>
          )}

          {transcribing && (
            <p className="text-center text-sm text-gray-500">
              Procesando tu audio con Gemini...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 bg-white/95 backdrop-blur-lg dark:border-gray-800/30 dark:bg-header-warm">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-xs transition-all focus-within:border-vix-500/50 focus-within:bg-white dark:border-gray-700/40 dark:bg-white/5 dark:focus-within:border-vix-500/50 dark:focus-within:bg-white/[0.07]">
          <button
            onClick={handleMic}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Grabar audio"
          >
            <Mic className="h-4 w-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe lo que quieras..."
            rows={1}
            disabled={isStreaming}
            className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100 dark:placeholder-gray-500"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || isStreaming}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-vix-500 to-vix-700 text-white shadow-sm shadow-vix-500/20 transition-all hover:shadow-md hover:shadow-vix-500/30 active:scale-95 disabled:opacity-30 disabled:shadow-none"
            title="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
