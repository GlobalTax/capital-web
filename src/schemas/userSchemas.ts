import { z } from 'zod';

/**
 * Esquemas de validación Zod para gestión de usuarios
 * Centralizan todas las reglas de validación del sistema
 */

// Roles disponibles en el sistema
export const AdminRole = z.enum(['super_admin', 'admin', 'editor', 'viewer']);
export type AdminRoleType = z.infer<typeof AdminRole>;

// Validación de email
export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'El email es obligatorio')
  .max(254, 'El email es demasiado largo')
  .email('El email no tiene un formato válido')
  .refine(
    (email) => !email.includes('test') && !email.includes('fake'),
    'El email no puede contener palabras prohibidas'
  );

// Validación de nombre completo
export const FullNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre es demasiado largo')
  .refine(
    (name) => !name.toLowerCase().includes('test'),
    'El nombre no puede contener palabras prohibidas'
  );

// Validación de contraseña temporal (generada por el sistema)
export const TemporaryPasswordSchema = z
  .string()
  .min(12, 'La contraseña temporal debe tener al menos 12 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

// Schema para crear un nuevo usuario admin
export const CreateAdminUserSchema = z.object({
  email: EmailSchema,
  fullName: FullNameSchema,
  role: AdminRole,
});

export type CreateAdminUserInput = z.infer<typeof CreateAdminUserSchema>;

// Schema para actualizar un usuario admin
export const UpdateAdminUserSchema = z.object({
  email: EmailSchema.optional(),
  fullName: FullNameSchema.optional(),
  role: AdminRole.optional(),
  is_active: z.boolean().optional(),
  needs_credentials: z.boolean().optional(),
  credentials_sent_at: z.string().datetime().optional(),
});

export type UpdateAdminUserInput = z.infer<typeof UpdateAdminUserSchema>;

// Schema para datos de usuario admin completos
export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  email: EmailSchema.optional(),
  full_name: FullNameSchema.optional(),
  role: AdminRole,
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
  last_login: z.string().datetime().optional(),
  needs_credentials: z.boolean().optional(),
  credentials_sent_at: z.string().datetime().optional(),
});

export type AdminUserData = z.infer<typeof AdminUserSchema>;

// Schema para invitaciones de usuarios
export const UserInvitationSchema = z.object({
  email: EmailSchema,
  fullName: FullNameSchema,
  role: AdminRole,
  invitedBy: z.string().uuid(),
});

export type UserInvitationInput = z.infer<typeof UserInvitationSchema>;

// Schema para credenciales de usuario
export const UserCredentialsSchema = z.object({
  email: EmailSchema,
  fullName: FullNameSchema,
  temporaryPassword: TemporaryPasswordSchema,
  role: AdminRole,
  requiresPasswordChange: z.boolean().default(true),
});

export type UserCredentialsData = z.infer<typeof UserCredentialsSchema>;

/**
 * Función helper para validar y sanitizar datos de entrada
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      };
    }
    return {
      success: false,
      error: 'Error de validación desconocido',
    };
  }
}
