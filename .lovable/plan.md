

## Plan: Seccion "Contacto Principal" en Perfil de Empresa

### Objetivo

Anadir un bloque compacto **"Contacto Principal"** justo encima del card "Financial KPIs" en la columna izquierda del perfil de empresa. Muestra el primer contacto asociado con nombre completo, email clickable (`mailto:`), telefono clickable (`tel:`), cargo, y acciones inline de editar y desasociar.

---

### Cambio unico: `src/pages/admin/EmpresaDetailPage.tsx`

**Ubicacion**: Entre la linea 244 (inicio de la columna izquierda) y la linea 246 (EmpresaFinancialsCard), insertar un nuevo bloque condicional.

**Logica**:
- Tomar `empresaContactos[0]` como contacto principal (primer contacto por orden alfabetico, ya ordenado por el hook)
- Si no hay contactos, mostrar un CTA compacto: "Sin contacto principal" + boton "Anadir"
- Si hay contacto, mostrar card compacta con:

**Contenido del card**:
- Icono `User` + titulo "Contacto Principal"
- Nombre completo (`nombre` + `apellidos`) y cargo en gris
- Email como link `mailto:` con icono `Mail`
- Telefono como link `tel:` con icono `Phone`
- Boton inline "Editar" (icono `Edit`) -> abre un estado de edicion inline con inputs para nombre, email, telefono
- Boton inline "Desasociar" (icono `Unlink`) -> llama `unlinkContacto` del hook existente con confirmacion

**Edicion inline**:
- Al pulsar "Editar", los campos de texto se convierten en inputs editables
- Boton "Guardar" llama `updateContacto` del hook existente
- Boton "Cancelar" vuelve al modo lectura

**Imports nuevos**: `User`, `Mail`, `Phone`, `Unlink` de lucide-react, `Input` de ui.

**Estado nuevo**: `editingContact` (boolean) y `contactEditValues` (objeto con nombre, apellidos, email, telefono, cargo).

---

### Detalles tecnicos

- Reutiliza completamente `useEmpresaContactos` ya importado (linea 48) y su variable `empresaContactos` (linea 87)
- Usa `unlinkContacto` y `updateContacto` del mismo hook (requiere desestructurar estas funciones adicionales)
- No crea componentes nuevos ni hooks nuevos; todo inline en la pagina
- El bloque se renderiza condicionalmente y es responsive (flex-wrap para mobile)

