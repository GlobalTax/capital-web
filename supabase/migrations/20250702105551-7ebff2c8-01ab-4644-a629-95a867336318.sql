-- Ensure admin role enum has all necessary roles
DO $$ 
BEGIN
    -- Check if admin_role type exists and has all needed values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'editor', 'viewer');
    ELSE
        -- Add missing enum values if they don't exist
        BEGIN
            ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'super_admin';
            ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'viewer';
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if values already exist
            NULL;
        END;
    END IF;
END $$;

-- Add email column to admin_users for better user management
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_users_updated_at_trigger ON admin_users;
CREATE TRIGGER update_admin_users_updated_at_trigger
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Enhanced RLS policies for admin user management
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
CREATE POLICY "Super admins can manage all admin users"
ON admin_users
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users au 
        WHERE au.user_id = auth.uid() 
        AND au.role = 'super_admin'::admin_role 
        AND au.is_active = true
    )
);

DROP POLICY IF EXISTS "Admins can view and manage non-super admin users" ON admin_users;
CREATE POLICY "Admins can view and manage non-super admin users"
ON admin_users
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users au 
        WHERE au.user_id = auth.uid() 
        AND au.role IN ('admin'::admin_role, 'super_admin'::admin_role)
        AND au.is_active = true
    )
    AND (role != 'super_admin'::admin_role OR 
         EXISTS (SELECT 1 FROM admin_users au2 WHERE au2.user_id = auth.uid() AND au2.role = 'super_admin'::admin_role))
);