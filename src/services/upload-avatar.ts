import { supabase } from '@/config/supabase-client'

export async function uploadAvatar(
  userId: string,
  file: File,
  folder: 'users' | 'hijos'
): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg'
  // Usamos una ruta única para evitar colisiones de caché en el dispositivo
  const fileName = `${folder}/${userId}/${Date.now()}.${ext}`

  try {
    // Al ser File una subclase de Blob, lo enviamos directamente.
    // Esto ahorra memoria RAM crítica en dispositivos móviles.
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (error) {
      console.error('Error de Supabase al subir avatar:', error.message, error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (err) {
    console.error('Excepción atrapada en uploadAvatar:', err)
    return null
  }
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}