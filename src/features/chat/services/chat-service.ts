import { supabase } from '@/config/supabase-client';

export interface TareaEstructurada {
  titulo: string;
  descripcion: string | null;
  categoria: string;
  nivel_urgencia: string;
  fecha_vencimiento: string | null;
  texto_pulido: string;
}

export interface TareaGuardada {
  id: string;
  user_id: string;
  texto_original: string;
  texto_pulido: string;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  nivel_urgencia: string;
  fecha_vencimiento: string | null;
  completada: boolean;
  creado_at: string;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-task`;

export async function procesarTexto(textoOriginal: string): Promise<TareaEstructurada> {
  const { data: session } = await supabase.auth.getSession();
  const user_id = session?.session?.user?.id;

  if (!user_id) {
    throw new Error('Usuario no autenticado');
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify({ texto_original: textoOriginal, user_id }),
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error ?? 'Error al procesar la tarea');
  }

  return result.task as TareaEstructurada;
}

export async function confirmarTarea(
  textoOriginal: string,
  taskData: TareaEstructurada,
): Promise<TareaGuardada> {
  const { data: session } = await supabase.auth.getSession();
  const user_id = session?.session?.user?.id;

  if (!user_id) {
    throw new Error('Usuario no autenticado');
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify({
      texto_original: textoOriginal,
      user_id,
      confirmed: true,
      task_data: taskData,
    }),
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error ?? 'Error al guardar la tarea');
  }

  return result.saved_task as TareaGuardada;
}
