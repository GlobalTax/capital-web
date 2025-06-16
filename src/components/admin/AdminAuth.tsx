
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

const AdminAuth = ({ onAuthSuccess }: AdminAuthProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Registro exitoso",
          description: "Revisa tu email para confirmar la cuenta.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        onAuthSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Crear cuenta administrativa' : 'Acceso al sistema de gestión'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white border border-black rounded-lg hover:bg-gray-900"
          >
            {isLoading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-600 hover:text-black text-sm"
          >
            {isSignUp ? '¿Ya tienes cuenta? Iniciar sesión' : '¿Necesitas una cuenta? Registrarse'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
