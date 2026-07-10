import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Capacitor } from '@capacitor/core'

interface AvatarUploadProps {
  src: string | null
  initials: string
  initialsColor?: string
  size?: 'sm' | 'md' | 'lg'
  onUpload: (file: File) => Promise<void>
  uploading?: boolean
}

const sizeMap = {
  sm: { container: 'h-9 w-9', icon: 'h-9 w-9', text: 'text-xs', overlay: 'h-9 w-9', camIcon: 'h-3.5 w-3.5', spinner: 'h-3.5 w-3.5' },
  md: { container: 'h-16 w-16', icon: 'h-16 w-16', text: 'text-lg', overlay: 'h-16 w-16', camIcon: 'h-5 w-5', spinner: 'h-5 w-5' },
  lg: { container: 'h-20 w-20', icon: 'h-20 w-20', text: 'text-2xl', overlay: 'h-20 w-20', camIcon: 'h-5 w-5', spinner: 'h-5 w-5' },
}

export function AvatarUpload({ src, initials, initialsColor = 'from-vix-400 to-vix-600', size = 'md', onUpload, uploading }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localUploading, setLocalUploading] = useState(false)
  const dims = sizeMap[size]

  const handleClick = async () => {
    if (uploading || localUploading) return

    if (Capacitor.isNativePlatform()) {
      try {
        const { Camera } = await import('@capacitor/camera')
        const image = await Camera.getPhoto({
          quality: 80,
          resultType: 'Base64',
        })

        if (image?.base64String) {
          setLocalUploading(true)
          try {
            const byteChars = atob(image.base64String)
            const byteNums = new Array(byteChars.length)
            for (let i = 0; i < byteChars.length; i++) {
              byteNums[i] = byteChars.charCodeAt(i)
            }
            const blob = new Blob([new Uint8Array(byteNums)], { type: image.format || 'image/jpeg' })
            const file = new File([blob], `avatar-${Date.now()}.${image.format || 'jpg'}`, { type: image.format || 'image/jpeg' })
            await onUpload(file)
          } catch (e) {
            console.error('Error al procesar imagen:', e)
          } finally {
            setLocalUploading(false)
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.message?.includes('cancel')) return
        console.error('Error al abrir cámara/galería:', e)
        setLocalUploading(false)
      }
    } else {
      inputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLocalUploading(true)
    try {
      await onUpload(file)
    } catch (e) {
      console.error('Error al subir archivo:', e)
    } finally {
      setLocalUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isBusy = uploading || localUploading

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <button
        onClick={handleClick}
        disabled={isBusy}
        type="button"
        className={`group relative ${dims.container} overflow-hidden rounded-full disabled:opacity-70`}
      >
        {src ? (
          <img src={src} alt="" className={`${dims.icon} rounded-full border-4 border-white object-cover shadow-lg dark:border-gray-800`} />
        ) : (
          <div className={`${dims.icon} flex items-center justify-center rounded-full bg-gradient-to-br ${initialsColor} font-bold text-white shadow-lg ${dims.text}`}>
            {initials}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 transition-colors group-hover:bg-black/40">
          {isBusy ? (
            <Loader2 className={`${dims.spinner} animate-spin text-white`} />
          ) : (
            <Camera className={`${dims.camIcon} text-white opacity-70 transition-opacity group-hover:opacity-100`} />
          )}
        </div>
      </button>
    </>
  )
}
