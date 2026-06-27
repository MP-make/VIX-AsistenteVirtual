-- RPC function for client to safely increment puntos (bypasses RLS)
CREATE OR REPLACE FUNCTION public.sumar_puntos(p_user_id uuid, p_puntos integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usuarios SET puntos = COALESCE(puntos, 0) + p_puntos WHERE id = p_user_id;
END;
$$;

-- Recalculate puntos for existing users based on their rewards history
UPDATE public.usuarios u
SET puntos = s.total
FROM (
  SELECT user_id, COALESCE(SUM(puntos), 0) AS total
  FROM public.recompensas
  GROUP BY user_id
) s
WHERE u.id = s.user_id;
