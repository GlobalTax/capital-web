import { UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { HOW_FOUND_US_OPTIONS, type SearcherRegistrationData } from '@/schemas/searcherSchema';

interface AdditionalInfoStepProps {
  form: UseFormReturn<SearcherRegistrationData>;
}

export function AdditionalInfoStep({ form }: AdditionalInfoStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="additionalCriteria"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Criterios adicionales</FormLabel>
            <FormControl>
              <Textarea
                placeholder="¿Hay algo más que debamos saber sobre lo que buscas? Características específicas, exclusiones, preferencias de timing..."
                className="min-h-[100px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="howFoundUs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Cómo nos conociste?</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {HOW_FOUND_US_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4 pt-4 border-t border-border">
        <FormField
          control={form.control}
          name="gdprConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  Acepto la{' '}
                  <Link
                    to="/legal/privacidad"
                    target="_blank"
                    className="text-primary underline hover:no-underline"
                  >
                    política de privacidad
                  </Link>{' '}
                  y el tratamiento de mis datos *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="marketingConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  Quiero recibir oportunidades de inversión y novedades por email
                </FormLabel>
                <FormDescription>
                  Te enviaremos operaciones que coincidan con tus criterios de búsqueda.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
