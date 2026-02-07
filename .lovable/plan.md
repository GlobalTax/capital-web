

## Plan: Edicion directa de empresas y contactos desde el directorio

Permitir crear y editar empresas y contactos sin necesidad de pasar por un deal, directamente desde la pestana "Directorio".

### 1. Formulario de edicion de empresa

Nuevo componente `DealsuiteEmpresaForm.tsx` con un formulario completo para editar todos los campos de una empresa:
- Nombre, ubicacion, descripcion, tipo de empresa, parte de
- Experiencia M&A y sectores (input de tags separados por coma)
- Tamano de proyectos min/max
- Enfoque consultivo, sitio web, imagen URL
- Notas internas

Se usara desde `DealsuiteEmpresaCard` con un boton "Editar" que alterna entre vista lectura y formulario de edicion.

### 2. Formulario de edicion/creacion de contactos

Dentro de `DealsuiteEmpresaCard`, en el sidebar de contactos:
- Boton "Anadir contacto" para crear uno nuevo vinculado a esa empresa
- Boton de edicion en cada contacto existente
- Formulario inline o en dialog con campos: nombre, cargo, email, telefono, notas

### 3. Boton "Nueva empresa" en el directorio

En la cabecera de la pestana "Directorio" de `DealsuiteSyncPanel`, un boton para crear una empresa desde cero (abre el formulario vacio).

### 4. Mutations en el hook

Anadir a `useDealsuiteEmpresas.ts`:
- `useUpdateEmpresa`: mutation para actualizar una empresa por ID
- `useCreateEmpresa`: mutation para crear una empresa nueva
- `useUpdateContacto`: mutation para actualizar un contacto
- `useCreateContacto`: mutation para crear un contacto nuevo
- `useDeleteContacto`: mutation para eliminar un contacto

### Archivos a modificar

- **`src/hooks/useDealsuiteEmpresas.ts`**: Anadir mutations (create/update empresa, create/update/delete contacto)
- **`src/components/admin/DealsuiteEmpresaCard.tsx`**: Anadir modo edicion para empresa + gestion de contactos (crear/editar/eliminar)
- **`src/components/admin/DealsuiteSyncPanel.tsx`**: Boton "Nueva empresa" en la pestana directorio, estado para empresa nueva

### Detalle tecnico

```text
Nuevas mutations en useDealsuiteEmpresas.ts:

useCreateEmpresa:
  insert -> dealsuite_empresas
  invalidate ['dealsuite-empresas']

useUpdateEmpresa:
  update -> dealsuite_empresas where id = empresaId
  invalidate ['dealsuite-empresas']

useCreateContacto:
  insert -> dealsuite_contacts con empresa_id
  invalidate ['dealsuite-contactos', empresaId]

useUpdateContacto:
  update -> dealsuite_contacts where id = contactoId
  invalidate ['dealsuite-contactos', empresaId]

useDeleteContacto:
  delete -> dealsuite_contacts where id = contactoId
  invalidate ['dealsuite-contactos', empresaId]
```

```text
DealsuiteEmpresaCard cambios:

Estado: isEditing (boolean)
  - false: vista actual (solo lectura)
  - true: campos editables con inputs/textareas

Boton "Editar" en la cabecera junto al nombre
Boton "Guardar" / "Cancelar" al editar

Sidebar contactos:
  - Boton "+ Anadir contacto" al final
  - Icono editar en cada contacto -> dialog con formulario
  - Icono eliminar en cada contacto -> confirmacion
```

```text
DealsuiteSyncPanel cambios:

Nuevo estado: creatingEmpresa (boolean)
  - true: muestra DealsuiteEmpresaCard con empresa vacia en modo edicion
  
Boton "Nueva empresa" en CardHeader del directorio
```

