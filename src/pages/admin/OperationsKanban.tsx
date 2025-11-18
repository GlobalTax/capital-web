import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Kanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OperationsKanban: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/admin/operations')}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Vista Kanban</h1>
          <p className="text-muted-foreground">
            Gestión visual de operaciones con drag & drop
          </p>
        </div>
      </div>

      {/* Placeholder */}
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Kanban className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Vista Kanban en Desarrollo</h2>
            <p className="text-muted-foreground">
              La vista Kanban para gestión visual de operaciones estará disponible próximamente.
              Esta funcionalidad incluirá drag & drop, filtros por usuario asignado, y columnas personalizables por estado.
            </p>
            <Button onClick={() => navigate('/admin/operations')} className="mt-4">
              Volver a Lista
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationsKanban;
