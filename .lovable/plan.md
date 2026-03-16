

## Plan: Añadir "Biblioteca de Fotos" al sidebar en la sección RECURSOS

Añadir un item nuevo en la sección "📚 RECURSOS" (líneas 514-531) del archivo `src/features/admin/config/sidebar-config.ts`.

### Cambio

**Archivo: `src/features/admin/config/sidebar-config.ts`**

Añadir después del item "Test Exit-Ready" (línea 529):

```typescript
{
  title: "Biblioteca de Fotos",
  url: "/admin/photo-library",
  icon: Image,
  description: "Gestiona y organiza fotos"
},
```

La sección RECURSOS quedará con 3 items: Recursos (Biblioteca), Test Exit-Ready y Biblioteca de Fotos.

No se necesitan cambios en imports (`Image` ya está importado en línea 23).

