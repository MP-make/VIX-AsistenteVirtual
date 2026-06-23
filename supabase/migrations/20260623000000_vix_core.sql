-- ============================================================================
-- VIX - Esquema de Base de Datos Core
-- Version: 20260623000000
-- ============================================================================

-- Enums personalizados para la clasificación del Asistente
CREATE TYPE public.categoria_tarea AS ENUM ('Dashboard', 'Tarea Pendiente', 'Idea', 'Práctica Calificada', 'Tesis');
CREATE TYPE public.urgencia_tarea AS ENUM ('Crítico', 'Medio', 'Baja', 'Idea');

-- Tabla de Usuarios (Sincronizada con auth.users de Supabase via Google OAuth2)
CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    email character varying NOT NULL,
    nombre character varying,
    creado_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla de Tareas
CREATE TABLE public.tareas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    texto_original text NOT NULL,
    texto_pulido text NOT NULL,
    titulo character varying NOT NULL,
    descripcion text,
    categoria public.categoria_tarea NOT NULL DEFAULT 'Tarea Pendiente'::categoria_tarea,
    nivel_urgencia public.urgencia_tarea NOT NULL DEFAULT 'Medio'::urgencia_tarea,
    fecha_vencimiento timestamp with time zone,
    completada boolean NOT NULL DEFAULT false,
    creado_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT tareas_pkey PRIMARY KEY (id),
    CONSTRAINT tareas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE
);

-- Índices quirúrgicos
CREATE INDEX idx_tareas_user_id ON public.tareas(user_id);
CREATE INDEX idx_tareas_filtros ON public.tareas(nivel_urgencia, categoria);
CREATE INDEX idx_tareas_vencimiento ON public.tareas(fecha_vencimiento) WHERE completada = FALSE;

-- === SEGURIDAD RLS ===

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "usuarios_select_own" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para tareas
CREATE POLICY "tareas_select_own" ON public.tareas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tareas_insert_own" ON public.tareas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tareas_update_own" ON public.tareas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tareas_delete_own" ON public.tareas
    FOR DELETE USING (auth.uid() = user_id);

-- === TRIGGERS ===

-- Sincronización de sesión: registrar usuarios nuevos de Google OAuth2
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nombre)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Alerta crítica instantánea: tarea con urgencia 'Crítico'
CREATE OR REPLACE FUNCTION public.check_critical_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    IF NEW.nivel_urgencia = 'Crítico'::public.urgencia_tarea THEN
        PERFORM
            net.http_post(
                url := CONCAT(current_setting('vault.supa_url', true), '/functions/v1/send-instant-email'),
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', CONCAT('Bearer ', current_setting('vault.service_key', true))
                ),
                body := jsonb_build_object(
                    'task_id', NEW.id,
                    'user_id', NEW.user_id,
                    'titulo', NEW.titulo,
                    'fecha_vencimiento', NEW.fecha_vencimiento
                )::text
            );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_critical_task_insert
    AFTER INSERT ON public.tareas
    FOR EACH ROW
    EXECUTE FUNCTION public.check_critical_task();

-- === CRON: Resumen diario 08:00 AM ===
SELECT cron.schedule(
    'vix-daily-summary-08am',
    '0 8 * * *',
    $$
    SELECT
        net.http_post(
            url := CONCAT(current_setting('vault.supa_url', true), '/functions/v1/daily-summary-cron'),
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', CONCAT('Bearer ', current_setting('vault.service_key', true))
            ),
            body := '{}'::text
        );
    $$
);
