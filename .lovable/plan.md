

## Plan: Sistema de programación de envíos anti-spam

### Contexto
Actualmente los emails se envían en ráfaga con solo 1.5s de delay entre cada uno. No hay opción de programar envíos futuros ni limitar la tasa de envío. Esto puede provocar que proveedores como Gmail/Outlook marquen los emails como spam.

### Solución: Panel de configuración de envío con 3 controles

**Archivo principal: `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx`**

Se añade un panel de configuración colapsable antes del botón "Enviar" con 3 opciones:

**1. Intervalo entre emails**
- Selector con opciones: 15s, 30s, 1min, 2min, 5min (actualmente hardcoded 1.5s)
- Se aplica al bucle `handleSendEmails` reemplazando el `setTimeout(r, 1500)` por el valor seleccionado
- También aplica a followups en `useCampaignFollowups.ts` y `useCampaignEmails.ts`

**2. Límite por hora**
- Input numérico: máximo emails/hora (ej: 30, 50, 100)
- Cuando se alcanza el límite, el sistema pausa automáticamente hasta que pase la ventana de 1 hora
- Se calcula: si se han enviado N emails en los últimos 60min, pausar hasta que el slot se libere

**3. Programar fecha/hora**
- DateTimePicker para elegir cuándo empezar el envío
- Funciona 100% client-side: al pulsar "Programar envío", se muestra un countdown y al llegar la hora se dispara el bucle de envío automáticamente
- La pestaña del navegador debe permanecer abierta (se avisa al usuario)
- Si se cierra el navegador, el envío se detiene (se guarda progreso como `paused`)

### Implementación técnica

**Nuevo componente: `src/components/admin/campanas-valoracion/shared/SendScheduleConfig.tsx`**
- Card con Collapsible que contiene los 3 controles
- Estado devuelto via callback: `{ intervalMs: number, maxPerHour: number | null, scheduledAt: Date | null }`

**Cambios en `ProcessSendStep.tsx`:**
- Nuevo estado `sendConfig` con los 3 parámetros
- En `handleSendEmails`:
  - Si `scheduledAt` está en el futuro: iniciar countdown, usar `setTimeout` hasta la hora indicada
  - Reemplazar delay fijo `1500` por `sendConfig.intervalMs`
  - Añadir throttle por hora: tracking de timestamps de envío, pausa automática cuando se alcanza `maxPerHour`
  - Mostrar en la barra de progreso el estado: "Esperando (límite/hora alcanzado)" o "Programado para HH:MM"

**Cambios en `DocumentSendStep.tsx`:**
- Mismo panel de configuración antes del botón de envío masivo

**Cambios en hooks (`useCampaignEmails.ts`, `useCampaignFollowups.ts`):**
- Aceptar `intervalMs` como parámetro opcional en las funciones de envío masivo
- Añadir delay entre cada invocación del Edge Function

### UI del panel

```text
┌─ ⚙️ Configuración de envío ──────────────────────┐
│                                                    │
│  Intervalo entre emails:  [▼ 30 segundos]          │
│                                                    │
│  Límite por hora:  [50] emails/hora                │
│  ☐ Sin límite                                      │
│                                                    │
│  Programar envío:                                  │
│  ☐ Enviar ahora                                    │
│  ○ Programar para: [📅 17 Mar 2026] [09:00]        │
│                                                    │
│  ⚠️ La pestaña debe permanecer abierta             │
└────────────────────────────────────────────────────┘
```

### No se toca
- Edge Function `send-campaign-outbound-email` (sin cambios server-side)
- Importador, configuración, notas
- Lógica de tracking/webhooks

