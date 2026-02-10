import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Mail, User, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateUserFormData {
  email: string;
  fullName: string;
  password: string;
  role: 'editor' | 'admin' | 'super_admin';
}

export const CreateUser: React.FC = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    fullName: '',
    password: '',
    role: 'editor'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const randomValues = new Uint32Array(16);
    crypto.getRandomValues(randomValues);
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(randomValues[i] % chars.length);
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleInputChange = (field: keyof CreateUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = async (): Promise<boolean> => {
    if (!formData.email || !formData.fullName || !formData.password) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El email no tiene un formato válido');
      return false;
    }

    // Enhanced password validation using Supabase function
    try {
      const { data: isValidPassword, error: validationError } = await supabase
        .rpc('validate_strong_password', { password_text: formData.password });
      
      if (validationError) {
        console.error('Error validando contraseña:', validationError);
        setError('Error al validar la contraseña');
        return false;
      }
      
      if (!isValidPassword) {
        setError(
          'La contraseña debe tener al menos 12 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales. No puede ser una contraseña común.'
        );
        return false;
      }
    } catch (error) {
      console.error('Error en validación de contraseña:', error);
      setError('Error al validar la contraseña');
      return false;
    }

    return true;
  };

  const createUser = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);
    setError('');

    try {
      // Normalize data before sending
      const email = formData.email.trim().toLowerCase();
      const fullName = formData.fullName.trim();
      const role = formData.role;

      if (!email || !fullName) {
        setError("Email y nombre completo son obligatorios");
        setIsLoading(false);
        return;
      }

      console.log('🔵 Creando usuario vía Edge Function:', email);
      
      // Get current session and token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      console.log('🔑 Token presente:', !!session.access_token);
      
      // Call the secure Edge Function to create user with normalized data
      const { data: userData, error: createError } = await supabase.functions.invoke(
        'admin-create-user',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: {
            email,
            fullName,
            role
          }
        }
      );

if (createError) {
  console.error('🔴 Error en Edge Function:', createError);
  let errorMsg = typeof createError === 'object' && createError !== null
    ? (createError as any).message || (createError as any).details || JSON.stringify(createError)
    : String(createError);
  // Intentar extraer detalles del cuerpo de la respuesta si está disponible
  try {
    const resp = (createError as any).context?.response;
    if (resp && typeof resp.text === 'function') {
      const text = await resp.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || parsed.message || errorMsg;
          if (parsed.field) errorMsg += ` (campo: ${parsed.field})`;
        } catch {
          errorMsg = text || errorMsg;
        }
      }
    }
  } catch {}
  throw new Error(errorMsg);
}

      if (!userData || !userData.success) {
        console.error('🔴 Respuesta inválida de Edge Function:', userData);
        throw new Error(userData?.error || 'No se recibieron datos del usuario creado');
      }

      const tempPassword = userData.temporary_password;
      console.log('✅ Usuario creado exitosamente:', {
        userId: userData.user_id,
        email: userData.email,
        requiresPasswordChange: userData.requires_password_change
      });

      // Send credentials via email using existing edge function
      console.log('📧 Enviando credenciales por email...');
      try {
        const { error: emailError } = await supabase.functions.invoke(
          'send-user-credentials',
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            body: {
              email: formData.email,
              fullName: formData.fullName,
              temporaryPassword: tempPassword,
              role: formData.role,
              requiresPasswordChange: true
            }
          }
        );

        if (emailError) {
          console.error('⚠️ Error enviando email:', emailError);
          toast({
            title: "Usuario creado",
            description: `Credenciales: ${tempPassword.substring(0, 4)}...${tempPassword.substring(tempPassword.length - 4)} (email falló)`,
            variant: "destructive",
          });
        } else {
          console.log('✅ Email de credenciales enviado exitosamente');
        }
      } catch (emailErr) {
        console.error('⚠️ Excepción enviando email:', emailErr);
        // Don't throw - user was created successfully
      }

      // Reset form and close modal
      setFormData({
        email: '',
        fullName: '',
        password: '',
        role: 'editor'
      });
      setSuccess(true);
      
      toast({
        title: "Usuario creado exitosamente",
        description: "Usuario creado con privilegios de administrador y credenciales enviadas por email",
      });

      // Close modal after short delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      console.error('🔴 Error crítico creando usuario:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        stack: err.stack
      });

      let errorMessage = err.message || 'Error desconocido al crear el usuario';
      
      // Mensajes de error mejorados
      if (errorMessage.includes('email')) {
        errorMessage = `Error de validación de email: ${errorMessage}. Verifica la configuración de Supabase Auth.`;
      }

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Crear Nuevo Usuario
          </DialogTitle>
          <DialogDescription>
            Crea una nueva cuenta de usuario. Se enviarán las credenciales por email.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Usuario creado exitosamente! Se han enviado las credenciales por email.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Nombre y apellidos"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña temporal</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="text"
                  placeholder="Contraseña temporal"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                disabled={isLoading}
                className="px-3"
              >
                <Shield className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Genera contraseña segura (16+ caracteres). Debe incluir mayúsculas, minúsculas, números y símbolos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol de usuario</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor - Acceso básico</SelectItem>
                <SelectItem value="admin">Admin - Gestión completa</SelectItem>
                <SelectItem value="super_admin">Super Admin - Control total</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={createUser}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Usuario
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};