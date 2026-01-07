import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  SECTOR_OPTIONS,
  LOCATION_OPTIONS,
  DEAL_TYPE_OPTIONS,
  type SearcherRegistrationData
} from '@/schemas/searcherSchema';

interface SearchCriteriaStepProps {
  form: UseFormReturn<SearcherRegistrationData>;
}

export function SearchCriteriaStep({ form }: SearchCriteriaStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="preferredSectors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sectores de interés *</FormLabel>
            <FormDescription>Selecciona todos los que apliquen</FormDescription>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {SECTOR_OPTIONS.map((sector) => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sector-${sector}`}
                    checked={field.value?.includes(sector)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...(field.value || []), sector]
                        : field.value?.filter((s) => s !== sector) || [];
                      field.onChange(newValue);
                    }}
                  />
                  <label
                    htmlFor={`sector-${sector}`}
                    className="text-sm cursor-pointer"
                  >
                    {sector}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferredLocations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ubicaciones preferidas *</FormLabel>
            <FormDescription>Selecciona las zonas geográficas de interés</FormDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {LOCATION_OPTIONS.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={field.value?.includes(location)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...(field.value || []), location]
                        : field.value?.filter((l) => l !== location) || [];
                      field.onChange(newValue);
                    }}
                  />
                  <label
                    htmlFor={`location-${location}`}
                    className="text-sm cursor-pointer"
                  >
                    {location}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minRevenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facturación mínima (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 1000000"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxRevenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facturación máxima (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 10000000"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minEbitda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EBITDA mínimo (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 200000"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxEbitda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EBITDA máximo (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 2000000"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="dealTypePreferences"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de operación preferida</FormLabel>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DEAL_TYPE_OPTIONS.map((dealType) => (
                <div key={dealType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`deal-${dealType}`}
                    checked={field.value?.includes(dealType)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...(field.value || []), dealType]
                        : field.value?.filter((d) => d !== dealType) || [];
                      field.onChange(newValue);
                    }}
                  />
                  <label
                    htmlFor={`deal-${dealType}`}
                    className="text-sm cursor-pointer"
                  >
                    {dealType}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
