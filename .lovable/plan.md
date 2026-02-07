

## Plan: Base de datos de empresas y contactos Dealsuite

La tabla `dealsuite_contacts` existe pero esta vacia porque el upsert solo funciona cuando hay email en el deal (2 de 3 deals no tienen email). Ademas, la imagen de referencia muestra un perfil de **empresa** mucho mas rico que lo que tenemos. Se creara una estructura completa de empresas + contactos.

### 1. Nueva tabla `dealsuite_empresas`

Basada en el perfil de Dealsuite de la imagen, con estos campos:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | PK |
| nombre | TEXT NOT NULL | Nombre de la empresa (ej. "CDI Global Iberia") |
| ubicacion | TEXT | Pais/ciudad |
| descripcion | TEXT | Acerca de la empresa |
| tipo_empresa | TEXT | Tipo (ej. "Asesoramiento M&A") |
| parte_de | TEXT | Grupo al que pertenece (ej. "CDI Global") |
| experiencia_ma | TEXT[] | Tags de experiencia M&A |
| experiencia_sector | TEXT[] | Tags de sectores |
| tamano_proyectos_min | NUMERIC | Min tamano proyectos |
| tamano_proyectos_max | NUMERIC | Max tamano proyectos |
| enfoque_consultivo | TEXT | "En venta", "Para comprar", etc. |
| sitio_web | TEXT | URL del sitio web |
| imagen_url | TEXT | Logo o imagen |
| notas | TEXT | Notas internas |
| deal_ids | TEXT[] | Deals asociados |
| created_at / updated_at | TIMESTAMPTZ | Timestamps |

### 2. Ampliar tabla `dealsuite_contacts`

Anadir campos adicionales:

- `empresa_id` UUID (FK a dealsuite_empresas, nullable)
- `cargo` TEXT (cargo/rol, ej. "Managing Partner")
- `imagen_url` TEXT (foto del contacto)

### 3. Logica de guardado mejorada

Cuando se guarda un deal:
- Si hay `contact_company` o `advisor`: buscar/crear empresa en `dealsuite_empresas`
- Si hay `contact_name` (aunque no haya email): crear contacto en `dealsuite_contacts` vinculado a la empresa
- Permitir crear contactos sin email (quitar requisito de email obligatorio para el upsert)

### 4. Pestaña "Empresas y Contactos" en DealsuiteSyncPanel

Anadir una tercera pestana junto a "Favoritos" y "Todos":

- **Pestana "Directorio"**: muestra listado de empresas con sus contactos asociados
- Cada empresa muestra: nombre, ubicacion, tipo, numero de contactos, numero de deals vinculados
- Al hacer clic en una empresa: vista detalle similar al perfil de Dealsuite de la imagen (badges de experiencia, contactos listados al lado, info de la empresa)

### 5. Archivos a modificar

- **Migracion SQL**: Crear `dealsuite_empresas`, alterar `dealsuite_contacts` (anadir empresa_id, cargo, imagen_url)
- **`DealsuiteSyncPanel.tsx`**: Mejorar `upsertContact` para crear empresa + contacto, anadir pestana "Directorio"
- **Nuevo componente `DealsuiteEmpresaCard.tsx`**: Vista de detalle de empresa tipo Dealsuite (basada en la imagen de referencia)
- **Nuevo hook `useDealsuiteEmpresas.ts`**: Queries para empresas y contactos

### Detalle tecnico

```text
-- Migracion
CREATE TABLE public.dealsuite_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  descripcion TEXT,
  tipo_empresa TEXT,
  parte_de TEXT,
  experiencia_ma TEXT[] DEFAULT '{}',
  experiencia_sector TEXT[] DEFAULT '{}',
  tamano_proyectos_min NUMERIC,
  tamano_proyectos_max NUMERIC,
  enfoque_consultivo TEXT,
  sitio_web TEXT,
  imagen_url TEXT,
  notas TEXT,
  deal_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dealsuite_contacts
  ADD COLUMN empresa_id UUID REFERENCES public.dealsuite_empresas(id),
  ADD COLUMN cargo TEXT,
  ADD COLUMN imagen_url TEXT,
  ALTER COLUMN nombre DROP NOT NULL,
  ALTER COLUMN nombre SET DEFAULT 'Sin nombre';

-- RLS para dealsuite_empresas (misma politica admin)
```

Logica de upsert mejorada:
```text
handleSave -> 
  1. Si contact_company/advisor existe:
     - Buscar empresa por nombre
     - Si no existe, crearla
  2. Si contact_name existe (con o sin email):
     - Buscar contacto por email (si hay) o por nombre+empresa
     - Crear/actualizar contacto con empresa_id
  3. Guardar deal normalmente
```
