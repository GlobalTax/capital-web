-- Eliminar trigger de notificación de form_submissions
DROP TRIGGER IF EXISTS on_form_submission ON public.form_submissions;

-- Eliminar función asociada al trigger
DROP FUNCTION IF EXISTS public.notify_form_submission() CASCADE;

-- Eliminar tabla form_submissions
DROP TABLE IF EXISTS public.form_submissions CASCADE;