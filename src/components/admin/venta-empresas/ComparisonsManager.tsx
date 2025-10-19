import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useComparisons, useUpdateComparison } from '@/hooks/useVentaEmpresasContent';
import { Loader2, Save, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const ComparisonsManager = () => {
  const { data: comparisons, isLoading } = useComparisons();
  const updateComparison = useUpdateComparison();
  const [editingComparison, setEditingComparison] = useState<any>(null);

  const handleEdit = (comparison: any) => {
    setEditingComparison({ ...comparison });
  };

  const handleSave = () => {
    if (!editingComparison) return;

    updateComparison.mutate({
      id: editingComparison.id,
      data: {
        aspect: editingComparison.aspect,
        with_capittal: editingComparison.with_capittal,
        without_capittal: editingComparison.without_capittal,
        is_critical: editingComparison.is_critical,
      },
    });

    setEditingComparison(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Vender con Capittal vs Por Tu Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisons?.map((comparison) => (
              <Card key={comparison.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold">{comparison.aspect}</h3>
                        {comparison.is_critical && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Crítico
                          </span>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-green-600 mb-1">✓ Con Capittal</p>
                          <p className="text-muted-foreground">{comparison.with_capittal}</p>
                        </div>
                        <div>
                          <p className="font-medium text-red-600 mb-1">✗ Por Tu Cuenta</p>
                          <p className="text-muted-foreground">{comparison.without_capittal}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(comparison)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingComparison} onOpenChange={() => setEditingComparison(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Comparación</DialogTitle>
          </DialogHeader>
          {editingComparison && (
            <div className="space-y-4">
              <div>
                <Label>Aspecto</Label>
                <Input
                  value={editingComparison.aspect}
                  onChange={(e) =>
                    setEditingComparison({ ...editingComparison, aspect: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Con Capittal (Ventaja)</Label>
                <Textarea
                  value={editingComparison.with_capittal}
                  onChange={(e) =>
                    setEditingComparison({ ...editingComparison, with_capittal: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label>Por Tu Cuenta (Desventaja)</Label>
                <Textarea
                  value={editingComparison.without_capittal}
                  onChange={(e) =>
                    setEditingComparison({ ...editingComparison, without_capittal: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="critical"
                  checked={editingComparison.is_critical}
                  onCheckedChange={(checked) =>
                    setEditingComparison({ ...editingComparison, is_critical: checked })
                  }
                />
                <Label htmlFor="critical">Marcar como aspecto crítico</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingComparison(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={updateComparison.isPending}>
                  {updateComparison.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComparisonsManager;
