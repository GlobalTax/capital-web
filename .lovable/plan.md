

## Plan: Simplificar barra de stats del panel de leads

La barra superior muestra 4 métricas: **Total, Valoraciones, Únicos, Calificados**. "Únicos" y "Calificados" no aportan valor claro (Únicos es casi igual a Total, y Calificados siempre muestra 0).

### Cambio

**Archivo**: `src/components/admin/contacts-v2/ContactsFilters.tsx` (líneas 131-142)

Eliminar las dos métricas que no aportan valor:
- **Únicos** — redundante con Total
- **Calificados** — siempre muestra 0

La barra quedará solo con: **Total: 1397 | Valoraciones: 984**

