

## Fix: Eliminar imagen local fallback de La Firma

### Problema

El componente `LaFirmaSection.tsx` importa un archivo local `about-firm.jpg` (linea 6) que se usa como fallback cuando `image_url` de la base de datos es null. Aunque la BD ya tiene una imagen configurada, el import local sigue empaquetado en el bundle y puede causar confision o mostrar brevemente la imagen incorrecta durante el render inicial.

### Solucion

1. **Eliminar el import local** de `about-firm.jpg` (linea 6)
2. **Cambiar el fallback** en linea 82: si `image_url` de la BD es null, simplemente no mostrar imagen (o mostrar un placeholder gris) en lugar de cargar una imagen local empaquetada
3. **Eliminar el archivo** `src/assets/test/about-firm.jpg` del proyecto para reducir el tamano del bundle

### Cambios en `LaFirmaSection.tsx`

- Eliminar linea 6: `import aboutFirmImage from '@/assets/test/about-firm.jpg';`
- Linea 82: cambiar `const imageSource = c.image_url || aboutFirmImage;` por `const imageSource = c.image_url || '';`
- Linea 103-105: envolver la imagen en un condicional para que solo se renderice si hay URL

### Resultado

La seccion siempre mostrara la imagen configurada desde el admin (`/admin/la-firma`). Si no hay imagen en la BD, se mostrara el area gris del contenedor sin imagen rota.

### Seccion tecnica

**Archivo a modificar:**
- `src/components/home/LaFirmaSection.tsx` - Eliminar import local y usar solo imagen de BD

**Archivo a eliminar (opcional):**
- `src/assets/test/about-firm.jpg` - Ya no se necesita
