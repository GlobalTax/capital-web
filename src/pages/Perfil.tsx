
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Perfil = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Helmet>
          <title>Mi perfil | Capittal</title>
          <meta name="description" content="Gestiona tu información personal y acceso al panel de administración." />
          <link rel="canonical" href={canonical} />
        </Helmet>
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso Requerido</h1>
            <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tu perfil</p>
            <Link to="/admin">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const userEmail = user.email || '';
  const userName = userEmail.split('@')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Helmet>
        <title>Mi perfil | Capittal</title>
        <meta name="description" content="Gestiona tu información personal y acceso al panel de administración." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración de cuenta</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información del Usuario */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" value={userName} readOnly className="bg-gray-50" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={userEmail} readOnly className="bg-gray-50" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="user-id">ID de Usuario</Label>
                    <Input id="user-id" value={user.id} readOnly className="bg-gray-50 font-mono text-sm" />
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" disabled>
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Perfil (Próximamente)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panel de Acceso Rápido */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Acceso Administrativo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Accede al panel de administración para gestionar leads, contenido y configuración.
                  </p>
                  
                  <div className="space-y-2">
                    <Link to="/admin" className="block">
                      <Button className="w-full">
                        Panel de Administración
                      </Button>
                    </Link>
                    
                    <Link to="/admin/all-leads" className="block">
                      <Button variant="outline" className="w-full">
                        Todos los Leads
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cuenta creada:</span>
                      <span>{new Date(user.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último acceso:</span>
                      <span>{new Date(user.last_sign_in_at || user.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className="text-green-600">Activo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Perfil;
