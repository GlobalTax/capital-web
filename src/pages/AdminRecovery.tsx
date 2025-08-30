import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminRecovery = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First check if user exists in admin_users
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id, email, role, is_active, needs_credentials')
        .eq('email', email)
        .maybeSingle();

      if (adminError) {
        throw new Error('Error checking admin status');
      }

      if (!adminUser) {
        toast({
          title: "Usuario no encontrado",
          description: "No se encontró ningún administrador con ese email.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('🔧 Admin user found:', adminUser);

      // Update admin user to clear needs_credentials flag
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ 
          needs_credentials: false,
          is_active: true
        })
        .eq('user_id', adminUser.user_id);

      if (updateError) {
        throw new Error('Error updating admin status');
      }

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`
      });

      if (resetError) {
        throw new Error('Error sending reset email');
      }

      setSuccess(true);
      toast({
        title: "Recuperación iniciada",
        description: "Se ha enviado un email de recuperación y se ha activado tu cuenta de administrador.",
      });

    } catch (error) {
      console.error('🔧 Recovery error:', error);
      toast({
        title: "Error en la recuperación",
        description: error.message || "Ocurrió un error durante la recuperación.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-green-600">
              <CheckCircle className="h-6 w-6" />
              Recuperación Exitosa
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Se ha enviado un email de recuperación a <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Tu cuenta de administrador ha sido reactivada. Revisa tu email y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <Button 
              onClick={() => window.location.href = '/admin'}
              className="w-full"
            >
              Ir al Panel de Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Shield className="h-6 w-6" />
            Recuperación de Admin
          </CardTitle>
          <p className="text-gray-600">
            Recupera el acceso a tu cuenta de administrador
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta herramienta reactiva cuentas de administrador bloqueadas y envía un email de recuperación de contraseña.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleRecovery} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de Administrador</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@capittal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Recuperar Acceso"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => window.location.href = '/admin'}
              className="text-sm"
            >
              Volver al Login de Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRecovery;