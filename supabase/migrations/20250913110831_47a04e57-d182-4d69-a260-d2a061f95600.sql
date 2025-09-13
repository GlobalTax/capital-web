-- Create trigger to send notifications on form_submissions inserts
DROP TRIGGER IF EXISTS trg_notify_form_submission ON public.form_submissions;
CREATE TRIGGER trg_notify_form_submission
AFTER INSERT ON public.form_submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_form_submission();