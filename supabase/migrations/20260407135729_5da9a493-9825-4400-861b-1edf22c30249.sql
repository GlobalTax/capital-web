
-- Make user_id nullable for anonymous visitors
ALTER TABLE public.buyer_preferences ALTER COLUMN user_id DROP NOT NULL;

-- Add contact fields
ALTER TABLE public.buyer_preferences 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT;

-- Allow anonymous inserts (visitors without account)
CREATE POLICY "Anyone can create buyer preferences"
ON public.buyer_preferences
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to read their own preferences
DROP POLICY IF EXISTS "Users can view own buyer preferences" ON public.buyer_preferences;
CREATE POLICY "Users can view own buyer preferences"
ON public.buyer_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own preferences  
DROP POLICY IF EXISTS "Users can update own buyer preferences" ON public.buyer_preferences;
CREATE POLICY "Users can update own buyer preferences"
ON public.buyer_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
