

## Hacer más visibles el formulario y el canal de adquisición en las tarjetas del Pipeline

### Cambios

**1. `PipelineCard.tsx`** — Mostrar canal + mejorar colores de ambos badges

- Añadir prop `channelName?: string`
- Cambiar el badge del formulario de `variant="outline" text-muted-foreground` a un color más llamativo (azul: `bg-blue-100 text-blue-700 border-blue-200`)
- Añadir badge del canal con color diferenciado (violeta: `bg-purple-100 text-purple-700 border-purple-200`) con icono `📡` o similar
- Añadir `channelName` al memo comparison

**2. `PipelineColumn.tsx`** — Recibir y pasar `channelsMap`

- Añadir prop `channelsMap?: Map<string, string>`
- Pasar `channelName={lead.acquisition_channel_id && channelsMap ? channelsMap.get(lead.acquisition_channel_id) : undefined}` a cada `PipelineCard`

**3. `LeadsPipelineView.tsx`** — Crear el mapa de canales y pasarlo

- Crear `channelsMap` memoizado a partir de `channels` (ya cargados con `useAcquisitionChannels`): `new Map(channels.map(c => [c.id, c.name]))`
- Pasarlo a cada `PipelineColumn`

### Resultado
Cada tarjeta mostrará el formulario (badge azul) y el canal de adquisición (badge violeta), ambos claramente visibles de un vistazo.

