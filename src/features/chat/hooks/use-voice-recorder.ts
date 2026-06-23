import { useState, useCallback, useRef } from 'react';
import { VoiceRecorder } from 'capacitor-voice-recorder';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  audioBase64: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const hasPermission = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      if (!hasPermission.current) {
        const { result } = await VoiceRecorder.requestAudioRecordingPermission();
        if (result.value !== 'granted') {
          throw new Error('Permiso de micrófono denegado');
        }
        hasPermission.current = true;
      }

      await VoiceRecorder.startRecording();
      setIsRecording(true);
    } catch (err) {
      console.error('Error al iniciar grabación:', err);
      throw err;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      const { value } = await VoiceRecorder.stopRecording();
      setIsRecording(false);
      if (value?.recordDataBase64) {
        setAudioBase64(value.recordDataBase64);
        return value.recordDataBase64;
      }
      return null;
    } catch (err) {
      console.error('Error al detener grabación:', err);
      setIsRecording(false);
      return null;
    }
  }, []);

  return { isRecording, audioBase64, startRecording, stopRecording };
}
