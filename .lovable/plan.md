

## Quitar badge "HOT" de Gestión de Leads en el sidebar

### Problema
El item "Leads" en la barra lateral del admin (`/admin/contacts`) tiene `badge: "URGENTE"` que se renderiza como un badge rojo "HOT" con icono de llama.

### Solución

**`src/features/admin/config/sidebar-config.ts`** (línea 100)
- Eliminar la línea `badge: "URGENTE"` del item de Leads.

Un cambio de 1 línea.

