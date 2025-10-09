-- Add section field to team_members for grouping
ALTER TABLE public.team_members 
ADD COLUMN section TEXT DEFAULT 'Equipo Principal';