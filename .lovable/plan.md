

## Aplicar las 6 Mejoras Pendientes de la PR

### Contexto
Estas mejoras fueron propuestas en una PR de GitHub pero nunca llegaron al codigo de Lovable. Son mejoras de rendimiento, UX y seguridad.

---

### Cambios

**1. KanbanView.tsx -- useMemo para rendimiento**
- Envolver `columnItems` en `useMemo` para evitar recalcular las columnas en cada render
- Dependencias: `[items]`

**2. CalendarView.tsx -- Normalizacion de fechas**
- Cambiar linea 58 de `const key = date` a `const key = format(new Date(date), 'yyyy-MM-dd')` para normalizar fechas y evitar problemas de agrupacion cuando el formato varia

**3. ListView.tsx -- Confirmacion antes de eliminar en masa**
- Anadir `window.confirm()` en `bulkDelete` antes de ejecutar la eliminacion
- Mensaje: "Vas a eliminar X elementos. Esta accion no se puede deshacer."

**4. ContentCalendarManager.tsx -- onError con toast en mutaciones**
- Anadir callbacks `onError` en las llamadas a `updateItem.mutate`, `createItem.mutate` y `deleteItem.mutate`
- Mostrar toast de error con `sonner` cuando falle una operacion

**5. newsletterExport.ts -- Bloqueo de protocolo javascript:**
- Sanitizar URLs de imagenes en `extractImagesFromHtml`: rechazar cualquier src que empiece por `javascript:`
- Sanitizar el href del link de descarga para prevenir inyeccion

**6. send-form-notifications/index.ts -- Eliminacion de PII de los logs**
- Revisar todos los `console.log` del archivo y eliminar datos personales (email, nombre, telefono) de los mensajes de log
- Dejar solo IDs y tipos de formulario en los logs

---

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/components/admin/content-calendar/KanbanView.tsx` | useMemo en columnItems |
| `src/components/admin/content-calendar/CalendarView.tsx` | Normalizar fecha con format() |
| `src/components/admin/content-calendar/ListView.tsx` | confirm() en bulkDelete |
| `src/components/admin/content-calendar/ContentCalendarManager.tsx` | onError + toast en mutaciones |
| `src/utils/newsletterExport.ts` | Bloquear protocolo javascript: en URLs |
| `supabase/functions/send-form-notifications/index.ts` | Limpiar PII de console.log |

