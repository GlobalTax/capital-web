
# Añadir Ruta `/v2` para el Nuevo Diseño

## Objetivo

Crear una ruta profesional `/v2` que apunte al componente `NuevoDiseno` para compartir fácilmente el nuevo diseño con stakeholders.

## Cambio a Realizar

**Archivo:** `src/core/routing/AppRoutes.tsx`

Añadir una nueva ruta junto a la ruta de test existente:

```typescript
{/* === TEST ROUTES === */}
<Route path="/test/nuevo-diseno" element={<NuevoDiseno />} />

{/* === V2 PREVIEW (Nuevo diseño institucional) === */}
<Route path="/v2" element={<NuevoDiseno />} />
```

## URLs Resultantes

| Ruta | Uso |
|------|-----|
| `/test/nuevo-diseno` | Desarrollo interno |
| `/v2` | Compartir con stakeholders |

## URL para Compartir

Una vez implementado, podrás compartir:

**Preview:** `https://id-preview--c1cd2940-10b7-4c6d-900a-07b0f572e7b9.lovable.app/v2`

**Producción:** `https://webcapittal.lovable.app/v2`

## Impacto

- Sin riesgo para la home actual (`/`)
- Mismo componente, solo una nueva ruta de acceso
- Fácil de recordar y compartir
