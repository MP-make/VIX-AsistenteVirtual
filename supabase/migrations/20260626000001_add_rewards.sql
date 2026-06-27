-- Add puntos column to usuarios
ALTER TABLE public.usuarios ADD COLUMN puntos integer NOT NULL DEFAULT 0;

-- Rewards history table
CREATE TABLE public.recompensas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tarea_id uuid REFERENCES public.tareas(id) ON DELETE SET NULL,
  puntos integer NOT NULL DEFAULT 0,
  accion text NOT NULL DEFAULT 'completar_tarea',
  creado_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT recompensas_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_recompensas_user_id ON public.recompensas(user_id);

ALTER TABLE public.recompensas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias recompensas"
  ON public.recompensas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propias recompensas"
  ON public.recompensas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to award points when a task is completed
CREATE OR REPLACE FUNCTION public.completar_tarea_con_puntos(tarea_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_puntos integer;
  v_urgencia public.urgencia_tarea;
BEGIN
  SELECT user_id, nivel_urgencia INTO v_user_id, v_urgencia
  FROM public.tareas WHERE id = tarea_id;

  v_puntos := CASE v_urgencia
    WHEN 'Crítico' THEN 30
    WHEN 'Medio' THEN 20
    WHEN 'Baja' THEN 10
    WHEN 'Idea' THEN 5
    ELSE 10
  END;

  UPDATE public.usuarios SET puntos = puntos + v_puntos WHERE id = v_user_id;

  INSERT INTO public.recompensas (user_id, tarea_id, puntos, accion)
  VALUES (v_user_id, tarea_id, v_puntos, 'completar_tarea');
END;
$$;
