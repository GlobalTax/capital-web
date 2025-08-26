import { supabase } from '@/integrations/supabase/client';

export interface BulkUserData {
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
}

export interface BulkCreationResult {
  success: boolean;
  email: string;
  full_name: string;
  error?: string;
  temporaryPassword?: string;
}

// Generate secure temporary password
const generateSecurePassword = (): string => {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each required type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Extract name from email
const extractNameFromEmail = (email: string): string => {
  const username = email.split('@')[0];
  
  // Handle special cases
  const nameMap: Record<string, string> = {
    'albert': 'Albert',
    'ignasi': 'Ignasi',
    'marc': 'Marc',
    'marcc': 'Marc C',
    'mathias': 'Mathias',
    'pau': 'Pau',
    'pserra': 'P Serra',
    'samuel': 'Samuel',
    'lluis': 'Lluis'
  };
  
  return nameMap[username] || username.charAt(0).toUpperCase() + username.slice(1);
};

// Predefined user list from the image
export const CAPITTAL_USERS: BulkUserData[] = [
  { email: 'albert@capittal.es', full_name: 'Albert', role: 'admin' },
  { email: 'ignasi@capittal.es', full_name: 'Ignasi', role: 'admin' },
  { email: 'marc@capittal.es', full_name: 'Marc', role: 'admin' },
  { email: 'marcc@capittal.es', full_name: 'Marc C', role: 'admin' },
  { email: 'mathias@capittal.es', full_name: 'Mathias', role: 'admin' },
  { email: 'pau@capittal.es', full_name: 'Pau', role: 'admin' },
  { email: 'pserra@capittal.es', full_name: 'P Serra', role: 'admin' },
  { email: 'samuel@capittal.es', full_name: 'Samuel', role: 'admin' },
];

export const createBulkUsers = async (
  users: BulkUserData[],
  onProgress?: (current: number, total: number, currentUser: string) => void
): Promise<BulkCreationResult[]> => {
  const results: BulkCreationResult[] = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    if (onProgress) {
      onProgress(i + 1, users.length, user.full_name);
    }
    
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', user.email)
        .single();
      
      if (existingUsers) {
        results.push({
          success: false,
          email: user.email,
          full_name: user.full_name,
          error: 'Usuario ya existe'
        });
        continue;
      }
      
      // Generate temporary password
      const temporaryPassword = generateSecurePassword();
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: temporaryPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            full_name: user.full_name
          }
        }
      });
      
      if (authError) {
        results.push({
          success: false,
          email: user.email,
          full_name: user.full_name,
          error: `Error de autenticación: ${authError.message}`
        });
        continue;
      }
      
      if (!authData.user) {
        results.push({
          success: false,
          email: user.email,
          full_name: user.full_name,
          error: 'No se pudo crear el usuario de autenticación'
        });
        continue;
      }
      
      // Create admin user record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_active: true
        });
      
      if (adminError) {
        results.push({
          success: false,
          email: user.email,
          full_name: user.full_name,
          error: `Error creando registro admin: ${adminError.message}`
        });
        continue;
      }
      
      // Send credentials email
      try {
        await supabase.functions.invoke('send-user-credentials', {
          body: {
            email: user.email,
            fullName: user.full_name,
            temporaryPassword,
            role: user.role,
            requiresPasswordChange: true
          }
        });
      } catch (emailError) {
        console.warn('Error sending credentials email:', emailError);
        // Don't fail the user creation if email fails
      }
      
      results.push({
        success: true,
        email: user.email,
        full_name: user.full_name,
        temporaryPassword
      });
      
    } catch (error: any) {
      results.push({
        success: false,
        email: user.email,
        full_name: user.full_name,
        error: `Error inesperado: ${error.message}`
      });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
};