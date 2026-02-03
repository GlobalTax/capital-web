
# Plan: Arreglar Scroll/Paginación de la Tabla de Contactos

## Diagnóstico Realizado

### Causa Raíz Identificada
El problema está en la jerarquía de contenedores con overflow en `LinearContactsTable.tsx`. Hay un conflicto entre:

1. **Contenedor exterior** (línea 462): `overflow-hidden` - correcto para bordes redondeados
2. **Contenedor de scroll horizontal** (línea 465): `overflow-x-auto` pero sin `overflow-y` definido
3. **`<List>` de react-window** (línea 485): `overflowX: 'hidden', overflowY: 'auto'`

El contenedor intermedio (línea 465) con solo `overflow-x-auto` está interfiriendo con el scroll vertical del `<List>`. En CSS, cuando defines `overflow-x: auto` sin definir `overflow-y`, el navegador puede aplicar comportamientos inesperados.

### Arquitectura de Scroll Correcta

```text
┌─ Contenedor exterior ────────────────────────────────┐
│  overflow: hidden (para bordes redondeados)          │
│  ┌─ Contenedor scroll horizontal ─────────────────┐  │
│  │  overflow-x: auto                              │  │
│  │  overflow-y: hidden (NO competir con List)     │  │
│  │  ┌─ List (react-window) ─────────────────────┐ │  │
│  │  │  overflow-x: hidden                       │ │  │
│  │  │  overflow-y: auto (scroll vertical AQUÍ)  │ │  │
│  │  └───────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## Cambios Técnicos

### 1. Modificar contenedor de scroll horizontal

**Archivo**: `src/components/admin/contacts/LinearContactsTable.tsx`

**Línea 465**: Cambiar de:
```typescript
<div ref={scrollContainerRef} className="overflow-x-auto">
```

**A**:
```typescript
<div ref={scrollContainerRef} className="overflow-x-auto overflow-y-hidden">
```

Esto asegura que:
- El scroll horizontal funciona para la sincronización header/contenido
- El scroll vertical NO compite con el `<List>` de react-window
- El único scroll vertical es el del `<List>` virtualizado

---

## Verificación

El cambio es mínimo (añadir una clase CSS) pero resuelve el conflicto de scrolls:

| Contenedor | overflow-x | overflow-y | Scroll responsable |
|------------|------------|------------|-------------------|
| Exterior | hidden | hidden | Ninguno (bordes) |
| Scroll container | auto | **hidden** | Solo horizontal |
| List (react-window) | hidden | auto | **Solo vertical** |

---

## Pruebas Post-Implementación

1. **Scroll vertical**: Usar trackpad/mouse wheel en la tabla → debe scrollear fluidamente
2. **Scroll horizontal**: Si hay más columnas que ancho de pantalla → debe scrollear horizontalmente
3. **Tabs**: Cambiar entre Favoritos/Todos/Pipeline/Estadísticas → cada uno funciona
4. **Filtros**: Aplicar filtros → tabla se actualiza y scroll sigue funcionando
5. **Sheet lateral**: Abrir y cerrar detalle de contacto → scroll se restaura correctamente
