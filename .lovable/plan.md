
# Plan: Añadir Sector "Distribución" y Estandarizar Uso de Sectores Dinámicos

## Diagnóstico Completado

### Estado Actual del Sistema de Sectores

| Componente | Estado |
|------------|--------|
| Tabla `sectors` en DB | ✅ Existe con 22 sectores activos |
| Hook `useSectors.tsx` | ✅ Carga sectores desde DB dinámicamente |
| Componente `SectorSelect` | ✅ Reutilizable, conectado a DB |
| Panel admin `/admin/sectores` | ✅ SectorManagement permite CRUD de sectores |
| Sector "Distribución" | ❌ **NO existe** |

### Formularios que Necesitan Migración a Sectores Dinámicos

| Formulario | Archivo | Problema |
|------------|---------|----------|
| Nueva Empresa/Target | `CompanyFormDialog.tsx` | Usa `<Input>` texto libre |
| Mandato de Compra | `BuySideMandateModal.tsx` | Usa array HARDCODED `SECTORS` |
| Adquisición SF | `SFAcquisitionEditModal.tsx` | Usa `<Input>` texto libre |
| Participada CR | `CRPortfolioEditModal.tsx` | Usa `<Input>` texto libre |

---

## Implementación

### Paso 1: Insertar Sector "Distribución" en DB

Ejecutar en Supabase:

```sql
INSERT INTO sectors (name_es, name_en, slug, is_active, display_order)
VALUES ('Distribución', 'Distribution', 'distribucion', true, 7);
```

Esto añade "Distribución" después de "Energía y Renovables" (display_order 7).

---

### Paso 2: Migrar CompanyFormDialog a SectorSelect

**Archivo**: `src/components/admin/companies/CompanyFormDialog.tsx`

Cambiar de Input de texto libre a `SectorSelect`:

**Antes (líneas 201-213)**:
```tsx
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
```

**Después**:
```tsx
import SectorSelect from '@/components/admin/shared/SectorSelect';

<FormField
  control={form.control}
  name="sector"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Sector *</FormLabel>
      <FormControl>
        <SectorSelect
          value={field.value}
          onChange={field.onChange}
          placeholder="Selecciona un sector"
          className="w-full"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### Paso 3: Migrar BuySideMandateModal a SectorSelect

**Archivo**: `src/components/admin/buyside/BuySideMandateModal.tsx`

Cambiar de array hardcoded a `SectorSelect`:

**Antes (líneas 43-58)**:
```tsx
const SECTORS = [
  'Tecnología',
  'Salud',
  'Industrial',
  // ... array hardcoded
];
```

**Después**:
- Eliminar el array `SECTORS`
- Importar y usar `SectorSelect`
- Cambiar el `<select>` nativo por `SectorSelect`

```tsx
import SectorSelect from '@/components/admin/shared/SectorSelect';

// En el formulario, líneas ~224-237:
<div>
  <Label htmlFor="sector">Sector *</Label>
  <SectorSelect
    value={watch('sector')}
    onChange={(value) => setValue('sector', value)}
    placeholder="Selecciona un sector"
    required
  />
  {errors.sector && (
    <p className="text-sm text-destructive mt-1">{errors.sector.message}</p>
  )}
</div>
```

---

### Paso 4: Migrar SFAcquisitionEditModal a SectorSelect

**Archivo**: `src/components/admin/search-funds/SFAcquisitionEditModal.tsx`

Cambiar Input de texto libre a `SectorSelect`:

**Antes (líneas 205-217)**:
```tsx
<FormField
  control={form.control}
  name="sector"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Sector</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Tecnología" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Después**:
```tsx
import SectorSelect from '@/components/admin/shared/SectorSelect';

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
```

---

### Paso 5: Migrar CRPortfolioEditModal a SectorSelect

**Archivo**: `src/components/admin/capital-riesgo/CRPortfolioEditModal.tsx`

Cambiar Input de texto libre a `SectorSelect`:

**Antes (líneas 212-224)**:
```tsx
<FormField
  control={form.control}
  name="sector"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Sector</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Tecnología" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Después**:
```tsx
import SectorSelect from '@/components/admin/shared/SectorSelect';

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
```

---

## Resumen de Archivos a Modificar

| Archivo | Cambio | Tipo |
|---------|--------|------|
| BD `sectors` | INSERT "Distribución" | SQL |
| `CompanyFormDialog.tsx` | Input → SectorSelect | Migración |
| `BuySideMandateModal.tsx` | SECTORS array → SectorSelect | Migración |
| `SFAcquisitionEditModal.tsx` | Input → SectorSelect | Migración |
| `CRPortfolioEditModal.tsx` | Input → SectorSelect | Migración |

---

## Compatibilidad con Histórico

- **Preservado**: Los sectores ya existentes en registros antiguos se mantienen como strings en sus columnas
- **Display**: `SectorSelect` usa `name_es` como valor, que coincide con los strings históricos
- **Nuevos registros**: Usarán nombres consistentes de la tabla `sectors`
- **Filtros**: Los filtros de sector en listados seguirán funcionando porque comparan strings

---

## Resultado Final

1. **Sector "Distribución"** disponible en todos los formularios
2. **Todos los formularios de Sector** usan datos dinámicos desde DB
3. **Panel Admin** (`/admin/sectores`) permite añadir/editar sectores sin código
4. **Cero roturas** en datos históricos

---

## Verificación Rápida (2 minutos)

1. Ir a `/admin/sectores` → Verificar "Distribución" aparece
2. Ir a `/admin/empresas` → Crear "Nueva Empresa" → Verificar dropdown con "Distribución"
3. Crear empresa con sector "Distribución" → Verificar se guarda correctamente
4. Ir a `/admin/mandatos-compra` → Crear nuevo mandato → Verificar dropdown dinámico
5. Crear un sector nuevo desde `/admin/sectores` (ej: "Packaging") → Verificar aparece automáticamente en formularios
