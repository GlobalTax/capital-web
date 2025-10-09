-- Add contact fields to team_members table
ALTER TABLE public.team_members 
ADD COLUMN phone TEXT,
ADD COLUMN email TEXT,
ADD COLUMN linkedin_url TEXT;