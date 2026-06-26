import { useState, useCallback, useRef, useEffect } from 'react'

type RecorderState = 'idle' | 'requesting' | 'recording' | 'denied' | 'unsupported'

function isNativePlatform(): boolean {
  try {
    return (window as any)?.Capacitor?.isNativePlatform?.() ?? false
  } catch {
    return false
  }
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>('idle')
  const [audioBase64, setAudioBase64] = useState<string | null>(null)
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm')
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const resolveRef = useRef<((value: { base64: string | null; mimeType: string } | null) => void) | null>(null)

  const isRecording = state === 'recording'

  useEffect(() => {
    return () => {
      mediaStream.current?.getTracks().forEach(t => t.stop())
      mediaStream.current = null
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop()
      }
      mediaRecorder.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setState('requesting')

      if (isNativePlatform()) {
        try {
          const { VoiceRecorder } = await import('capacitor-voice-recorder')
          const perm = await VoiceRecorder.requestAudioRecordingPermission()
          if ((perm as any)?.value === true) {
            await VoiceRecorder.startRecording()
            setState('recording')
            return
          }
          setState('denied')
          return
        } catch {
          setState('denied')
          return
        }
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setState('unsupported')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStream.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorder.current = recorder
      chunks.current = []
      resolveRef.current = null

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunks.current, { type: mime })
        const reader = new FileReader()
        reader.onloadend = () => {
          const b64 = (reader.result as string)?.split(',')[1] ?? null
          setAudioBase64(b64)
          setAudioMimeType(mime)
          chunks.current = []
          mediaStream.current?.getTracks().forEach(t => t.stop())
          mediaStream.current = null
          resolveRef.current?.({ base64: b64, mimeType: mime })
          resolveRef.current = null
        }
        reader.readAsDataURL(blob)
      }

      recorder.start()
      setState('recording')
    } catch {
      setState('denied')
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<{ base64: string | null; mimeType: string } | null> => {
    if (isNativePlatform()) {
      try {
        const { VoiceRecorder } = await import('capacitor-voice-recorder')
        const res = await VoiceRecorder.stopRecording()
        const b64 = (res as any)?.value?.recordDataBase64 ?? null
        if (b64) {
          setAudioBase64(b64)
          setAudioMimeType('audio/aac')
        }
        setState('idle')
        return b64 ? { base64: b64, mimeType: 'audio/aac' } : null
      } catch {
        setState('idle')
        return null
      }
    }

    const recorder = mediaRecorder.current
    if (!recorder || recorder.state === 'inactive') {
      setState('idle')
      return null
    }

    const promise = new Promise<{ base64: string | null; mimeType: string } | null>(resolve => {
      resolveRef.current = resolve
    })

    recorder.stop()
    mediaRecorder.current = null
    setState('idle')

    return promise
  }, [audioBase64])

  return { isRecording, audioBase64, audioMimeType, state, startRecording, stopRecording }
}
