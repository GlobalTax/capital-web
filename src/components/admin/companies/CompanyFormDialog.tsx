import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Save } from 'lucide-react';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';

// Función para normalizar CIF: trim, mayúsculas, sin espacios
const normalizeCif = (cif: string | undefined | null): string | null => {
  if (!cif) return null;
  const normalized = cif.trim().toUpperCase().replace(/\s/g, '');
  return normalized === '' ? null : normalized;
};

// Regex básica para validar formato CIF español (letra + 7 dígitos + letra/dígito)
const cifRegex = /^[A-Z]\d{7}[A-Z0-9]$/;

const empresaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  cif: z.string().optional(),
  sector: z.string().min(1, 'El sector es obligatorio'),
  subsector: z.string().optional(),
  ubicacion: z.string().optional(),
  facturacion: z.coerce.number().optional(),
  ebitda: z.coerce.number().optional(),
  empleados: z.coerce.number().optional(),
  sitio_web: z.string().optional(),
  descripcion: z.string().optional(),
  es_target: z.boolean().optional(),
  potencial_search_fund: z.boolean().optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (empresa: Empresa) => void;
  empresa?: Empresa | null;
  initialData?: Partial<EmpresaFormValues>;
}

export const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  empresa,
  initialData,
}) => {
  const { createEmpresa, updateEmpresa, isCreating, isUpdating } = useEmpresas();
  const isEditing = !!empresa;

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nombre: empresa?.nombre || initialData?.nombre || '',
      cif: empresa?.cif || '',
      sector: empresa?.sector || 'Otros',
      subsector: empresa?.subsector || '',
      ubicacion: empresa?.ubicacion || '',
      facturacion: empresa?.facturacion || undefined,
      ebitda: empresa?.ebitda || undefined,
      empleados: empresa?.empleados || undefined,
      sitio_web: empresa?.sitio_web || '',
      descripcion: empresa?.descripcion || '',
      es_target: empresa?.es_target || false,
      potencial_search_fund: empresa?.potencial_search_fund || false,
    },
  });

  // Reset form when empresa changes
  React.useEffect(() => {
    if (empresa) {
      form.reset({
        nombre: empresa.nombre,
        cif: empresa.cif || '',
        sector: empresa.sector,
        subsector: empresa.subsector || '',
        ubicacion: empresa.ubicacion || '',
        facturacion: empresa.facturacion || undefined,
        ebitda: empresa.ebitda || undefined,
        empleados: empresa.empleados || undefined,
        sitio_web: empresa.sitio_web || '',
        descripcion: empresa.descripcion || '',
        es_target: empresa.es_target || false,
        potencial_search_fund: empresa.potencial_search_fund || false,
      });
    } else if (initialData) {
      form.reset({
        nombre: initialData.nombre || '',
        sector: 'Otros',
        ...initialData,
      });
    }
  }, [empresa, initialData, form]);

  const onSubmit = async (values: EmpresaFormValues) => {
    try {
      // Normalizar CIF antes de guardar
      const normalizedCif = normalizeCif(values.cif);
      
      // Validar formato CIF si se proporcionó
      if (normalizedCif && !cifRegex.test(normalizedCif)) {
        form.setError('cif', { message: 'CIF no válido (formato: B12345678)' });
        return;
      }
      
      const dataToSave = {
        ...values,
        cif: normalizedCif, // null si está vacío, normalizado si tiene valor
      };
      
      let result: Empresa;
      
      if (isEditing && empresa) {
        result = await updateEmpresa({ id: empresa.id, ...dataToSave });
      } else {
        result = await createEmpresa(dataToSave as any);
      }
      
      onSuccess(result);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving empresa:', error);
      
      // Detectar error de CIF duplicado
      const errorMessage = error?.message || '';
      if (errorMessage.includes('cif') || errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
        form.setError('cif', { message: 'Este CIF ya está registrado en otra empresa' });
      }
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pr-4">
              {/* Información básica */}
              <div>
                <h3 className="text-sm font-medium mb-3">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la empresa *</FormLabel>
                        <FormControl>
                          <Input placeholder="Empresa S.L." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CIF</FormLabel>
                        <FormControl>
                          <Input placeholder="B12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector *</FormLabel>
                        <FormControl>
                          <Input placeholder="Tecnología, Industrial, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subsector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subsector</FormLabel>
                        <FormControl>
                          <Input placeholder="Software, Manufactura, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Madrid, Barcelona, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sitio_web"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio Web</FormLabel>
                        <FormControl>
                          <Input placeholder="www.empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Datos financieros */}
              <div>
                <h3 className="text-sm font-medium mb-3">Datos Financieros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="facturacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facturación (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2500000" 
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ebitda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EBITDA (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="230000" 
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="empleados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empleados</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="45" 
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Opciones */}
              <div>
                <h3 className="text-sm font-medium mb-3">Opciones</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="es_target"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-base">Es Target</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Marcar si esta empresa es un objetivo de inversión
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="potencial_search_fund"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-base">Potencial Search Fund</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Empresa apta para adquisición por Search Fund
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Descripción */}
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción de la empresa, actividad principal, etc."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading 
                    ? 'Guardando...' 
                    : isEditing 
                      ? 'Guardar cambios' 
                      : 'Crear empresa'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
