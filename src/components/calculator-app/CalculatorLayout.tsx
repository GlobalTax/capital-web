import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  History, 
  Settings, 
  Plus,
  Home,
  LogOut,
  ExternalLink
} from 'lucide-react';

interface CalculatorLayoutProps {
  children: React.ReactNode;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/nueva-valoracion', label: 'Nueva Valoración', icon: Plus },
    { path: '/historial', label: 'Historial', icon: History },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Calculator className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Calculadoras Capittal</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://capittal.es', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Capittal.es
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 py-3 px-2 border-b-2 transition-colors ${
                    isActive 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};