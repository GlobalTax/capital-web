
# Plan: Vincular Valoración de s.navarro@obn.es al CRM

## Datos de la Valoración Encontrada

| Campo | Valor |
|-------|-------|
| ID | `90e847da-5756-41c2-93c6-70c31c779991` |
| Nombre | prueba |
| Email | s.navarro@obn.es |
| Teléfono | 620273552 |
| Empresa | Prueba |
| Sector | comercio |
| Empleados | 6-10 |
| Facturación | 2.222€ |
| EBITDA | 22€ |
| Valoración | 127€ |
| Fecha | 27/01/2026 17:25 |
| Email enviado | ✅ Sí |
| Empresa CRM | ❌ No vinculada |
| Contacto CRM | ❌ No vinculado |

---

## Operaciones SQL a Ejecutar

### 1. Crear registro en `empresas`

```sql
INSERT INTO empresas (
  nombre,
  sector,
  facturacion,
  revenue,
  ebitda,
  empleados,
  source_valuation_id,
  origen,
  source,
  source_id
) VALUES (
  'Prueba',
  'comercio',
  2222,
  2222,
  22,
  8,  -- Punto medio de rango 6-10
  '90e847da-5756-41c2-93c6-70c31c779991',
  'calculadora',
  'valuation',
  '90e847da-5756-41c2-93c6-70c31c779991'
)
RETURNING id;
```

### 2. Crear registro en `contactos`

```sql
INSERT INTO contactos (
  nombre,
  email,
  telefono,
  empresa_principal_id,
  valuation_id,
  source
) VALUES (
  'prueba',
  's.navarro@obn.es',
  '620273552',
  '<empresa_id_del_paso_1>',
  '90e847da-5756-41c2-93c6-70c31c779991',
  'valuation'
)
RETURNING id;
```

### 3. Actualizar `company_valuations` con los enlaces

```sql
UPDATE company_valuations
SET 
  empresa_id = '<empresa_id>',
  crm_contacto_id = '<contacto_id>',
  crm_synced_at = NOW()
WHERE id = '90e847da-5756-41c2-93c6-70c31c779991';
```

---

## Resultado Esperado

| Tabla | Acción | Estado |
|-------|--------|--------|
| `empresas` | Nuevo registro creado | ✅ |
| `contactos` | Nuevo registro creado | ✅ |
| `company_valuations` | Actualizado con FK | ✅ |

---

## Verificación Post-Ejecución

1. La valoración aparecerá en `/admin/empresas` con sus datos financieros
2. El contacto aparecerá en `/admin/contacts` vinculado a la empresa
3. El registro tendrá trazabilidad completa desde la calculadora hasta el CRM

---

## Sección Técnica

### Migración de Datos

Se usará el **insert tool** (no migration) ya que esto es manipulación de datos, no cambio de schema.

### Mapeo de Empleados

El rango `6-10` se convierte a `8` (punto medio) siguiendo el estándar documentado en `memory/admin/empresas-financial-data-mapping-standard`.

### Integridad Referencial

- `empresas.source_valuation_id` → `company_valuations.id`
- `contactos.empresa_principal_id` → `empresas.id`
- `contactos.valuation_id` → `company_valuations.id`
- `company_valuations.empresa_id` → `empresas.id`
- `company_valuations.crm_contacto_id` → `contactos.id`
