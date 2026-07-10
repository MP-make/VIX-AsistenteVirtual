import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Loader2 } from 'lucide-react'
import { useVoiceRecorder } from '@/features/chat/hooks/use-voice-recorder'

interface ChatInputProps {
  onSend: (text: string) => Promise<void>
  isStreaming: boolean
  onAudioTranscriptReady?: (transcript: string) => void
}

export function ChatInput({ onSend, isStreaming, onAudioTranscriptReady }: ChatInputProps) {
  const [text, setText] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { startRecording } = useVoiceRecorder()

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
    setTranscribing(true)
    try {
      const transcript = await startRecording()
      if (transcript) {
        onAudioTranscriptReady?.(transcript)
      }
    } catch {
      onAudioTranscriptReady?.('')
    } finally {
      setTranscribing(false)
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white/95 backdrop-blur-lg dark:border-gray-800/30 dark:bg-header-warm">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-xs transition-all focus-within:border-vix-500/50 focus-within:bg-white dark:border-gray-700/40 dark:bg-white/5 dark:focus-within:border-vix-500/50 dark:focus-within:bg-white/[0.07]">
          <button
            onClick={handleMic}
            disabled={transcribing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Grabar audio"
          >
            {transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={transcribing ? 'Escuchando...' : 'Escribe lo que quieras...'}
            rows={1}
            disabled={isStreaming || transcribing}
            className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100 dark:placeholder-gray-500"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || isStreaming || transcribing}
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
