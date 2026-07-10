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
  const [transcript, setTranscript] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const nativeResolveRef = useRef<((value: string | null) => void) | null>(null)

  const isRecording = state === 'recording'

  useEffect(() => {
    if (transcript) {
      const t = transcript
      setTranscript(null)
      if (nativeResolveRef.current) {
        nativeResolveRef.current(t)
        nativeResolveRef.current = null
      }
    }
  }, [transcript])

  const startRecording = useCallback(() => {
    return new Promise<string | null>(async (resolve) => {
      try {
        setState('requesting')

        if (isNativePlatform()) {
          const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')

          const available = await SpeechRecognition.available()
          if (!available.available) {
            setState('unsupported')
            resolve(null)
            return
          }

          const perm = await SpeechRecognition.requestPermissions()
          if (perm.speechRecognition !== 'granted') {
            setState('denied')
            resolve(null)
            return
          }

          nativeResolveRef.current = resolve

          const promise = SpeechRecognition.start({
            language: 'es-MX',
            maxResults: 1,
            popup: true,
          })

          setState('recording')

          promise
            .then((result) => {
              const text = result?.matches?.[0] ?? null
              setTranscript(text)
            })
            .catch(() => {
              setTranscript(null)
            })
        } else {
          const SpeechRecognitionAPI =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          if (!SpeechRecognitionAPI) {
            setState('unsupported')
            resolve(null)
            return
          }

          const recognition = new SpeechRecognitionAPI()
          recognition.lang = 'es-MX'
          recognition.continuous = false
          recognition.interimResults = false
          recognition.maxAlternatives = 1

          recognitionRef.current = recognition

          let done = false

          recognition.onresult = (event: any) => {
            if (!done) {
              done = true
              resolve(event.results[0][0].transcript)
            }
          }

          recognition.onerror = () => {
            if (!done) {
              done = true
              resolve(null)
            }
            setState('idle')
          }

          recognition.onend = () => {
            if (!done) {
              done = true
              resolve(null)
            }
            setState('idle')
          }

          recognition.start()
          setState('recording')
        }
      } catch {
        setState('denied')
        resolve(null)
      }
    })
  }, [])

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (isNativePlatform()) {
      if (nativeResolveRef.current) {
        nativeResolveRef.current(null)
        nativeResolveRef.current = null
      }
    }

    recognitionRef.current?.stop()
    recognitionRef.current = null

    setState('idle')
    return null
  }, [])

  return { isRecording, state, startRecording, stopRecording }
}
