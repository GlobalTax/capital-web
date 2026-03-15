

## Plan: Añadir "Recursos" al TopBar

Insertar un nuevo enlace en la tabla `topbar_links` con label "Recursos" apuntando a `/recursos/biblioteca`, en posición 5 (al final, después de Search Funds). También actualizar los defaults en `useTopBarConfig.ts`.

### Cambios

1. **SQL Migration** — `INSERT INTO topbar_links` con:
   - label: `Recursos`
   - href: `/recursos/biblioteca`
   - position: `5`
   - is_active: `true`

2. **`src/hooks/useTopBarConfig.ts`** — Añadir `Recursos` a `DEFAULT_LINKS` como fallback.

