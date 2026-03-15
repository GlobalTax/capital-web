

## Plan: Corregir enlaces rotos restantes en artículos del blog

### Problemas encontrados

1. **Artículo `que-es-ebitda`**: enlaza a `/servicios/valoracion-empresas` — esa ruta no existe. La correcta es `/servicios/valoraciones`.

2. **Artículo `vender-mi-empresa`**: enlaza a `/recursos/blog/valoracion-de-empresas` — ese post no existe. El post más relevante es `/recursos/blog/como-se-valora-una-empresa-claves-para-entenderlo-incluye-ejemplo-practico` o `/recursos/blog/valoracion-multiplos-guia-practica-empresarios`.

### Solución

**Doble capa** (igual que la corrección anterior):

1. **Migración SQL** — Corregir los enlaces en el contenido de la base de datos:
   - `REPLACE('/servicios/valoracion-empresas', '/servicios/valoraciones')` en `que-es-ebitda`
   - `REPLACE('/recursos/blog/valoracion-de-empresas', '/recursos/blog/como-se-valora-una-empresa-claves-para-entenderlo-incluye-ejemplo-practico')` en `vender-mi-empresa`

2. **Redirect de seguridad** en `AppRoutes.tsx` — Añadir `<Navigate>` para `/servicios/valoracion-empresas` → `/servicios/valoraciones` por si hay otros enlaces externos apuntando ahí.

### Archivos
- **Editar** `src/core/routing/AppRoutes.tsx` — 1 línea de redirect
- **Crear** migración SQL — 2 UPDATEs

