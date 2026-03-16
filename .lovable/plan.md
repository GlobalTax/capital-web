

## Plan: Optimizar rendimiento de la Biblioteca de Fotos

### Problemas identificados

1. **Cada imagen carga a resolución completa** — En la cuadrícula se muestran como thumbnails (~150x150px) pero se descarga el archivo original (potencialmente varios MB cada uno).
2. **Búsqueda provoca refetch innecesario** — `search` está en el `queryKey`, pero el filtrado es 100% cliente. Cada tecla dispara una nueva llamada RPC.
3. **Sin placeholder/skeleton mientras cargan** — Las imágenes aparecen de golpe sin transición.

### Cambios

**Archivo: `src/hooks/usePhotoLibrary.tsx`**

1. Quitar `search` del `queryKey` (dejar solo `['photo-library', currentFolder]`). Mover el filtrado fuera del `queryFn` con un `useMemo` que filtre `data` por `search`.
2. Generar dos URLs por foto: `publicUrl` (original) y `thumbnailUrl` (con params de transformación Supabase: `?width=300&height=300&resize=cover&quality=60`).
3. Actualizar la interfaz `PhotoFile` para incluir `thumbnailUrl: string`.

**Archivo: `src/components/admin/PhotoLibraryManager.tsx`**

4. Usar `photo.thumbnailUrl` en el `<img>` de la cuadrícula en lugar de `photo.publicUrl`.
5. Añadir un skeleton/placeholder con blur-up mientras la imagen carga (`useState` para loaded + transición opacity).
6. Añadir `debounce` al input de búsqueda (300ms) para evitar re-renders constantes.

### Resultado esperado

- Cada thumbnail pesa ~10-30KB en vez de varios MB
- La búsqueda no dispara llamadas de red
- Transición visual suave al cargar cada imagen

