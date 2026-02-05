// ============= CR PORTFOLIO EDIT MODAL =============
// Modal para editar/crear empresas participadas de Capital Riesgo

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CRPortfolio, 
  CR_PORTFOLIO_STATUS_LABELS, 
  CR_INVESTMENT_TYPE_LABELS, 
  CR_OWNERSHIP_TYPE_LABELS, 
  CR_EXIT_TYPE_LABELS,
  CRInvestmentType,
  CROwnershipType,
  CRPortfolioStatus,
  CRExitType
} from '@/types/capitalRiesgo';
import { useCreateCRPortfolio, useUpdateCRPortfolio } from '@/hooks/useCRPortfolio';
import { useCRFunds } from '@/hooks/useCRFunds';
import { Loader2 } from 'lucide-react';
import SectorSelect from '@/components/admin/shared/SectorSelect';

const portfolioSchema = z.object({
  company_name: z.string().min(1, 'Nombre requerido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  country: z.string().optional(),
  sector: z.string().optional(),
  investment_year: z.number().nullable().optional(),
  investment_type: z.enum(['lead', 'co_invest', 'follow_on'] as const).optional(),
  ownership_type: z.enum(['majority', 'minority', 'growth', 'control'] as const),
  status: z.enum(['active', 'exited', 'write_off', 'partial_exit'] as const),
  exit_year: z.number().nullable().optional(),
  exit_type: z.enum(['trade_sale', 'ipo', 'secondary', 'recap', 'write_off', 'merger', 'spac'] as const).nullable().optional(),
  description: z.string().optional(),
  source_url: z.string().optional(),
  notes: z.string().optional(),
  fund_name: z.string().optional(),
  fund_id: z.string().min(1, 'Fund requerido'),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface CRPortfolioEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio?: CRPortfolio | null;
  defaultFundId?: string;
}

export const CRPortfolioEditModal: React.FC<CRPortfolioEditModalProps> = ({
  open,
  onOpenChange,
  portfolio,
  defaultFundId,
}) => {
  const isEditing = !!portfolio;
  const createPortfolio = useCreateCRPortfolio();
  const updatePortfolio = useUpdateCRPortfolio();
  const { data: funds = [] } = useCRFunds();

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      company_name: portfolio?.company_name ?? '',
      website: portfolio?.website ?? '',
      country: portfolio?.country ?? '',
      sector: portfolio?.sector ?? '',
      investment_year: portfolio?.investment_year ?? null,
      investment_type: (portfolio?.investment_type as CRInvestmentType) ?? 'lead',
      ownership_type: (portfolio?.ownership_type as CROwnershipType) ?? 'majority',
      status: (portfolio?.status as CRPortfolioStatus) ?? 'active',
      exit_year: portfolio?.exit_year ?? null,
      exit_type: (portfolio?.exit_type as CRExitType) ?? null,
      description: portfolio?.description ?? '',
      source_url: portfolio?.source_url ?? '',
      notes: portfolio?.notes ?? '',
      fund_id: portfolio?.fund_id ?? defaultFundId ?? '',
    },
  });

  const watchStatus = form.watch('status');

  React.useEffect(() => {
    if (open) {
      form.reset({
        company_name: portfolio?.company_name ?? '',
        website: portfolio?.website ?? '',
        country: portfolio?.country ?? '',
        sector: portfolio?.sector ?? '',
        investment_year: portfolio?.investment_year ?? null,
        investment_type: (portfolio?.investment_type as CRInvestmentType) ?? 'lead',
        ownership_type: (portfolio?.ownership_type as CROwnershipType) ?? 'majority',
        status: (portfolio?.status as CRPortfolioStatus) ?? 'active',
        exit_year: portfolio?.exit_year ?? null,
        exit_type: (portfolio?.exit_type as CRExitType) ?? null,
        description: portfolio?.description ?? '',
        source_url: portfolio?.source_url ?? '',
        notes: portfolio?.notes ?? '',
        fund_id: portfolio?.fund_id ?? defaultFundId ?? '',
      });
    }
  }, [open, portfolio, defaultFundId, form]);

  const onSubmit = async (data: PortfolioFormData) => {
    const payload = {
      company_name: data.company_name,
      website: data.website || null,
      country: data.country || null,
      sector: data.sector || null,
      investment_year: data.investment_year,
      investment_type: data.investment_type || null,
      ownership_type: data.ownership_type,
      status: data.status,
      exit_year: data.status === 'exited' || data.status === 'partial_exit' ? data.exit_year : null,
      exit_type: data.status === 'exited' || data.status === 'partial_exit' ? data.exit_type : null,
      description: data.description || null,
      source_url: data.source_url || null,
      notes: data.notes || null,
      fund_name: data.fund_name || null,
      fund_id: data.fund_id,
    };

    if (isEditing && portfolio) {
      await updatePortfolio.mutateAsync({ id: portfolio.id, data: payload });
    } else {
      await createPortfolio.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createPortfolio.isPending || updatePortfolio.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Participada' : 'Nueva Participada'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nombre empresa *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Acme Corp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="España" />
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
                    <FormLabel>Sector</FormLabel>
                    <FormControl>
                      <SectorSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Selecciona un sector"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investment_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año inversión</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        placeholder="2023"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo inversión</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(CR_INVESTMENT_TYPE_LABELS) as [CRInvestmentType, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownership_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo participación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(CR_OWNERSHIP_TYPE_LABELS) as [CROwnershipType, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(CR_PORTFOLIO_STATUS_LABELS) as [CRPortfolioStatus, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fund_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Fund asociado *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un fund" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {funds.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(watchStatus === 'exited' || watchStatus === 'partial_exit') && (
                <>
                  <FormField
                    control={form.control}
                    name="exit_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año exit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            placeholder="2024"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exit_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo exit</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(CR_EXIT_TYPE_LABELS) as [CRExitType, string][]).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Descripción de la empresa..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notas internas</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Notas internas..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear participada'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CRPortfolioEditModal;
