
## Arreglo real para que la plantilla quede registrada

### Qué está pasando ahora
He revisado el código y los datos reales del proyecto. El problema no es que el archivo no se suba: sí se está guardando en `storage` y también veo que la URL activa se ha llegado a guardar en `slide_templates`.

Lo que falla es esto:
1. La biblioteca intenta leer el historial con `supabase.storage.list('templates')`
2. Esa lectura sigue devolviendo error RLS en el frontend
3. Como la lista falla, la UI queda vacía y parece que “no se ha registrado”
4. Además, el estado actual solo guarda **una URL activa** en `slide_templates`, no una biblioteca/histórico real de documentos

### Enfoque correcto
Dejar de usar `storage.list()` como fuente de verdad para la biblioteca y crear un registro propio en base de datos para las plantillas PPTX.

### Implementación propuesta

#### 1) Crear una tabla de documentos de plantilla
Nueva tabla, por ejemplo `public.rod_template_documents`, con campos como:
- `id`
- `title`
- `file_name`
- `storage_path`
- `public_url`
- `is_active`
- `created_by`
- `created_at`
- `updated_at`

Con RLS de admin usando `current_user_is_admin()`.

Esto permite:
- ver el histórico
- marcar cuál está activa
- descargar cualquier versión anterior
- no depender de `storage.list()` para enseñar la biblioteca

#### 2) Cambiar la biblioteca PPTX
Actualizar `PptxTemplateLibrary.tsx` para que:
- al abrir, lea desde `rod_template_documents`
- al subir un archivo:
  - lo guarde en `slide-backgrounds/templates/...`
  - cree un registro en `rod_template_documents`
  - lo marque como activo o lo seleccione
- al descargar, use `storage_path` del registro
- al eliminar, borre el archivo y también el registro
- al seleccionar “Usar esta”, actualice la plantilla activa

#### 3) Persistencia clara de la selección
Ahora mismo la selección depende del flujo de `slide_templates` y del botón “Guardar plantilla”. Voy a dejarlo consistente de una de estas dos formas:
- guardar automáticamente al seleccionar/subir, o
- mantener el botón pero con estado visual muy claro de “cambios sin guardar”

Mi recomendación: guardar automáticamente la selección activa para que no parezca que “se pierde”.

#### 4) Mantener compatibilidad con la generación PPTX
`generateDealhubPptx` seguirá usando `template.templatePptxUrl`, pero ese valor se alimentará desde el documento activo registrado en la nueva tabla.

#### 5) Migración de datos ya subidos
Como ya existen archivos en `storage`, incluiré una migración/ajuste para que no se pierdan:
- leer los archivos ya existentes de `slide-backgrounds/templates`
- crear registros en `rod_template_documents` para ellos, o
- al menos registrar el archivo actualmente activo guardado en `slide_templates`

### Resultado esperado
Después del cambio:
- subes una plantilla
- queda registrada en una lista persistente
- la puedes volver a ver luego
- la puedes descargar
- puedes conservar versiones anteriores
- puedes marcar una como activa para generar el catálogo

### Detalle técnico
```text
UI actual
  upload -> storage
         -> list desde storage  ❌ falla por RLS
         -> parece que no existe

UI nueva
  upload -> storage
         -> insert en rod_template_documents ✅
  biblioteca -> select rod_template_documents ✅
  descarga -> storage.download(storage_path) ✅
  selección -> guarda documento activo + templatePptxUrl ✅
```

### Archivos a tocar
- `src/features/operations-management/components/PptxTemplateLibrary.tsx`
- `src/features/operations-management/components/StaticSlidesUploader.tsx`
- `src/features/operations-management/hooks/useSlideTemplates.ts`
- nueva migración SQL para `rod_template_documents` y sus políticas

### Por qué esta solución sí arregla el problema
Porque ataca el fallo real:
- hoy el archivo existe, pero la UI no puede listar bien desde storage
- además no hay una entidad de “documento de plantilla” con histórico
- con una tabla propia, la biblioteca pasa a tener un registro persistente de verdad

