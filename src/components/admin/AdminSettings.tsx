import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  User,
  ChevronRight,
  Shield,
  LogOut,
  Megaphone,
  Mail,
  FileSignature,
  Workflow,
  Shuffle,
  LayoutPanelTop,
  Activity,
  PanelLeft
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const configLinks = [
    {
      title: 'Configuración TopBar',
      description: 'Personaliza la barra superior: enlaces, empresas del grupo y teléfono',
      icon: LayoutPanelTop,
      href: '/admin/settings/topbar',
    },
    {
      title: 'Navegación Sidebar',
      description: 'Reorganiza secciones e items del menú lateral del admin',
      icon: PanelLeft,
      href: '/admin/settings/sidebar',
    },
    {
      title: 'Migración Sectores PE',
      description: 'Normaliza sectores de empresas y fondos a taxonomía estándar PE/Search Funds',
      icon: Shuffle,
      href: '/admin/settings/sector-migration',
    },
    {
      title: 'Canales de Adquisición',
      description: 'Gestiona los canales para clasificar el origen de contactos (Meta, Google Ads, etc.)',
      icon: Megaphone,
      href: '/admin/settings/canales',
    },
    {
      title: 'Destinatarios Email',
      description: 'Configura quién recibe las notificaciones de nuevos leads',
      icon: Mail,
      href: '/admin/configuracion/destinatarios-email',
    },
    {
      title: 'Firma PDF',
      description: 'Configura la firma que aparece en los PDFs de valoración',
      icon: FileSignature,
      href: '/admin/configuracion/firma-pdf',
    },
    {
      title: 'Plantillas de Workflow',
      description: 'Gestiona las plantillas de flujo de trabajo para operaciones',
      icon: Workflow,
      href: '/admin/configuracion/workflow-templates',
    },
    {
      title: 'Email Outbox',
      description: 'Monitor de envío de emails con estado, errores y reintentos',
      icon: Mail,
      href: '/admin/settings/email-outbox',
    },
    {
      title: 'Consumo de APIs',
      description: 'Dashboard de uso de Firecrawl, OpenAI y Lovable AI con proyecciones',
      icon: Activity,
      href: '/admin/settings/api-usage',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu cuenta y configuraciones del sistema
        </p>
      </div>

      {/* Configuration Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Sistema
          </CardTitle>
          <CardDescription>
            Accede a las diferentes secciones de configuración
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {configLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{link.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{link.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID de Usuario</label>
              <p className="text-muted-foreground text-sm font-mono">{user?.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última conexión</label>
              <p className="text-foreground">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado de Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-emerald-600">✅ Permisos de Administrador Activos</p>
              <p className="text-sm text-muted-foreground">
                Tienes acceso completo al panel de administración
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Sesión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
