
# Plan: Arreglar Scroll Vertical Bloqueado en CRM

## Diagnóstico Completado

### Causa Raíz Principal

El problema de scroll bloqueado se origina en el **AdminLayout**, donde hay una cascada de `overflow-hidden` que bloquea el scroll en todo el CRM:

```tsx
// AdminLayout.tsx - Línea 115
<div className="h-screen h-[100dvh] flex w-full bg-[hsl(var(--linear-bg))] overflow-hidden">
  
  // Línea 118 - SEGUNDO overflow-hidden
  <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden">
    
    // Línea 129 - TERCER overflow-hidden en el contenedor de contenido
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 w-full max-w-full flex flex-col p-2 sm:p-3 md:p-4">
        {children}  // ← Las páginas NO tienen scroll disponible
      </div>
    </div>
  </SidebarInset>
</div>
```

### Problema Técnico

1. **Triple `overflow-hidden`** en contenedores anidados bloquea cualquier scroll
2. **Falta `overflow-y-auto`** en el contenedor principal de contenido (`{children}`)
3. **Las páginas no tienen un scroll container** - confían en que el layout proporcione uno

### Páginas Afectadas (Ejemplos)

| Ruta | Problema Específico |
|------|---------------------|
| `/admin/valoraciones-pro/:id` | Formulario largo sin scroll (usa `p-6 space-y-6` sin overflow) |
| `/admin/cr-fund/:id` | Tiene `h-full` pero depende del padre para scroll |
| `/admin/sf-acquisition/:id` | Usa `flex flex-1 overflow-hidden` que necesita scroll interno |
| Cualquier página con contenido >100vh | Bloqueada por `overflow-hidden` del layout |

---

## Solución Global

### 1. Modificar AdminLayout.tsx (Cambio Principal)

Cambiar el contenedor de contenido para que sea el **único scroll container**:

**Antes (líneas 128-133):**
```tsx
{/* Main content area - responsive padding */}
<div className="flex-1 overflow-hidden flex flex-col">
  <div className="flex-1 min-h-0 w-full max-w-full flex flex-col p-2 sm:p-3 md:p-4">
    {children}
  </div>
</div>
```

**Después:**
```tsx
{/* Main content area - SCROLLABLE */}
<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
  <div className="min-h-full w-full max-w-full p-2 sm:p-3 md:p-4">
    {children}
  </div>
</div>
```

**Cambios clave:**
- `overflow-hidden` → `overflow-y-auto overflow-x-hidden` (habilita scroll vertical)
- `min-h-0` obligatorio para que flex items puedan colapsar y scrollear
- Quitar `flex flex-col` del wrapper interno (no necesario, simplifica)
- Cambiar `flex-1` por `min-h-full` en el div interior para que crezca con contenido

### 2. Verificar SidebarInset (sidebar.tsx)

El `SidebarInset` ya tiene `overflow-hidden` en la línea 324:

```tsx
// sidebar.tsx línea 323-324
className={cn(
  "relative flex h-svh min-h-svh flex-1 flex-col bg-background overflow-hidden",
```

Esto está BIEN porque el scroll debe estar en el hijo (`main content area`), no en el SidebarInset. Pero debemos asegurar que el hijo interno pueda scrollear.

---

## Archivos a Modificar

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `src/features/admin/components/AdminLayout.tsx` | Cambiar contenedor de contenido a scrollable | **GLOBAL** - arregla todas las rutas |

**Solo 1 archivo, ~4 líneas cambiadas.**

---

## Política de Scroll Definida

```text
┌─────────────────────────────────────────────────────────────┐
│                    VIEWPORT (100vh)                         │
├────────────────────┬────────────────────────────────────────┤
│                    │  HEADER (fixed height, shrink-0)       │
│                    ├────────────────────────────────────────┤
│   SIDEBAR          │                                        │
│   (fixed)          │   MAIN CONTENT AREA                    │
│   h-svh            │   (flex-1, min-h-0, overflow-y-auto)   │
│   overflow-y-auto  │                                        │
│                    │   ← ÚNICO SCROLL CONTAINER ←            │
│                    │                                        │
│                    │   Páginas renderizan aquí sin          │
│                    │   preocuparse por overflow             │
│                    │                                        │
└────────────────────┴────────────────────────────────────────┘
```

**Regla crítica:** `min-h-0` es obligatorio en flex items para que `overflow-y-auto` funcione.

---

## Verificación Post-Implementación

### Rutas a Probar

| Ruta | Verificar |
|------|-----------|
| `/admin/contacts` | Scroll en tabla virtualizada (ya tiene su propio overflow interno) |
| `/admin/valoraciones-pro/:id` | Formulario largo debe scrollear |
| `/admin/cr-fund/:id` | Tabs con contenido largo deben scrollear |
| `/admin/sf-acquisition/:id` | Layout con sidebar debe permitir scroll en panel derecho |
| `/admin/valoraciones-pro` | Listado con tabla |
| `/admin/operations/dashboard` | Dashboard con múltiples cards |

### Criterios de Éxito

1. Scroll vertical funciona en TODAS las rutas con contenido >100vh
2. NO hay doble scroll (solo 1 scrollbar visible)
3. Sidebar permanece fija
4. Header permanece fijo
5. Tablas virtualizadas (contacts, empresas) mantienen su scroll interno

---

## Páginas con Scroll Interno (Sin Cambios Necesarios)

Estas páginas ya manejan su propio scroll interno y seguirán funcionando:

- **ContactsPage**: Usa CSS Grid con `overflow-hidden` en el contenedor y scroll interno en tabla
- **CRFundDetailPage**: Tiene `overflow-auto` en el panel derecho (línea 153)
- **SFAcquisitionDetailPage**: Tiene `overflow-hidden` pero contenido interno no excede viewport

El fix global les proporciona un scroll de respaldo si el contenido excede su container.

---

## Resumen Técnico

| Elemento | Estado Actual | Cambio |
|----------|---------------|--------|
| Layout externo | `overflow-hidden` | Sin cambio (mantiene) |
| SidebarInset | `overflow-hidden` | Sin cambio (correcto) |
| Contenedor de contenido | `overflow-hidden flex flex-col` | → `overflow-y-auto min-h-0` |
| Div interior | `flex-1 min-h-0 flex flex-col` | → `min-h-full` |

**Total: 4 líneas modificadas en 1 archivo.**
