

## Soporte de video en los Hero Slides

### Que se hara

Ampliar el sistema de Hero Slides para que cada slide pueda ser una **imagen** o un **video** de fondo. El administrador podra elegir el tipo de media y subir/pegar una URL de video. El Hero renderizara un `<video>` en bucle, silenciado y autoplay cuando el slide sea de tipo video.

### Cambios necesarios

#### 1. Base de datos: nueva columna `video_url`

Anadir una columna `video_url TEXT` a la tabla `hero_slides`. Se usara la logica: si `video_url` tiene valor, el slide es de video; si no, se usa `image_url` como hasta ahora.

#### 2. Panel admin: `HeroSlidesManager.tsx`

- Anadir un campo "URL de video" en el formulario de edicion/creacion, debajo del campo de imagen.
- Anadir un boton de upload para videos (aceptar `video/*`, limite ~50MB) que sube al bucket `hero-images` (o uno nuevo `hero-videos`).
- Mostrar una preview del video en miniatura si hay `video_url`.
- En la lista de slides, mostrar un icono de video (en lugar del icono de imagen) cuando el slide tiene video.

#### 3. Hero.tsx: renderizar video como fondo

- Actualizar la interfaz `SlideData` para incluir `videoUrl?: string`.
- En `useHeroSlides`, mapear `video_url` al nuevo campo.
- En el bloque de fondo (`AnimatePresence`), anadir una tercera condicion: si el slide tiene `videoUrl`, renderizar un elemento `<video>` con:
  - `autoPlay`, `muted`, `loop`, `playsInline`
  - `object-cover` para cubrir toda la pantalla
  - El mismo overlay con gradiente que las imagenes
- Pausar el autoplay del carrusel mientras dure el video (o mantenerlo con duracion configurable).

### Detalle tecnico

**Archivos a modificar:**
- Migracion SQL (nueva columna `video_url`)
- `src/components/admin/HeroSlidesManager.tsx` (formulario + upload + preview)
- `src/components/Hero.tsx` (renderizado de video en fondo)

**Migracion SQL:**
```sql
ALTER TABLE hero_slides ADD COLUMN video_url TEXT;
```

**Hero.tsx - Nuevo bloque condicional de fondo:**
```text
if slide.videoUrl  -->  <video autoPlay muted loop playsInline class="object-cover w-full h-full" />
if slide.isMosaic  -->  mosaic grid (existente)
else               -->  background image (existente)
```

**HeroSlidesManager.tsx - Nuevo campo en formulario:**
- Input de texto para URL de video + boton upload
- Accept: `video/mp4,video/webm`
- Preview: elemento `<video>` pequeno con controles

### Consideraciones

- Los videos deben estar en formato MP4 o WebM para compatibilidad maxima con navegadores.
- El video se reproducira **silenciado** y en **bucle** automaticamente (sin controles visibles al usuario).
- En movil, algunos navegadores bloquean autoplay si no esta `muted` y `playsInline` -- ambos se incluiran.
- El overlay con gradiente garantizara la legibilidad del texto sobre el video.
