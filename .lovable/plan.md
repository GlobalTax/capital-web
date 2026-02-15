

## Destacar el sector Seguridad en el menu de navegacion

### Cambio

En el dropdown de "Sectores" del menu desktop, la card de **Seguridad** tendra un estilo diferenciado para destacar visualmente sobre el resto. Se aplicara un borde mas oscuro, un fondo sutil y una etiqueta "Destacado" para que el usuario lo identifique como sector prioritario.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/header/AdvancedDesktopNavigation.tsx` | Condicionar el estilo de la card cuando `sector.id === 'seguridad'`: borde `border-slate-800`, fondo `bg-slate-50`, y badge "Destacado" |
| `src/components/header/AdvancedMobileNavigation.tsx` | Anadir un indicador visual (dot o badge) junto al label "Seguridad" en la lista movil |

### Detalle tecnico

**Desktop** (`SectoresMenu`, lineas 78-96):
- Si `sector.id === 'seguridad'`, aplicar clases diferenciadas: `border-slate-800 bg-slate-50/50` en lugar de `border-gray-200`
- Anadir un pequeno badge `<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">Destacado</span>` junto al nombre

**Movil** (`AdvancedMobileNavigation`, lineas 121-130):
- Si `item.id === 'seguridad'`, anadir un dot o el mismo badge junto al label para mantener coherencia

### Resultado visual
- Las 9 cards de sector restantes mantienen su estilo actual (borde gris claro, fondo blanco)
- La card de Seguridad destaca con borde oscuro, fondo ligeramente gris y badge "Destacado"
- En movil, el item de Seguridad lleva un indicador visual

