/**
 * DEPRECATED: These functions are disabled for security reasons.
 * Admin user creation must go through the admin-create-user edge function
 * which enforces super_admin role verification and rate limiting.
 */

export const ensureCurrentUserIsAdmin = async (): Promise<boolean> => {
  console.warn('[adminSetup] ensureCurrentUserIsAdmin is disabled for security. Use admin panel instead.');
  return false;
};

export const debugAdminStatus = async (): Promise<void> => {
  console.warn('[adminSetup] debugAdminStatus is disabled for security.');
};
