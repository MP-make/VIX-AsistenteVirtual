export type CategoriaTarea = 'Dashboard' | 'Tarea Pendiente' | 'Idea' | 'Práctica Calificada' | 'Tesis';
export type UrgenciaTarea = 'Crítico' | 'Medio' | 'Baja' | 'Idea';

export interface ProcesarTareaRequest {
  texto_original: string;
  user_id: string;
  confirmed?: boolean;
  task_data?: TareaEstructurada;
}

export interface TareaEstructurada {
  titulo: string;
  descripcion: string | null;
  categoria: CategoriaTarea;
  nivel_urgencia: UrgenciaTarea;
  fecha_vencimiento: string | null;
  texto_pulido: string;
}

export interface ProcesarTareaResponse {
  ok: boolean;
  task?: TareaEstructurada;
  saved_task?: TareaGuardada;
  error?: string;
}

export interface TareaGuardada {
  id: string;
  user_id: string;
  texto_original: string;
  texto_pulido: string;
  titulo: string;
  descripcion: string | null;
  categoria: CategoriaTarea;
  nivel_urgencia: UrgenciaTarea;
  fecha_vencimiento: string | null;
  completada: boolean;
  creado_at: string;
}
