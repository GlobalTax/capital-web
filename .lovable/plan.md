

## Plan: Reorganizar INVERSORES con sub-grupos internos

### Objetivo
Dentro de la sección INVERSORES, agrupar los items en sub-categorías visibles al abrir el desplegable. Al expandir, se verán primero los 5 directorios principales, y debajo de cada uno sus herramientas asociadas.

### Estructura propuesta

```text
▼ INVERSORES
  ── Directorio Corporativos
  ── Capital Riesgo (CR)
       Portfolio CR
       Portfolio Scraper CR
       Apollo Import CR
       Fund Intelligence
  ── Search Funds (SF)
       Radar SF
       Adquisiciones SF
       Backers SF
       Matching Inbox SF
       Apollo Import SF
  ── Boutiques M&A
       Apollo Import M&A
  ── Rel. Oportunidades
```

### Cambios técnicos

**1. Ampliar el tipo `SidebarItem` en `sidebar-config.ts`**
- Añadir campo opcional `subItems: SidebarItem[]` para items que actúan como sub-grupo
- Los items con `subItems` se renderizan como mini-cabeceras con sus hijos debajo, indentados

**2. Reorganizar la sección INVERSORES en `sidebar-config.ts`**
- Directorio Corporativos → item simple (sin subItems, acceso directo)
- Capital Riesgo (CR) → item con subItems: Portfolio, Scraper, Apollo Import, Fund Intelligence
- Search Funds (SF) → item con subItems: Radar, Adquisiciones, Backers, Matching, Apollo Import
- Boutiques M&A → item con subItems: Apollo Import M&A
- Rel. Oportunidades → item simple

**3. Actualizar `SidebarSection.tsx`**
- Detectar items con `subItems` y renderizar como mini sub-grupo con label + items indentados
- Los items sin `subItems` se renderizan normalmente
- Sub-items tendrán padding-left extra para jerarquía visual

**4. Actualizar `SidebarMenuItem.tsx`**
- Añadir soporte para renderizar sub-grupos: el item padre es clickable (va a su URL) y debajo aparecen sus sub-items con indent

### Archivos a modificar
- `src/features/admin/config/sidebar-config.ts` — tipos + datos
- `src/components/admin/sidebar/SidebarSection.tsx` — renderizado sub-grupos
- `src/components/admin/sidebar/SidebarMenuItem.tsx` — soporte visual sub-items

