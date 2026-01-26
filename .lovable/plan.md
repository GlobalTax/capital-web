

## Plan: Sistema de Compradores Potenciales para Leads

Se implementará una nueva sección en la ficha de Lead para gestionar compradores potenciales vinculados, con soporte para subir logos/imágenes de cada comprador.

---

### Arquitectura Propuesta

```text
+------------------------+     +-----------------------------+
|   LeadDetailPage       |     |  lead_potential_buyers      |
+------------------------+     +-----------------------------+
|  - PotentialBuyersCard |<--->|  lead_id: UUID              |
|    (Nueva sección)     |     |  name: TEXT                 |
|                        |     |  logo_url: TEXT             |
+------------------------+     |  website: TEXT              |
          |                    |  description: TEXT          |
          v                    |  sector_focus: TEXT[]       |
+------------------------+     |  revenue_range: TEXT        |
|  PotentialBuyerForm    |     |  contact_info: TEXT         |
+------------------------+     |  priority: INTEGER          |
|  - Nombre              |     |  notes: TEXT                |
|  - ImageUploadField    |     |  status: TEXT               |
|  - Website, Sector...  |     |  added_by: UUID             |
+------------------------+     +-----------------------------+
```

---

### Cambios a Implementar

#### 1. Base de Datos - Nueva Tabla `lead_potential_buyers`

Se creará una tabla para almacenar los compradores potenciales asociados a cada lead:

```sql
CREATE TABLE public.lead_potential_buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  lead_origin TEXT NOT NULL,
  
  -- Datos del comprador
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  sector_focus TEXT[],
  revenue_range TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Gestión
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'identificado' CHECK (status IN ('identificado', 'contactado', 'interesado', 'negociando', 'descartado')),
  notes TEXT,
  
  -- Auditoría
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_lead_potential_buyers_lead ON lead_potential_buyers(lead_id, lead_origin);

-- RLS
ALTER TABLE lead_potential_buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage potential buyers"
  ON lead_potential_buyers FOR ALL
  USING (auth.role() = 'authenticated');
```

#### 2. Tipos TypeScript - `src/types/leadPotentialBuyers.ts`

```typescript
export type BuyerStatus = 'identificado' | 'contactado' | 'interesado' | 'negociando' | 'descartado';

export interface LeadPotentialBuyer {
  id: string;
  lead_id: string;
  lead_origin: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  sector_focus: string[] | null;
  revenue_range: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  priority: number;
  status: BuyerStatus;
  notes: string | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadPotentialBuyerFormData {
  name: string;
  logo_url?: string;
  website?: string;
  description?: string;
  sector_focus?: string[];
  revenue_range?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  priority?: number;
  status?: BuyerStatus;
  notes?: string;
}
```

#### 3. Hook - `src/hooks/useLeadPotentialBuyers.ts`

```typescript
// Operaciones CRUD para compradores potenciales
- usePotentialBuyers(leadId, leadOrigin) - Listar compradores del lead
- useCreatePotentialBuyer() - Crear nuevo comprador
- useUpdatePotentialBuyer() - Actualizar comprador
- useDeletePotentialBuyer() - Eliminar comprador
```

#### 4. Componente Card - `src/components/admin/leads/PotentialBuyersCard.tsx`

Card principal que se añadirá a la ficha del lead:

**Características:**
- Header con título "Compradores Potenciales" y botón "+ Añadir"
- Lista de compradores con avatares (logos) usando el componente Avatar
- Cada item muestra: logo, nombre, sector, estado (badge), acciones
- Badge de estado con colores según estado (identificado=gris, interesado=verde, etc.)
- Botón de editar y eliminar en cada item
- Contador de compradores en el header

**Diseño visual:**
```text
+----------------------------------------------------------+
| 👥 Compradores Potenciales (3)              [+ Añadir]   |
+----------------------------------------------------------+
| [LOGO] Empresa ABC S.L.                                  |
|        Sector: Tecnología · Fact: 5M-10M€                |
|        📧 contacto@abc.com · ☎ 123456789                 |
|        [Interesado ✓]               [✏️] [🗑️]           |
+----------------------------------------------------------+
| [LOGO] Grupo XYZ                                         |
|        Sector: Industrial · Fact: 10M-50M€               |
|        [Identificado]               [✏️] [🗑️]           |
+----------------------------------------------------------+
```

#### 5. Formulario - `src/components/admin/leads/PotentialBuyerForm.tsx`

Dialog/Sheet para crear y editar compradores:

**Campos del formulario:**
- **Nombre** (requerido) - Input text
- **Logo** - ImageUploadField (usa folder `potential-buyers/logos`)
- **Sitio Web** - Input URL
- **Descripción** - Textarea corto
- **Sector(es)** - Multi-select o input de tags
- **Rango de Facturación** - Select (0-1M, 1M-5M, 5M-10M, 10M-50M, 50M+)
- **Datos de Contacto:**
  - Nombre del contacto
  - Email
  - Teléfono
- **Estado** - Select (identificado, contactado, interesado, negociando, descartado)
- **Prioridad** - Select (1-5 o Baja/Media/Alta)
- **Notas** - Textarea

#### 6. Integración en LeadDetailPage

Añadir la nueva Card después de "Empresa Vinculada":

```tsx
{/* Empresa Vinculada */}
<CompanyLinkCard ... />

{/* NUEVO: Compradores Potenciales */}
<PotentialBuyersCard
  leadId={lead.id}
  leadOrigin={lead.origin}
/>

{/* Datos específicos según origen */}
```

---

### Secuencia de Implementación

1. **Migración DB**: Crear tabla `lead_potential_buyers` con RLS
2. **Tipos**: Crear `src/types/leadPotentialBuyers.ts`
3. **Hook**: Crear `src/hooks/useLeadPotentialBuyers.ts` con CRUD
4. **Formulario**: Crear `PotentialBuyerForm.tsx` con ImageUploadField
5. **Card**: Crear `PotentialBuyersCard.tsx` con lista y acciones
6. **Integración**: Añadir card en `LeadDetailPage.tsx`
7. **Actualizar Types**: Regenerar tipos de Supabase

---

### Resultado Visual Esperado

**Vista de Lista (Card colapsable):**
- Muestra avatares con logos de compradores
- Información compacta pero completa
- Estados con badges de colores
- Acciones rápidas (editar, eliminar)
- Ordenados por prioridad

**Formulario de Creación:**
- Campo de logo con upload directo a Supabase Storage
- Preview de imagen antes de guardar
- Validación de campos requeridos
- Selectores para sectores y rangos de facturación

---

### Consideraciones Técnicas

- **Storage**: Se usará el bucket `lovable-uploads` existente con carpeta `potential-buyers/logos`
- **ImageUploadField**: Se reutiliza el componente existente que ya maneja upload a Supabase
- **RLS**: Política simple para usuarios autenticados (admins)
- **Performance**: La lista usa IDs compuestos (lead_id + lead_origin) para filtrar
- **Optimistic Updates**: React Query manejará la cache para UI instantánea
- **Validación**: Zod schemas para el formulario

---

### Posible Mejora Futura

Una vez implementado, se podría añadir:
- **Importar desde Corporate Buyers**: Botón para vincular compradores del directorio existente
- **Matching con IA**: Sugerir compradores automáticamente basado en sector y facturación del lead
- **Historial de interacciones**: Timeline de comunicaciones con cada comprador

