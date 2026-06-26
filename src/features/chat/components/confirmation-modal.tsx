import { useEffect, useRef } from 'react'
import { X, Mic } from 'lucide-react'

interface ConfirmationModalProps {
  open: boolean
  transcript: string
  onTranscriptChange: (text: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationModal({
  open,
  transcript,
  onTranscriptChange,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [open])

  useEffect(() => {
    const el = textareaRef.current
    if (el && open) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 240) + 'px'
    }
  }, [transcript, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      <div className="animate-slide-up relative z-10 mx-4 w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vix-600/20">
              <Mic className="h-5 w-5 text-vix-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Transcripción de audio</h3>
              <p className="text-xs text-gray-500">
                Revisa y corrige el texto antes de enviarlo
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={e => onTranscriptChange(e.target.value)}
          placeholder="La transcripción aparecerá aquí..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 text-sm leading-relaxed text-gray-200 placeholder-gray-600 outline-none transition-colors focus:border-vix-600/50 focus:bg-gray-900"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!transcript.trim()}
            className="rounded-xl bg-gradient-to-r from-vix-500 to-vix-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-vix-500/20 transition-all hover:shadow-md hover:shadow-vix-500/30 active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            Enviar a VIX
          </button>
        </div>
      </div>
    </div>
  )
}
