-- Tags system for contacts
CREATE TABLE public.contact_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tag assignments (many-to-many relationship)
CREATE TABLE public.contact_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_source TEXT NOT NULL, -- 'contact_lead' or 'apollo'
  tag_id UUID NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lists system for contacts
CREATE TABLE public.contact_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  list_type TEXT NOT NULL DEFAULT 'static', -- 'static' or 'dynamic'
  contact_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- List assignments (many-to-many relationship)
CREATE TABLE public.contact_list_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_source TEXT NOT NULL, -- 'contact_lead' or 'apollo'
  list_id UUID NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact segments (dynamic lists based on criteria)
CREATE TABLE public.contact_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  contact_count INTEGER DEFAULT 0,
  auto_update BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notes system for contacts
CREATE TABLE public.contact_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_source TEXT NOT NULL, -- 'contact_lead' or 'apollo'
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general', -- 'general', 'call', 'meeting', 'email'
  is_private BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks system for contacts
CREATE TABLE public.contact_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_source TEXT NOT NULL, -- 'contact_lead' or 'apollo'
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'call', -- 'call', 'email', 'meeting', 'follow_up'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_list_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_tags
CREATE POLICY "Admins can manage tags" ON public.contact_tags FOR ALL USING (current_user_is_admin());

-- RLS Policies for contact_tag_assignments
CREATE POLICY "Admins can manage tag assignments" ON public.contact_tag_assignments FOR ALL USING (current_user_is_admin());

-- RLS Policies for contact_lists
CREATE POLICY "Admins can manage contact lists" ON public.contact_lists FOR ALL USING (current_user_is_admin());

-- RLS Policies for contact_list_assignments
CREATE POLICY "Admins can manage list assignments" ON public.contact_list_assignments FOR ALL USING (current_user_is_admin());

-- RLS Policies for contact_segments
CREATE POLICY "Admins can manage segments" ON public.contact_segments FOR ALL USING (current_user_is_admin());

-- RLS Policies for contact_notes
CREATE POLICY "Admins can manage notes" ON public.contact_notes FOR ALL USING (current_user_is_admin());

-- RLS Policies for contact_tasks
CREATE POLICY "Admins can manage tasks" ON public.contact_tasks FOR ALL USING (current_user_is_admin());

-- Add foreign key constraints where appropriate
ALTER TABLE public.contact_tag_assignments 
ADD CONSTRAINT fk_tag_assignments_tag FOREIGN KEY (tag_id) REFERENCES public.contact_tags(id) ON DELETE CASCADE;

ALTER TABLE public.contact_list_assignments 
ADD CONSTRAINT fk_list_assignments_list FOREIGN KEY (list_id) REFERENCES public.contact_lists(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX idx_contact_tag_assignments_contact ON public.contact_tag_assignments(contact_id, contact_source);
CREATE INDEX idx_contact_tag_assignments_tag ON public.contact_tag_assignments(tag_id);
CREATE INDEX idx_contact_list_assignments_contact ON public.contact_list_assignments(contact_id, contact_source);
CREATE INDEX idx_contact_list_assignments_list ON public.contact_list_assignments(list_id);
CREATE INDEX idx_contact_notes_contact ON public.contact_notes(contact_id, contact_source);
CREATE INDEX idx_contact_tasks_contact ON public.contact_tasks(contact_id, contact_source);
CREATE INDEX idx_contact_tasks_status ON public.contact_tasks(status);
CREATE INDEX idx_contact_tasks_due_date ON public.contact_tasks(due_date);

-- Triggers to update counts
CREATE OR REPLACE FUNCTION public.update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_tags 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_tags 
    SET usage_count = usage_count - 1 
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_list_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_lists 
    SET contact_count = contact_count + 1 
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_lists 
    SET contact_count = contact_count - 1 
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_tag_usage_after_assignment
  AFTER INSERT OR DELETE ON public.contact_tag_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage_count();

CREATE TRIGGER update_list_count_after_assignment
  AFTER INSERT OR DELETE ON public.contact_list_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_list_contact_count();

-- Add updated_at triggers
CREATE TRIGGER update_contact_tags_updated_at
  BEFORE UPDATE ON public.contact_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_lists_updated_at
  BEFORE UPDATE ON public.contact_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_segments_updated_at
  BEFORE UPDATE ON public.contact_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_notes_updated_at
  BEFORE UPDATE ON public.contact_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_tasks_updated_at
  BEFORE UPDATE ON public.contact_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();