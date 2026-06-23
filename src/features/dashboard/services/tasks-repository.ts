import { supabase } from '@/config/supabase-client';
import type { Tarea } from '@/types';

export async function obtenerTareas(): Promise<Tarea[]> {
  const { data: session } = await supabase.auth.getSession();
  const user_id = session?.session?.user?.id;
  if (!user_id) return [];

  const { data, error } = await supabase
    .from('tareas')
    .select('*')
    .eq('user_id', user_id)
    .order('creado_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function crearTarea(tarea: Partial<Tarea>): Promise<Tarea> {
  const { data: session } = await supabase.auth.getSession();
  const user_id = session?.session?.user?.id;
  if (!user_id) throw new Error('No autenticado');

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
  const { error } = await supabase
    .from('tareas')
    .update({ completada })
    .eq('id', id);

  if (error) throw error;
}

export async function eliminarTarea(id: string): Promise<void> {
  const { error } = await supabase
    .from('tareas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
