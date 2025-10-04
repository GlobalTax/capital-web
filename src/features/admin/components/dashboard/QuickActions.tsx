import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Users, Briefcase, PlusCircle } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      title: 'Nuevo Post',
      description: 'Crear artículo de blog',
      icon: FileText,
      href: '/admin/blog-v2/new',
      color: 'text-green-600 bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Ver Contactos',
      description: 'Gestionar valoraciones',
      icon: Users,
      href: '/admin/contacts',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Adquisiciones',
      description: 'Revisar solicitudes',
      icon: Briefcase,
      href: '/admin/acquisition-leads',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Nueva Operación',
      description: 'Crear caso de éxito',
      icon: PlusCircle,
      href: '/admin/operations/new',
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        <CardDescription>Atajos a tareas comunes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.href}>
                <Button 
                  variant="outline" 
                  className="w-full h-auto flex flex-col items-start p-4 hover:bg-muted"
                >
                  <div className={`p-2 rounded-lg mb-2 ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
