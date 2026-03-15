

## Plan: Hacer visible "Recursos" en el sidebar del admin

### Problema encontrado
El item "Lead Magnets" en la sección "✨ CREAR CONTENIDO" del sidebar tiene `visible: false` (línea 146 de `sidebar-config.ts`), por eso no aparece.

### Cambios

**1. `src/features/admin/config/sidebar-config.ts`**
- En la sección "✨ CREAR CONTENIDO" (línea 141-147): renombrar "Lead Magnets" a "Recursos", quitar `visible: false`
- En la sección "📚 RECURSOS" (línea 515-526): añadir un segundo item "Recursos (Biblioteca)" apuntando a `/admin/lead-magnets`

**2. `src/features/admin/components/AdminRouter.tsx`**
- Añadir rutas para `/recursos/exit-ready` y `/recursos/exit-ready/preguntas` (ya existen las páginas pero no están registradas en el router)

### Resultado
- "Recursos" aparecerá en "✨ CREAR CONTENIDO" (visible y accesible)
- También aparecerá en "📚 RECURSOS" junto con "Test Exit-Ready"
- El acceso a `/admin/lead-magnets` seguirá funcionando igual

