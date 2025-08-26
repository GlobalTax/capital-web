-- Create storage bucket for admin videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-videos', 'admin-videos', false);

-- Create storage policies for admin videos
CREATE POLICY "Admins can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'admin-videos' AND auth.uid() IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
));

CREATE POLICY "Admins can view videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'admin-videos' AND (
  auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true)
  OR auth.role() = 'service_role'
));

CREATE POLICY "Admins can update videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'admin-videos' AND auth.uid() IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
));

CREATE POLICY "Admins can delete videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'admin-videos' AND auth.uid() IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
));

-- Create admin_videos table for metadata
CREATE TABLE public.admin_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'general',
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  file_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_locations TEXT[] DEFAULT ARRAY['general'],
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_videos
ALTER TABLE public.admin_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_videos
CREATE POLICY "Admins can manage videos" 
ON public.admin_videos 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
));

CREATE POLICY "Anyone can view active videos for display" 
ON public.admin_videos 
FOR SELECT 
USING (is_active = true);

-- Create trigger to update updated_at
CREATE TRIGGER update_admin_videos_updated_at
BEFORE UPDATE ON public.admin_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();