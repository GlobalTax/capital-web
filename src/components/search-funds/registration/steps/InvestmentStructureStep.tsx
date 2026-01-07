import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  INVESTOR_BACKING_OPTIONS,
  FUND_RAISED_OPTIONS,
  SEARCH_PHASE_OPTIONS,
  type SearcherRegistrationData
} from '@/schemas/searcherSchema';

interface InvestmentStructureStepProps {
  form: UseFormReturn<SearcherRegistrationData>;
}

export function InvestmentStructureStep({ form }: InvestmentStructureStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="investorBacking"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de respaldo inversor *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {INVESTOR_BACKING_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <label
                      htmlFor={option.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="investorNames"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Inversores principales (confidencial)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Nombres de los inversores principales que te respaldan..."
                className="min-h-[80px] resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Esta información es estrictamente confidencial y solo se usará para validar tu perfil.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fundRaised"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capital comprometido/disponible *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {FUND_RAISED_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`fund-${option.value}`} />
                    <label
                      htmlFor={`fund-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="searchPhase"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fase actual *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 gap-3"
              >
                {SEARCH_PHASE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`phase-${option.value}`} />
                    <label
                      htmlFor={`phase-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
