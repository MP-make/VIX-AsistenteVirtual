import { supabase } from '@/config/supabase-client';
import type { Tarea } from '@/types';

const PUNTOS_POR_URGENCIA: Record<string, number> = {
  'Crítico': 30,
  'Medio': 20,
  'Baja': 10,
  'Idea': 5,
};

async function obtenerUserId(): Promise<string> {
  const { data: session } = await supabase.auth.getSession();
  const user_id = session?.session?.user?.id;
  if (!user_id) throw new Error('No autenticado');
  return user_id;
}

export async function obtenerTareas(): Promise<Tarea[]> {
  const user_id = await obtenerUserId();
  const { data, error } = await supabase
    .from('tareas')
    .select('*')
    .eq('user_id', user_id)
    .order('creado_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function crearTarea(tarea: Partial<Tarea> & { hijo_id?: string | null }): Promise<Tarea> {
  const user_id = await obtenerUserId();
  const { data, error } = await supabase
    .from('tareas')
    .insert({ ...tarea, user_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarTarea(id: string, cambios: Partial<Tarea>): Promise<Tarea> {
  const { data, error } = await supabase
    .from('tareas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleCompletada(id: string, completada: boolean): Promise<void> {
  const { data: tarea, error: fetchError } = await supabase
    .from('tareas')
    .select('user_id, nivel_urgencia, fecha_vencimiento')
    .eq('id', id)
    .single();
  if (fetchError) throw fetchError;
  if (!tarea) throw new Error('Tarea no encontrada');

  // No permitir desmarcar tareas vencidas
  if (!completada && tarea.fecha_vencimiento && new Date(tarea.fecha_vencimiento) < new Date()) {
    throw new Error('No se puede desmarcar una tarea vencida');
  }

  const { error } = await supabase.from('tareas').update({ completada }).eq('id', id);
  if (error) throw error;

  const puntos = PUNTOS_POR_URGENCIA[tarea.nivel_urgencia] ?? 10;

  await supabase.from('recompensas').insert({
    user_id: tarea.user_id,
    tarea_id: id,
    puntos: completada ? puntos : -puntos,
    accion: completada ? 'completar_tarea' : 'desmarcar_tarea',
  });
}

export async function eliminarTarea(id: string): Promise<void> {
  const { error } = await supabase.from('tareas').delete().eq('id', id);
  if (error) throw error;
}
