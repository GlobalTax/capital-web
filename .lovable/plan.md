
# Plan: Añadir Búsqueda por Descripción en Corporate Buyers

## Resumen

Actualmente la búsqueda en `/admin/corporate-buyers` solo filtra por el nombre del comprador. El cambio extiende esta funcionalidad para buscar también en el campo `description`.

---

## Cambio Único

### Archivo: `src/hooks/useCorporateBuyers.ts`

**Ubicación**: Líneas 27-29

**Antes**:
```typescript
if (filters?.search) {
  query = query.ilike('name', `%${filters.search}%`);
}
```

**Después**:
```typescript
if (filters?.search) {
  query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
}
```

---

## Comportamiento Resultante

| Campo | Búsqueda Actual | Búsqueda Nueva |
|-------|-----------------|----------------|
| `name` | ✅ | ✅ |
| `description` | ❌ | ✅ |

Ahora al escribir "software" en el buscador, aparecerán:
- Compradores cuyo **nombre** contenga "software"
- Compradores cuya **descripción** mencione "software"

---

## Impacto

- **Archivos modificados**: 1
- **Líneas cambiadas**: 1
- **Riesgo**: Muy bajo (usa sintaxis estándar de Supabase)
- **Testing**: Buscar términos que aparezcan en descripciones pero no en nombres

---

## Sección Técnica

### Sintaxis Supabase `.or()`

La función `.or()` de Supabase permite combinar múltiples condiciones con operador OR. La sintaxis es:

```typescript
.or('campo1.operador.valor,campo2.operador.valor')
```

Esto genera una cláusula SQL equivalente a:
```sql
WHERE (name ILIKE '%search%' OR description ILIKE '%search%')
```

### Consideraciones de Performance

La tabla `corporate_buyers` tiene ~355 registros según la documentación. La búsqueda ILIKE en dos campos de texto es eficiente para este volumen. Si el dataset crece significativamente, se podría considerar un índice GIN/GIST o Full Text Search de PostgreSQL.
