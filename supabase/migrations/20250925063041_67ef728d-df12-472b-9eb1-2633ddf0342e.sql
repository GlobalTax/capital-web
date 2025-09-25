-- Add exclusive column to banners table
ALTER TABLE public.banners ADD COLUMN exclusive boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.banners.exclusive IS 'When true, this banner hides other banners on the same pages';