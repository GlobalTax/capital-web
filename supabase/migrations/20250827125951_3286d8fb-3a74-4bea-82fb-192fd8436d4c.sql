-- Add missing columns to admin_users table for credential management
ALTER TABLE public.admin_users 
ADD COLUMN needs_credentials boolean DEFAULT true,
ADD COLUMN credentials_sent_at timestamp with time zone;

-- Add comment for documentation
COMMENT ON COLUMN public.admin_users.needs_credentials IS 'Indicates if the user needs to receive login credentials';
COMMENT ON COLUMN public.admin_users.credentials_sent_at IS 'Timestamp when credentials were last sent to the user';