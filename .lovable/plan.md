
## Plan: Logo Opcional + Datos Financieros Completos

Se modificará el formulario de Compradores Potenciales para:
1. Hacer el logo **opcional** (no requerido)
2. Añadir **todos los campos financieros numéricos** (Facturación, EBITDA, Empleados)

---

### Cambios a Implementar

#### 1. Migración de Base de Datos

Añadir columnas financieras numéricas a `lead_potential_buyers`:

```sql
ALTER TABLE lead_potential_buyers
ADD COLUMN IF NOT EXISTS revenue NUMERIC,           -- Facturación en €
ADD COLUMN IF NOT EXISTS ebitda NUMERIC,            -- EBITDA en €
ADD COLUMN IF NOT EXISTS employees INTEGER;         -- Número de empleados
```

#### 2. Actualizar Tipos TypeScript

**Archivo:** `src/types/leadPotentialBuyers.ts`

```typescript
export interface LeadPotentialBuyer {
  // ... campos existentes ...
  revenue: number | null;      // NUEVO
  ebitda: number | null;       // NUEVO
  employees: number | null;    // NUEVO
}

export interface LeadPotentialBuyerFormData {
  // ... campos existentes ...
  revenue?: number;            // NUEVO
  ebitda?: number;             // NUEVO
  employees?: number;          // NUEVO
}
```

#### 3. Actualizar Formulario

**Archivo:** `src/components/admin/leads/PotentialBuyerForm.tsx`

**Cambios:**

1. **Hacer logo opcional** en el schema:
```typescript
logo_url: z.string().optional().or(z.literal('')),
```

2. **Añadir campos financieros** al schema:
```typescript
revenue: z.number().optional(),
ebitda: z.number().optional(),
employees: z.number().int().optional(),
```

3. **Añadir sección de datos financieros** en el UI:
```text
+---------------------------------------------+
| 📊 Datos Financieros                        |
+---------------------------------------------+
| Facturación €    | EBITDA €    | Empleados |
| [__1.500.000__]  | [__250.000__] | [__45__] |
+---------------------------------------------+
```

4. **Actualizar label del logo** (quitar asterisco):
```typescript
<ImageUploadField label="Logo" ... />  // Sin *
```

#### 4. Actualizar Edge Function

**Archivo:** `supabase/functions/potential-buyer-enrich/index.ts`

Añadir extracción de datos financieros numéricos en el análisis de imagen y texto.

---

### Estructura Visual del Formulario Actualizado

```text
+---------------------------------------------+
| Añadir Comprador Potencial                  |
+---------------------------------------------+
| 🪄 Búsqueda inteligente                     |
| [📷] [nombre o URL_______] [🔍]             |
+---------------------------------------------+
| Nombre de la empresa *                      |
| [CARPAS ZARAGOZA SL________________]       |
|                                             |
| Logo (opcional)                             |
| [🖼️ Subir imagen o URL______________]      |
|                                             |
| Sitio web                                   |
| [https://carpas-zaragoza.es________]       |
|                                             |
| Descripción                                 |
| [Fabricante de carpas modulares..._]       |
|                                             |
| ──────── Datos Financieros ────────         |
| Facturación €   EBITDA €      Empleados    |
| [_1.500.000_]   [_250.000_]   [_45_____]   |
|                                             |
| Rango Fact.     Estado                      |
| [1M-5M €___▼]   [Identificado▼]            |
|                                             |
| ──────── Datos de Contacto ────────         |
| Nombre del contacto                         |
| [Juan García___________________]           |
| Email              Teléfono                 |
| [j@carpas.es]      [+34 600...]            |
|                                             |
| [Cancelar]          [Añadir comprador]     |
+---------------------------------------------+
```

---

### Secuencia de Implementación

1. **Migración SQL**: Añadir columnas `revenue`, `ebitda`, `employees`
2. **Tipos**: Actualizar interfaces en TypeScript
3. **Formulario**: Modificar schema y añadir campos financieros
4. **Edge Function**: Actualizar para extraer datos financieros numéricos
5. **Desplegar**: Edge function actualizada

---

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `lead_potential_buyers` (tabla) | Añadir columnas: revenue, ebitda, employees |
| `src/types/leadPotentialBuyers.ts` | Añadir campos financieros a interfaces |
| `src/components/admin/leads/PotentialBuyerForm.tsx` | Logo opcional + sección financiera |
| `supabase/functions/potential-buyer-enrich/index.ts` | Extraer datos financieros numéricos |
