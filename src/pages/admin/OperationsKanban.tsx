import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { OperationsKanbanView } from '@/features/operations-management/components/views';
import OperationDetailsModalEnhanced from '@/components/operations/OperationDetailsModalEnhanced';
import type { Operation } from '@/features/operations-management/types/operations';

const OperationsKanban = () => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingOperation, setViewingOperation] = useState<Operation | null>(null);

  const fetchOperations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('company_operations')
        .select('*')
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setOperations((data as Operation[]) || []);
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/operations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a lista
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Vista Kanban</h1>
            <p className="text-muted-foreground text-sm">
              Gestión visual del pipeline de operaciones
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOperations}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Kanban View */}
      <OperationsKanbanView
        operations={operations}
        isLoading={isLoading}
        onOperationClick={setViewingOperation}
      />

      {/* Operation Details Modal */}
      {viewingOperation && (
        <OperationDetailsModalEnhanced
          operation={viewingOperation}
          isOpen={!!viewingOperation}
          onClose={() => setViewingOperation(null)}
          onUpdate={fetchOperations}
        />
      )}
    </div>
  );
};

export default OperationsKanban;
