
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AdminSetup = () => {
  const { user, checkAdminStatus } = useAuth();
  const { toast } = useToast();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    checkCurrentAdminStatus();
  }, [user]);

  const checkCurrentAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin:', error);
        setAdminExists(false);
      } else {
        setAdminExists(!!data?.is_active);
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      setAdminExists(false);
    }
  };

  const createAdminUser = async () => {
    if (!user) return;
    
    setIsCheckingAdmin(true);
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: user.id,
          role: 'super_admin',
          is_active: true
        });

      if (error) {
        if (error.code === '23505') {
          // User already exists, try to activate
          const { error: updateError } = await supabase
            .from('admin_users')
            .update({ is_active: true, role: 'super_admin' })
            .eq('user_id', user.id);
            
          if (updateError) {
            throw updateError;
          }
        } else {
          throw error;
        }
      }

      setAdminExists(true);
      await checkAdminStatus();
      
      toast({
        title: "¡Admin configurado!",
        description: "Tu usuario ahora tiene permisos de administrador.",
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error",
        description: "No se pudo configurar el usuario admin. Verifica tus permisos.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuración de Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Debes iniciar sesión para configurar permisos de administrador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Configuración de Admin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Usuario actual: <strong>{user.email}</strong>
        </div>
        
        {adminExists === true ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ Tu usuario tiene permisos de administrador activos.
            </AlertDescription>
          </Alert>
        ) : adminExists === false ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tu usuario no tiene permisos de administrador. Haz clic abajo para configurarlos.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={createAdminUser}
              disabled={isCheckingAdmin}
              className="w-full"
            >
              {isCheckingAdmin ? "Configurando..." : "Configurar como Admin"}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Verificando permisos...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
