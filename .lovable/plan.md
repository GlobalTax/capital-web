

## Fix: Botón "Aplicar Ahora" no hace scroll al formulario

### Problema
El botón en el hero llama a `scrollToSection('application-form')`, pero el componente `EnhancedCollaboratorForm` no tiene `id="application-form"` en su elemento contenedor. No hay ningún elemento con ese ID en la página.

### Solución

**`src/components/collaborators/EnhancedCollaboratorForm.tsx`**
- Añadir `id="application-form"` al elemento raíz del componente (probablemente un `<section>` o `<div>`).

Un cambio de 1 línea.

