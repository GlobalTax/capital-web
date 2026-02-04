
# Plan: Corrección del Error "tried to subscribe multiple times"

## Problema Identificado

El error `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance` ocurre en el componente `ContactsStatsPanel` debido a un problema con la gestión de suscripciones de Supabase Realtime.

### Causa Raíz

En `src/hooks/useUnifiedContacts.tsx` (línea 1207-1208):
```tsx
const channel = supabase
  .channel('leads-prospects-sync')  // ← Nombre FIJO del canal
```

Cuando el `AdminErrorBoundary` captura un error y recrea el árbol de componentes:
1. El componente `LinearContactsManager` se desmonta
2. Antes de que `supabase.removeChannel(channel)` se ejecute completamente
3. El nuevo componente se monta e intenta crear un canal con el mismo nombre
4. Supabase rechaza porque ya existe una suscripción activa con ese nombre

### Flujo del Error

```text
1. Error en ContactsStatsPanel
2. AdminErrorBoundary lo captura
3. React desmonta el árbol: LinearContactsManager → useUnifiedContacts cleanup scheduled
4. React remonta el árbol: LinearContactsManager → useUnifiedContacts → .channel('leads-prospects-sync')
5. El cleanup anterior aún no se ejecutó
6. Supabase: "tried to subscribe multiple times" ❌
```

## Solución

### Archivo: `src/hooks/useUnifiedContacts.tsx`

Cambiar el nombre del canal para que sea único por instancia usando un ID único:

| Línea | Antes | Después |
|-------|-------|---------|
| 1206-1208 | Nombre fijo del canal | Usar `useId()` o `Date.now()` para generar nombre único |

**Cambios específicos:**

1. Importar `useId` de React (o usar `useRef` para generar ID)
2. Crear el canal con nombre único para cada instancia del hook

```tsx
// Antes:
useEffect(() => {
  const channel = supabase
    .channel('leads-prospects-sync')
    ...

// Después:
import { useState, useEffect, useId } from 'react';
...

// En el hook:
const channelId = useId();

useEffect(() => {
  const channel = supabase
    .channel(`leads-prospects-sync-${channelId}`)
    ...
```

**Alternativa con useRef (más compatible):**
```tsx
const channelIdRef = useRef(`leads-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

useEffect(() => {
  const channel = supabase
    .channel(channelIdRef.current)
    ...
```

## Sección Técnica

### Por Qué Esto Soluciona el Problema

1. **Nombre único por instancia**: Cada vez que el hook se monta, tiene su propio canal con nombre único
2. **Sin colisiones**: Aunque dos instancias existan brevemente durante el remount del Error Boundary, tienen nombres diferentes
3. **Cleanup correcto**: El cleanup eventual del canal anterior no afecta al nuevo

### Patrón Recomendado para Supabase Realtime

```typescript
// ✅ CORRECTO: Nombre único por instancia
const channelIdRef = useRef(`my-channel-${Date.now()}-${Math.random().toString(36).slice(2)}`);

useEffect(() => {
  const channel = supabase
    .channel(channelIdRef.current)
    .on('postgres_changes', { ... }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

```typescript
// ❌ INCORRECTO: Nombre fijo (puede colisionar)
useEffect(() => {
  const channel = supabase
    .channel('fixed-channel-name')  // ← Problema si se remonta antes del cleanup
    .on('postgres_changes', { ... }, callback)
    .subscribe();
  ...
}, []);
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useUnifiedContacts.tsx` | Generar nombre único de canal con `useRef` |

## Impacto

- **Bajo riesgo**: Solo cambia el nombre del canal, la lógica permanece igual
- **Sin breaking changes**: No afecta a ningún consumidor del hook
- **Mejor resiliencia**: El hook soportará remounts sin errores

## Resultado Esperado

1. El error "tried to subscribe multiple times" desaparecerá
2. Los componentes podrán remontarse sin problemas después de errores capturados por Error Boundaries
3. La funcionalidad de Realtime continuará funcionando correctamente
