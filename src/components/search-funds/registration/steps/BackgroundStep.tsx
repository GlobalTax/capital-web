import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { SearcherRegistrationData } from '@/schemas/searcherSchema';

interface BackgroundStepProps {
  form: UseFormReturn<SearcherRegistrationData>;
}

export function BackgroundStep({ form }: BackgroundStepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="background"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Formación y experiencia profesional</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe brevemente tu formación académica (MBA, etc.), experiencia laboral relevante, sectores en los que has trabajado, y habilidades que aportas como operador..."
                className="min-h-[200px] resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Esta información nos ayuda a entender tu perfil y encontrar las mejores oportunidades para ti.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
