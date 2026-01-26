
## Plan: Separar Facturación y EBITDA en Columnas Individuales

Se reemplazará la columna combinada "Fin." por dos columnas independientes para "Facturación" y "EBITDA", mejorando la visibilidad de estos datos financieros clave.

---

### Cambio Visual

**Antes:**
```text
| ... | Sector | Estado | Fin.        | Apollo | Fecha | ... |
| ... | ...    | ...    | 1.5M€ · 80K€| ...    | ...   | ... |
```

**Después:**
```text
| ... | Sector | Estado | Fact.  | EBITDA | Apollo | Fecha | ... |
| ... | ...    | ...    | 1.5M€  | 80K€   | ...    | ...   | ... |
```

---

### Archivos a Modificar

#### 1. `src/components/admin/contacts/ContactTableRow.tsx`

**Cambios en COL_STYLES:**
- Eliminar: `financials: { minWidth: 100, flex: '1 0 100px' }`
- Añadir: `revenue: { minWidth: 70, flex: '0 0 70px' }`
- Añadir: `ebitda: { minWidth: 70, flex: '0 0 70px' }`

**Cambios en JSX del Row:**
- Reemplazar la columna "financials" combinada por dos columnas separadas
- Columna Facturación: Muestra `revenue` formateado o "—"
- Columna EBITDA: Muestra `ebitda` formateado o "—"
- Mantener tooltip con información adicional (valoración, empleados)

#### 2. `src/components/admin/contacts/LinearContactsTable.tsx`

**Cambios en MIN_TABLE_WIDTH:**
- Actualizar de `1032` a `1072` (40px adicionales para la nueva columna)

**Cambios en TableHeader:**
- Reemplazar header "Fin." por dos headers: "Fact." y "EBITDA"

---

### Detalles Técnicos

**Nuevos estilos de columna:**
```typescript
export const COL_STYLES = {
  // ... otras columnas ...
  revenue: { minWidth: 70, flex: '0 0 70px' },
  ebitda: { minWidth: 70, flex: '0 0 70px' },
  // ... resto de columnas ...
};
```

**Columna Facturación (JSX):**
```tsx
<div className="px-1.5" style={{ flex: COL_STYLES.revenue.flex, minWidth: COL_STYLES.revenue.minWidth }}>
  {revenue ? (
    <span className="text-[10px] text-foreground">{revenue}</span>
  ) : (
    <span className="text-[10px] text-muted-foreground/50">—</span>
  )}
</div>
```

**Columna EBITDA (JSX):**
```tsx
<div className="px-1.5" style={{ flex: COL_STYLES.ebitda.flex, minWidth: COL_STYLES.ebitda.minWidth }}>
  {ebitda ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-[10px] text-foreground">{ebitda}</span>
      </TooltipTrigger>
      <TooltipContent>
        {valuation && <div>Valoración: {valuation}</div>}
        {contact.employee_range && <div>Empleados: {contact.employee_range}</div>}
      </TooltipContent>
    </Tooltip>
  ) : (
    <span className="text-[10px] text-muted-foreground/50">—</span>
  )}
</div>
```

**Header actualizado:**
```tsx
<div className="..." style={{ flex: COL_STYLES.revenue.flex, minWidth: COL_STYLES.revenue.minWidth }}>
  Fact.
</div>
<div className="..." style={{ flex: COL_STYLES.ebitda.flex, minWidth: COL_STYLES.ebitda.minWidth }}>
  EBITDA
</div>
```

---

### Actualización del Memo Comparison

Añadir a la comparación de props memoizadas:
```typescript
prevProps.contact.revenue === nextProps.contact.revenue &&
prevProps.contact.ebitda === nextProps.contact.ebitda &&
prevProps.contact.empresa_facturacion === nextProps.contact.empresa_facturacion &&
```

---

### Resultado Esperado

- **Facturación**: Columna dedicada mostrando el revenue formateado (ej: "1.5M€", "500K€")
- **EBITDA**: Columna dedicada con tooltip para mostrar valoración y empleados como información adicional
- **Ancho total tabla**: Aumenta 40px para acomodar la columna extra
- **Performance**: Sin impacto - mismos datos, diferente disposición

---

### Consideraciones

- Los datos ya existen en el modelo `UnifiedContact` (`revenue`, `ebitda`, `empresa_facturacion`)
- No se requieren cambios en la base de datos
- El formateo de moneda existente (`formatCurrency`) se reutiliza
- La información de valoración y empleados se mantiene accesible via tooltip en la columna EBITDA
