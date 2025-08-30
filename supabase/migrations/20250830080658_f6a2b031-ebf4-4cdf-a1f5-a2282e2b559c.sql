-- Update the admin user to fix credentials issue
UPDATE admin_users 
SET needs_credentials = false, is_active = true 
WHERE email = 's.navarro@obn.es';