export type CategoriaTarea = 'Dashboard' | 'Tarea Pendiente' | 'Idea' | 'Práctica Calificada' | 'Tesis';
export type UrgenciaTarea = 'Crítico' | 'Medio' | 'Baja' | 'Idea';

export interface Usuario {
  id: string;
  email: string;
  nombre: string | null;
  puntos: number;
  creado_at: string;
}

export interface Recompensa {
  id: string;
  user_id: string;
  tarea_id: string | null;
  puntos: number;
  accion: string;
  creado_at: string;
}

export interface Tarea {
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  task?: Tarea;
}

export interface AuthState {
  user: Usuario | null;
  session: unknown | null;
  loading: boolean;
}
