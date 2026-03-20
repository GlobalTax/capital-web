

## Añadir "Registrar envío manual" en la pestaña 1r Envío

### Qué cambia

Se añade un botón de acción por fila en la tabla de `CampaignSummaryStep.tsx` (pestaña "1r Envío") para poder registrar envíos manuales directamente desde esta vista, reutilizando el diálogo `RegisterManualSendDialog` que ya existe.

### Cambios técnicos

**Archivo: `src/components/admin/campanas-valoracion/steps/CampaignSummaryStep.tsx`**

1. **Importar** `RegisterManualSendDialog`, `DropdownMenu` components, `MoreVertical` y `MailCheck` icons.

2. **Añadir estado** `manualSendTargets` (mismo patrón que en `MailStep`).

3. **Añadir columna de acciones** al final de la tabla (nueva `TableHead` vacía + `TableCell` con `DropdownMenu`):
   - Opción "Registrar envío manual" con icono `MailCheck`
   - El click en el dropdown se detiene con `e.stopPropagation()` para no disparar la navegación del `TableRow`

4. **Renderizar el diálogo** `RegisterManualSendDialog` al final del componente, con `onSuccess` que invalida las queries de `campaign-emails` y `campaign-companies`.

### Lo que NO cambia

- La navegación al hacer click en la fila sigue funcionando igual
- Todos los filtros, ordenación, KPIs y gráficos se mantienen intactos
- La funcionalidad existente en la pestaña "Lista de emails" (MailStep) no se toca

