import { supabase } from '@/integrations/supabase/client';

export interface ResendCredentialsData {
  email: string;
  full_name: string;
  role: string;
  user_id: string;
}

export interface ResendResult {
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

// Resend credentials to a single user
export const resendSingleUserCredentials = async (user: ResendCredentialsData): Promise<ResendResult> => {
  try {
    // Generate new temporary password
    const temporaryPassword = generateSecurePassword();
    
    // Send credentials email
    const { error: emailError } = await supabase.functions.invoke('send-user-credentials', {
      body: {
        email: user.email,
        fullName: user.full_name,
        temporaryPassword,
        role: user.role,
        requiresPasswordChange: true
      }
    });
    
    if (emailError) {
      return {
        success: false,
        email: user.email,
        full_name: user.full_name,
        error: `Error enviando email: ${emailError.message}`
      };
    }
    
    return {
      success: true,
      email: user.email,
      full_name: user.full_name,
      temporaryPassword
    };
    
  } catch (error: any) {
    return {
      success: false,
      email: user.email,
      full_name: user.full_name,
      error: `Error inesperado: ${error.message}`
    };
  }
};

export const resendCredentials = async (
  users: ResendCredentialsData[],
  onProgress?: (current: number, total: number, currentUser: string) => void
): Promise<ResendResult[]> => {
  const results: ResendResult[] = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    if (onProgress) {
      onProgress(i + 1, users.length, user.full_name);
    }
    
    const result = await resendSingleUserCredentials(user);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
};

// Filter users that are from Capittal team
export const getCapittalTeamUsers = (users: any[]): ResendCredentialsData[] => {
  return users
    .filter(user => user.email && user.email.endsWith('@capittal.es'))
    .map(user => ({
      email: user.email,
      full_name: user.full_name || user.email.split('@')[0],
      role: user.role,
      user_id: user.user_id
    }));
};