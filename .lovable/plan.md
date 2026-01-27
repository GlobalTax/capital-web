
# Plan: Corregir Error 409 al Eliminar Leads de Valoración

## Diagnóstico

Al eliminar registros de `company_valuations`, el servidor devuelve error **409 (Conflict)** porque:

```
"update or delete on table 'company_valuations' violates foreign key constraint 
'empresas_source_valuation_id_fkey' on table 'empresas'"
```

### Causa Raíz
La tabla `empresas` tiene una columna `source_valuation_id` que referencia a `company_valuations.id` con `ON DELETE NO ACTION`. Esto significa que si una empresa está vinculada a una valoración, **no se puede eliminar** la valoración hasta que se desvinculen.

### Tablas Afectadas
| Tabla | FK Constraint | ON DELETE |
|-------|---------------|-----------|
| empresas | source_valuation_id | NO ACTION ❌ |
| calendar_bookings | valuation_id | NO ACTION |
| form_sessions | valuation_id | NO ACTION |
| mandate_leads | valuation_id | NO ACTION |
| token_access_log | valuation_id | NO ACTION |

---

## Solución Propuesta

### Opción A: Modificar lógica de eliminación (RECOMENDADA)

Antes de eliminar un `company_valuations`, primero desvincular las referencias.

**Archivo a modificar:** `src/features/contacts/hooks/useContactActions.ts`

**Cambio en `bulkHardDelete`:**

Añadir lógica para desvincular empresas antes de eliminar valoraciones:

```typescript
// Para valoraciones, primero desvincular empresas
if (origin === 'valuation') {
  // Desvincular empresas que referencian estas valoraciones
  await supabase
    .from('empresas')
    .update({ source_valuation_id: null })
    .in('source_valuation_id', group.ids);
}
```

---

## Cambio Detallado

### Archivo: `src/features/contacts/hooks/useContactActions.ts`

**Antes (líneas 254-260):**
```typescript
// Process each origin
for (const [origin, group] of Object.entries(byOrigin)) {
  const table = tableMap[origin as ContactOrigin];
  const { error } = await (supabase as any)
    .from(table)
    .delete()
    .in('id', group.ids);
```

**Después:**
```typescript
// Process each origin
for (const [origin, group] of Object.entries(byOrigin)) {
  const table = tableMap[origin as ContactOrigin];
  
  // Para valoraciones, primero desvincular referencias FK
  if (origin === 'valuation') {
    // Desvincular empresas que referencian estas valoraciones
    await (supabase as any)
      .from('empresas')
      .update({ source_valuation_id: null })
      .in('source_valuation_id', group.ids);
    
    // También contactos CRM
    await (supabase as any)
      .from('contactos')
      .update({ valuation_id: null })
      .in('valuation_id', group.ids);
  }
  
  const { error } = await (supabase as any)
    .from(table)
    .delete()
    .in('id', group.ids);
```

---

## Impacto

| Aspecto | Valor |
|---------|-------|
| Archivos modificados | 1 |
| Líneas añadidas | ~15 |
| Riesgo | Bajo |
| Efecto secundario | Las empresas vinculadas perderán la referencia a la valoración eliminada (comportamiento esperado) |

---

## Sección Técnica

### ¿Por qué no cambiar la FK a ON DELETE SET NULL?

Esa sería una alternativa válida a nivel de base de datos, pero:
1. Requiere una migración SQL
2. Afecta comportamiento global (cualquier eliminación)
3. La solución en código da más control y logging

### Orden de operaciones
1. Desvincular `empresas.source_valuation_id`
2. Desvincular `contactos.valuation_id`
3. Eliminar `company_valuations`

Las otras tablas (`calendar_bookings`, `form_sessions`, `mandate_leads`, `token_access_log`) tienen datos que probablemente deberían eliminarse en cascada. Si fuera necesario, se añadirían más desvinculaciones, pero como no han causado errores hasta ahora, se asume que no tienen registros vinculados.
