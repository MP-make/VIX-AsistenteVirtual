-- Add es_personal column to distinguish personal tasks from unassigned ones
ALTER TABLE public.tareas ADD COLUMN IF NOT EXISTS es_personal boolean DEFAULT false;
