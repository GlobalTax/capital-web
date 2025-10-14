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
    let password = '';
    // Generate 16 character password for enhanced security
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
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
      console.log('🔵 Iniciando creación de usuario:', {
        email: formData.email,
        role: formData.role,
        timestamp: new Date().toISOString()
      });

      // Intentar primero con la función estándar
      let result = await supabase.rpc('create_temporary_user', {
        p_email: formData.email,
        p_full_name: formData.fullName,
        p_role: formData.role
      });

      // Si falla con error de email inválido, intentar bypass
      if (result.error) {
        console.error('🔴 Error RPC create_temporary_user:', {
          message: result.error.message,
          code: result.error.code,
          details: result.error.details,
          hint: result.error.hint
        });

        // Detectar si es error de validación de dominio de email
        const isEmailDomainError = 
          result.error.message?.toLowerCase().includes('email') &&
          (result.error.message?.toLowerCase().includes('invalid') ||
           result.error.message?.toLowerCase().includes('inválido'));

        if (isEmailDomainError) {
          console.warn('⚠️ Dominio de email rechazado por Supabase Auth. Usando bypass...');
          
          // Intentar con bypass
          result = await supabase.rpc('create_temporary_user_bypass', {
            p_email: formData.email,
            p_full_name: formData.fullName,
            p_role: formData.role
          });

          if (result.error) {
            console.error('🔴 Error RPC create_temporary_user_bypass:', {
              message: result.error.message,
              code: result.error.code,
              details: result.error.details,
              hint: result.error.hint
            });
            throw result.error;
          }

          console.log('✅ Usuario creado con bypass exitosamente');
        } else {
          throw result.error;
        }
      } else {
        console.log('✅ Usuario creado con método estándar exitosamente');
      }

      // Type assertion for the returned data
      const userData = result.data as {
        user_id: string;
        email: string;
        temporary_password: string;
        requires_password_change: boolean;
        method?: string;
      };

      console.log('📧 Enviando credenciales por email...');

      // Send credentials via secure email
      const { error: emailError } = await supabase.functions.invoke('send-user-credentials', {
        body: {
          email: userData.email,
          fullName: formData.fullName,
          temporaryPassword: userData.temporary_password,
          role: formData.role,
          requiresPasswordChange: userData.requires_password_change
        }
      });

      if (emailError) {
        console.error('🔴 Error enviando email:', emailError);
        toast({
          title: "Usuario preparado",
          description: `Usuario creado pero no se pudo enviar el email. Credenciales temporales: ${userData.temporary_password}`,
          variant: "destructive",
        });
      } else {
        console.log('✅ Email enviado exitosamente');
        const methodUsed = userData.method === 'bypass' 
          ? ' (método bypass usado debido a validación de dominio)'
          : '';
        
        toast({
          title: "Usuario creado exitosamente",
          description: `Se ha preparado la cuenta para ${formData.fullName} y se le han enviado las credenciales de forma segura por email.${methodUsed}`,
        });
      }

      setSuccess(true);

      // Reset form
      setFormData({
        email: '',
        fullName: '',
        password: '',
        role: 'editor'
      });

      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 3000);

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