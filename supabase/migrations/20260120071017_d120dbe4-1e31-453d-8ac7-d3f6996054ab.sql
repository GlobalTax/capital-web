-- Add versioning and approval columns to presentation_slides
ALTER TABLE public.presentation_slides 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' 
  CHECK (approval_status IN ('draft', 'pending_review', 'approved', 'locked'));

ALTER TABLE public.presentation_slides 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.presentation_slides 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

ALTER TABLE public.presentation_slides 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Add index for quick lookup of locked slides
CREATE INDEX IF NOT EXISTS idx_presentation_slides_approval 
ON public.presentation_slides(project_id, approval_status) 
WHERE approval_status IN ('approved', 'locked');