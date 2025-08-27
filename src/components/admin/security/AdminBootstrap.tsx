import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const AdminBootstrap: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBootstrap = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor introduce un email válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('bootstrap_first_admin', {
        user_email: email.trim()
      });

      if (error) {
        throw error;
      }

      if (data) {
        toast({
          title: "¡Admin creado exitosamente!",
          description: `El usuario ${email} ahora es administrador`,
        });
        setEmail('');
        // Refresh the page to update admin status
        window.location.reload();
      } else {
        toast({
          title: "No se pudo crear el admin",
          description: "Ya existen administradores o el usuario no existe",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error bootstrapping admin:', error);
      toast({
        title: "Error",
        description: "Error al crear el administrador inicial",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configuración Inicial de Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Parece que no hay administradores configurados. Introduce el email de un usuario registrado para convertirlo en el primer administrador.
        </p>
        
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <Button
          onClick={handleBootstrap}
          disabled={isLoading || !email.trim()}
          className="w-full"
        >
          {isLoading ? 'Creando...' : 'Crear Primer Admin'}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          ⚠️ Esta función solo funciona si no hay administradores existentes.
        </p>
      </CardContent>
    </Card>
  );
};