

## Simplificar el flujo de subida de PPTX plantilla

### Problema actual

1. **Mapeo de slides incorrecto**: El codigo asume que los separadores estan en slides 3,4,5,6 pero tu PPTX tiene la estructura: Cover(1), Indice(2), Separador1(3), **Operacion ejemplo(4)**, Separador2(5), Separador3(6), Separador4(7), Cierre(8). La slide 4 es un ejemplo que debe eliminarse.

2. **Tamaños que se cambian solos**: La funcion `mergeWithDefaults` mezcla los defaults del sistema con tu plantilla guardada, sobreescribiendo valores que ya habias configurado. Cuando usas PPTX plantilla, estos defaults no deberian importar.

3. **Complejidad innecesaria**: Hay demasiados pasos (subir imagenes individuales, editar plantilla, configurar...). Si subes un PPTX, solo necesitas indicar donde van las operaciones.

### Solucion

Simplificar la pestaña "Slides fijas" para que al subir un PPTX:

1. **Solo se pida el PPTX** y un mapeo simple de donde van los separadores
2. **Definir el mapeo por defecto** basado en tu plantilla real: separadores en slides 3, 5, 6, 7 (saltando slide 4 que es ejemplo) y cierre en slide 8
3. **Al generar con PPTX plantilla, saltar completamente** la logica de defaults/tamaños — todo sale del PPTX original
4. **Eliminar el merge de defaults** cuando hay `templatePptxUrl` presente

### Cambios

**`StaticSlidesUploader.tsx`**
- Cuando hay PPTX subido, mostrar un mapeo editable: "Separador Mandatos de Venta = Slide 3", etc.
- Campos numericos simples para que el usuario ajuste si su PPTX tiene estructura diferente
- Ocultar la seccion de imagenes individuales si hay PPTX (no tiene sentido ambos)

**`slideTemplate.ts`**
- Añadir `templateSlideMap?: Record<string, number>` al `FullSlideTemplate` para guardar que slide del template corresponde a cada separador
- Default: `{ sale_active: 3, upcoming: 5, acquisition: 6, exclusive: 7 }`

**`generateDealhubPptx.ts`**
- Usar `ft.templateSlideMap` en vez de calcular `sectionInsertPoints` automaticamente
- Filtrar solo secciones que tienen operaciones reales (no incluir separadores vacios)

**`GenerateDealhubModal.tsx`**
- Cuando `templatePptxUrl` existe, NO aplicar `mergeWithDefaults` — los tamaños del PPTX mandan
- Simplificar: si hay PPTX, la pestaña "Plantilla" (editor visual) se deshabilita o muestra aviso

**`merge-pptx/index.ts`**  
- Añadir logica para **eliminar slides del template** que no se necesitan (como la slide 4 de ejemplo)
- Recibir parametro `skipSlides?: number[]` para indicar slides a eliminar antes de mergear

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `slideTemplate.ts` | Añadir `templateSlideMap` |
| `StaticSlidesUploader.tsx` | UI de mapeo de slides simplificada |
| `generateDealhubPptx.ts` | Usar `templateSlideMap` y `skipSlides` |
| `GenerateDealhubModal.tsx` | No sobreescribir tamaños cuando hay PPTX |
| `merge-pptx/index.ts` | Soporte para `skipSlides` |

