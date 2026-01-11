-- Añadir columna notes a las tablas de contactos que la necesitan

-- contact_leads
ALTER TABLE public.contact_leads
ADD COLUMN IF NOT EXISTS notes text;

-- general_contact_leads
ALTER TABLE public.general_contact_leads
ADD COLUMN IF NOT EXISTS notes text;

-- collaborator_applications
ALTER TABLE public.collaborator_applications
ADD COLUMN IF NOT EXISTS notes text;