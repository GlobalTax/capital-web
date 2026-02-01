
# Plan: Reactivar useLeadMagnets con Tabla Real

## Resumen Ejecutivo

El hook `useLeadMagnets` está desactivado y devuelve datos vacíos. Para reactivarlo correctamente, necesitamos crear la tabla `lead_magnets` en Supabase y conectar el hook con queries reales.

---

## Análisis del Estado Actual

### Hook Desactivado
```typescript
// Actual - Solo devuelve vacíos
export const useLeadMagnets = () => {
  return {
    leadMagnets: [],
    isLoading: false,
    error: null,
    createLeadMagnet: { mutateAsync: async (data) => console.log('disabled') }
  };
};
```

### Tabla No Existe
- La tabla `lead_magnets` **no existe** en Supabase
- El `LeadMagnetsManager` usa `landing_pages` como workaround
- No hay tabla `lead_magnet_downloads` para tracking

### Componentes Afectados
| Componente | Hook Usado | Impacto |
|------------|-----------|---------|
| ContentPerformancePage | useLeadMagnets() | Muestra 0 lead magnets |
| PlanificacionFiscalCTA | useLeadMagnetDownloads() | Downloads no se registran |
| LeadMagnetLandingPage | useLeadMagnetDownloads() | Downloads no se registran |
| LeadMagnetsManager | Consulta directa | Usa landing_pages (workaround) |

---

## Cambios a Implementar

### 1. Crear Tablas en Supabase

#### Tabla `lead_magnets`
```sql
CREATE TABLE public.lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('report', 'whitepaper', 'checklist', 'template')),
  sector TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  landing_page_slug TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  lead_conversion_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  meta_title TEXT,
  meta_description TEXT,
  featured_image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla `lead_magnet_downloads`
```sql
CREATE TABLE public.lead_magnet_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id UUID NOT NULL REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_company TEXT,
  user_phone TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### RLS Policies
```sql
-- Lead magnets: lectura pública, escritura admin
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active lead magnets"
  ON public.lead_magnets FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage lead magnets"
  ON public.lead_magnets FOR ALL
  TO authenticated
  USING (true);

-- Downloads: inserción pública, lectura admin
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record downloads"
  ON public.lead_magnet_downloads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read downloads"
  ON public.lead_magnet_downloads FOR SELECT
  TO authenticated
  USING (true);
```

#### Función para incrementar contador
```sql
CREATE OR REPLACE FUNCTION increment_lead_magnet_download()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.lead_magnets
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = NEW.lead_magnet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_lead_magnet_download
  AFTER INSERT ON public.lead_magnet_downloads
  FOR EACH ROW
  EXECUTE FUNCTION increment_lead_magnet_download();
```

---

### 2. Reescribir Hook useLeadMagnets

**Archivo**: `src/hooks/useLeadMagnets.tsx`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LeadMagnet, DownloadFormData, LeadMagnetFormData } from '@/types/leadMagnets';

const QUERY_KEY = 'lead_magnets';

export const useLeadMagnets = () => {
  const queryClient = useQueryClient();

  // Fetch all lead magnets
  const { data: leadMagnets = [], isLoading, error } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadMagnet[];
    }
  });

  // Create lead magnet
  const createLeadMagnet = useMutation({
    mutationFn: async (formData: LeadMagnetFormData) => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  // Update lead magnet
  const updateLeadMagnet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeadMagnet> & { id: string }) => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  // Toggle status (active/draft/archived)
  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'draft' | 'archived' }) => {
      const { error } = await supabase
        .from('lead_magnets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  return {
    leadMagnets,
    isLoading,
    error,
    createLeadMagnet,
    updateLeadMagnet,
    toggleStatus
  };
};

export const useLeadMagnetDownloads = () => {
  const recordDownload = async (leadMagnetId: string, formData: DownloadFormData) => {
    const { error } = await supabase
      .from('lead_magnet_downloads')
      .insert([{
        lead_magnet_id: leadMagnetId,
        user_email: formData.user_email,
        user_name: formData.user_name,
        user_company: formData.user_company,
        user_phone: formData.user_phone,
        referrer: window.location.href,
        user_agent: navigator.userAgent
      }]);

    if (error) throw error;
  };

  return { recordDownload };
};
```

---

### 3. Actualizar LeadMagnetsManager

**Archivo**: `src/components/admin/LeadMagnetsManager.tsx`

Cambiar de consulta directa a `landing_pages` a usar el hook `useLeadMagnets`:

```typescript
// Antes (workaround)
const { data } = await supabase.from('landing_pages').select('*');

// Después (correcto)
const { leadMagnets, isLoading, createLeadMagnet } = useLeadMagnets();
```

---

## Resumen de Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| **Supabase** | Crear tablas `lead_magnets`, `lead_magnet_downloads`, RLS policies y trigger |
| `src/hooks/useLeadMagnets.tsx` | Reescribir con queries reales a Supabase |
| `src/components/admin/LeadMagnetsManager.tsx` | Usar el hook en lugar de consulta directa |

---

## Secuencia de Implementación

1. **Crear tablas en Supabase** (migración SQL)
2. **Reescribir hook** `useLeadMagnets.tsx`
3. **Actualizar** `LeadMagnetsManager.tsx` para usar el hook
4. **Verificar** que ContentPerformancePage muestra datos reales
5. **Probar** recording de downloads en PlanificacionFiscalCTA

---

## Resultado Esperado

- Admin ve lead magnets reales desde la base de datos
- Datos en tiempo real con React Query
- Downloads se registran correctamente con tracking
- Métricas de conversión funcionan
- No hay arrays vacíos ni funciones dummy
