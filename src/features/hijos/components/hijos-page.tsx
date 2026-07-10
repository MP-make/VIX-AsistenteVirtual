import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase-client'
import { useAuth } from '@/context/auth-context'
import type { Hijo, Tarea } from '@/types'
import { Plus, Pencil, Trash2, X, Check, Loader2, Users, ListTodo, GraduationCap } from 'lucide-react'
import { AvatarUpload } from '@/components/shared/avatar-upload'
import { uploadAvatar, getInitials } from '@/services/upload-avatar'
import { useNavigate } from 'react-router-dom'

interface HijoConTareas extends Hijo {
  pendientes: number
  criticas: number
}

export function HijosPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hijos, setHijos] = useState<HijoConTareas[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre_completo: '', grado: '', edad: '' })
  const [apodos, setApodos] = useState<string[]>([])
  const [nuevoApodo, setNuevoApodo] = useState('')
  const [avatarUploadingId, setAvatarUploadingId] = useState<string | null>(null)

  const isPadre = user?.tipo_usuario === 'padre'

  useEffect(() => {
    if (!isPadre) {
      navigate('/chat', { replace: true })
      return
    }
    loadHijos()
  }, [user?.id, isPadre])

  const normalizeApodos = (raw: unknown): string[] => {
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'string' && raw) {
      try { const p = JSON.parse(raw); if (Array.isArray(p)) return p } catch {}
      return [raw]
    }
    return []
  }

  const loadHijos = async () => {
    if (!user) return
    setLoading(true)
    const [hijosRes, tareasRes] = await Promise.all([
      supabase.from('hijos').select('*').eq('padre_id', user.id).order('creado_at', { ascending: true }),
      supabase.from('tareas').select('hijo_id, completada, nivel_urgencia').eq('user_id', user.id),
    ])
    const tareas = (tareasRes.data ?? []) as Pick<Tarea, 'hijo_id' | 'completada' | 'nivel_urgencia'>[]
    if (hijosRes.data) {
      setHijos((hijosRes.data as any[]).map(h => {
        const localUrl = (() => { try { return localStorage.getItem(`hijo_avatar_${h.id}`) } catch { return null } })()
        return {
          ...h,
          apodos: normalizeApodos((h as any).apodo ?? (h as any).apodos ?? []),
          avatar_url: h.avatar_url ?? localUrl ?? null,
          pendientes: tareas.filter(t => t.hijo_id === h.id && !t.completada).length,
          criticas: tareas.filter(t => t.hijo_id === h.id && !t.completada && t.nivel_urgencia === 'Crítico').length,
        }
      }) as HijoConTareas[])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm({ nombre_completo: '', grado: '', edad: '' })
    setApodos([])
    setNuevoApodo('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (h: Hijo) => {
    setForm({
      nombre_completo: h.nombre_completo,
      grado: h.grado ?? '',
      edad: h.edad?.toString() ?? '',
    })
    setApodos(h.apodos)
    setEditingId(h.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!user || saving || !form.nombre_completo.trim()) return
    setSaving(true)
    const payload = {
      nombre_completo: form.nombre_completo.trim(),
      apodo: apodos.length > 0 ? JSON.stringify(apodos) : null,
      grado: form.grado.trim() || null,
      edad: form.edad ? parseInt(form.edad) : null,
    }
    try {
      if (editingId) {
        await supabase.from('hijos').update(payload).eq('id', editingId)
      } else {
        await supabase.from('hijos').insert({ ...payload, padre_id: user.id })
      }
      resetForm()
      loadHijos()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const agregarApodo = () => {
    const a = nuevoApodo.trim()
    if (a && !apodos.includes(a)) {
      setApodos(prev => [...prev, a])
    }
    setNuevoApodo('')
  }

  const quitarApodo = (idx: number) => {
    setApodos(prev => prev.filter((_, i) => i !== idx))
  }

  const handleChildAvatarUpload = async (hijoId: string, file: File) => {
    if (!user) return
    setAvatarUploadingId(hijoId)
    const url = await uploadAvatar(user.id, file, 'hijos')
    if (url) {
      try { localStorage.setItem(`hijo_avatar_${hijoId}`, url) } catch {}
      await supabase.from('hijos').update({ avatar_url: url }).eq('id', hijoId)
      setHijos(prev => prev.map(h => h.id === hijoId ? { ...h, avatar_url: url } : h))
    }
    setAvatarUploadingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este hijo? Las tareas asociadas quedarán sin asignar.')) return
    await supabase.from('hijos').delete().eq('id', id)
    loadHijos()
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-vix-500" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto min-h-full w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Hijos</h1>
            <p className="text-xs text-gray-400">Administra los perfiles de tus hijos</p>
          </div>
          {!showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-vix-500 px-3 py-2 text-sm font-medium text-white hover:bg-vix-600 transition-colors sm:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Añadir hijo</span>
            </button>
          )}
        </div>

        {/* Formulario de edición/creación */}
        {showForm && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {editingId ? 'Editar hijo' : 'Nuevo hijo'}
            </h3>
            <div className="space-y-4">
              {editingId && (() => {
                const editingHijo = hijos.find(h => h.id === editingId)
                if (!editingHijo) return null
                return (
                  <div className="flex justify-center">
                    <AvatarUpload
                      src={editingHijo.avatar_url}
                      initials={getInitials(editingHijo.nombre_completo)}
                      size="lg"
                      onUpload={(file) => handleChildAvatarUpload(editingHijo.id, file)}
                      uploading={avatarUploadingId === editingHijo.id}
                    />
                  </div>
                )
              })()}
              <input
                value={form.nombre_completo}
                onChange={(e) => setForm(prev => ({ ...prev, nombre_completo: e.target.value }))}
                placeholder="Nombre completo *"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-vix-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {apodos.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-vix-50 px-2.5 py-0.5 text-xs font-medium text-vix-700 dark:bg-vix-900/30 dark:text-vix-300">
                      {a}
                      <button onClick={() => quitarApodo(i)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={nuevoApodo}
                    onChange={(e) => setNuevoApodo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarApodo() } }}
                    placeholder="Apodos (apodos)"
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-vix-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={agregarApodo}
                    disabled={!nuevoApodo.trim()}
                    className="flex items-center gap-1 rounded-lg bg-vix-500 px-3 py-2.5 text-xs font-medium text-white hover:bg-vix-600 disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.grado}
                  onChange={(e) => setForm(prev => ({ ...prev, grado: e.target.value }))}
                  placeholder="Grado escolar"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-vix-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <input
                  value={form.edad}
                  onChange={(e) => setForm(prev => ({ ...prev, edad: e.target.value }))}
                  placeholder="Edad"
                  type="number"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-vix-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={resetForm}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.nombre_completo.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-vix-500 px-4 py-2 text-sm font-medium text-white hover:bg-vix-600 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {editingId ? 'Guardar cambios' : 'Añadir hijo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de hijos */}
        {hijos.length === 0 && !showForm ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <Users className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Aún no tienes hijos registrados</h2>
            <p className="text-sm text-gray-400">Añade a tus hijos para asignarles tareas y hacer seguimiento</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {hijos.map(h => (
              <div key={h.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-start gap-4">
                  {h.avatar_url ? (
                    <img src={h.avatar_url} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-xs" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-vix-400 to-vix-600 text-xl font-bold text-white shadow-xs">
                      {getInitials(h.nombre_completo)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {h.nombre_completo}
                    </h3>

                    {h.apodos.length > 0 && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {h.apodos.join(', ')}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                      {h.grado && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          <GraduationCap className="h-3 w-3" />
                          {h.grado}
                        </span>
                      )}
                      {h.edad && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {h.edad} años
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(h)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 rounded-lg bg-vix-50 px-3 py-1.5 dark:bg-vix-900/20">
                    <ListTodo className="h-3.5 w-3.5 text-vix-500" />
                    <span className="text-xs font-semibold text-vix-700 dark:text-vix-300">
                      {h.pendientes}
                    </span>
                    <span className="text-[10px] text-vix-500">pendientes</span>
                  </div>
                  {h.criticas > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 dark:bg-red-900/20">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        {h.criticas}
                      </span>
                      <span className="text-[10px] text-red-500">críticas</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
