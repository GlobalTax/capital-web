-- Create trigger to automatically update valuation activity and calculate status
CREATE TRIGGER update_company_valuation_activity
BEFORE INSERT OR UPDATE ON public.company_valuations
FOR EACH ROW
EXECUTE FUNCTION public.update_valuation_activity();