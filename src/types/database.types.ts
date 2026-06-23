export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          creado_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre?: string | null;
          creado_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nombre?: string | null;
          creado_at?: string;
        };
      };
      tareas: {
        Row: {
          id: string;
          user_id: string;
          texto_original: string;
          texto_pulido: string;
          titulo: string;
          descripcion: string | null;
          categoria: Database['public']['Enums']['categoria_tarea'];
          nivel_urgencia: Database['public']['Enums']['urgencia_tarea'];
          fecha_vencimiento: string | null;
          completada: boolean;
          creado_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          texto_original: string;
          texto_pulido: string;
          titulo: string;
          descripcion?: string | null;
          categoria?: Database['public']['Enums']['categoria_tarea'];
          nivel_urgencia?: Database['public']['Enums']['urgencia_tarea'];
          fecha_vencimiento?: string | null;
          completada?: boolean;
          creado_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          texto_original?: string;
          texto_pulido?: string;
          titulo?: string;
          descripcion?: string | null;
          categoria?: Database['public']['Enums']['categoria_tarea'];
          nivel_urgencia?: Database['public']['Enums']['urgencia_tarea'];
          fecha_vencimiento?: string | null;
          completada?: boolean;
          creado_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      categoria_tarea: 'Dashboard' | 'Tarea Pendiente' | 'Idea' | 'Práctica Calificada' | 'Tesis';
      urgencia_tarea: 'Crítico' | 'Medio' | 'Baja' | 'Idea';
    };
  };
}
