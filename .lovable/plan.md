

## Añadir columna "Web" a la tabla de empresas

### Cambio en `ContactListDetailPage.tsx`

**1. Añadir `<TableHead>` para Web** (después de "Director Ejecutivo", línea ~1001)
- Nueva columna: `<TableHead>Web</TableHead>`

**2. Añadir `<TableCell>` para Web** (después de la celda de Director Ejecutivo, línea ~1054)
- Mostrar la URL como enlace clicable con icono `Link2`
- Si no hay web, mostrar "—"

```text
<TableCell className="text-sm text-muted-foreground">
  {company.web ? (
    <a href={url} target="_blank" className="hover:text-primary flex items-center gap-1">
      <Link2 className="h-3.5 w-3.5" />
      <span className="truncate max-w-[150px]">{domainOnly}</span>
    </a>
  ) : '—'}
</TableCell>
```

### Fichero editado
- `src/pages/admin/ContactListDetailPage.tsx` — 2 inserciones (header + celda)

