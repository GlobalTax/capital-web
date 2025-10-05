import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminSetup from './AdminSetup';

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

const AdminAuth = ({ onAuthSuccess }: AdminAuthProps) => {
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (!error) {
      onAuthSuccess();
      navigate('/admin', { replace: true });
    }
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AdminSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Lock className="h-6 w-6" />
            Panel de Administración
          </CardTitle>
          <p className="text-gray-600">Accede con tu cuenta de administrador</p>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <h3 className="text-lg font-semibold text-center mb-4">Acceso Administrativo</h3>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="admin@capittal.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Acceder"}
              </Button>
            </form>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aplicación interna - Solo usuarios autorizados pueden acceder.
              </AlertDescription>
            </Alert>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;