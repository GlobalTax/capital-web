

## Auto-sincronizar toda la información del lead al perfil de empresa

### Problema
Cuando llega un lead con facturación, EBITDA, empleados, CIF, sector, etc., esos datos se usan en el email de notificación pero **no se escriben en la empresa**. El perfil de GoDeal aparece vacío porque:

1. Si la empresa ya existe, el edge function solo lee su ID — no actualiza nada
2. Si la empresa se crea nueva, solo guarda `nombre`, `cif` y `facturacion` — sin EBITDA, empleados ni sector
3. El trigger SQL `auto_link_contact_lead_to_empresa` crea empresas con solo `nombre` y `sector`
4. Los datos de empleados (`employeeCount`, `company_size`) nunca se extraen del formulario

### Cambios

**1. Edge Function `send-form-notifications/index.ts`**

En `upsertLeadFromForm`, mejorar el bloque de empresa (líneas ~1240-1263):

- **Extraer empleados** del formData (`employeeCount`, `company_size`, `employees`)
- **Cuando la empresa ya existe**: hacer UPDATE con COALESCE para rellenar campos vacíos (facturación, ebitda, empleados, cif, sector) sin sobreescribir datos existentes
- **Cuando se crea nueva**: incluir todos los campos disponibles (ebitda, empleados, sector, cif, facturación)

```typescript
// Empresa existente → enriquecer con datos del lead
if (existingEmpresa) {
  empresaId = existingEmpresa.id;
  await supabase.from('empresas').update({
    facturacion: revenue || undefined,  // COALESCE en SQL
    revenue: revenue || undefined,
    ebitda: ebitda || undefined,
    empleados: employeeCount || undefined,
    cif: cif || undefined,
    sector: serviceType || undefined,
  }).eq('id', empresaId);
}
```

Se usará una query con `COALESCE` (o condición `IS NULL`) para no pisar datos ya existentes.

- **Cuando se actualiza un lead existente** (líneas ~1190-1216): también sincronizar financials a la empresa vinculada

**2. Trigger SQL `auto_link_contact_lead_to_empresa`**

Ampliar para que cuando cree una empresa nueva, incluya los campos financieros disponibles en `contact_leads` (actualmente solo tiene `company` y `service_type`, pero el CIF sí está disponible):

- Incluir `cif` al crear empresa
- Incluir `company_size` si existe

**3. Trigger SQL `sync_contact_lead_to_contacto`**

Añadir sincronización de `telefono` y `cargo` al contacto, para que la tarjeta de "Contacto Principal" también muestre datos completos.

### Resultado
Cuando entre un lead con datos financieros, el perfil de empresa en GoDeal mostrará automáticamente: facturación, EBITDA, empleados, CIF, sector y contacto principal — sin intervención manual.

