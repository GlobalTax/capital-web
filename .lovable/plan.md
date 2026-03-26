

## Plan: Actualizar enlace de Global.nrro a https://nvrro.es/

El enlace de "Global.nrro" / "Navarro Tax & Legal" aparece en 3 sitios del código y en la base de datos.

### Cambios

**1. Migración SQL** — Actualizar la URL en `topbar_group_companies`
```sql
UPDATE public.topbar_group_companies SET url = 'https://nvrro.es/' WHERE name = 'Navarro Tax & Legal';
```
Esto corrige el enlace del dropdown del TopBar (la imagen que has subido).

**2. `src/components/ui/footer-section.tsx`** — Cambiar `https://www.nrro.es/` → `https://nvrro.es/`

**3. `src/components/Team.tsx`** — Cambiar `https://www.nrro.es/` → `https://nvrro.es/`

### Archivos afectados
| Archivo | Cambio |
|---------|--------|
| Nueva migración SQL | UPDATE url en `topbar_group_companies` |
| `src/components/ui/footer-section.tsx` | URL del footer |
| `src/components/Team.tsx` | URL en sección de equipo |

