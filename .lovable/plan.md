
Diagnóstico claro: no salen porque la llamada de listado de Storage está fallando por RLS (en consola: `StorageApiError: new row violates row-level security policy`).  
Aunque ya existe política `SELECT` para `admin-photos`, falta una política `UPDATE` para ese bucket, y el endpoint de listado de Supabase Storage puede necesitar actualizar metadatos internos (por ejemplo `last_accessed_at`), lo que dispara ese error.

Plan de implementación

1) Corregir RLS de `storage.objects` para `admin-photos`
- Crear una nueva migración SQL que añada política `UPDATE` específica del bucket.
- Política propuesta:
  - `FOR UPDATE TO authenticated`
  - `USING (bucket_id = 'admin-photos')`
  - `WITH CHECK (bucket_id = 'admin-photos')`
- Mantener las políticas existentes de `SELECT/INSERT/DELETE` (no romper nada que ya funcione).

2) Mejorar visibilidad de errores en frontend (ahora se ve “No hay fotos” aunque hay error)
- En `usePhotoLibrary`, exponer `isError` y `error` del `useQuery`.
- En `PhotoLibraryManager` y `PhotoLibraryPicker`, mostrar estado de error explícito (mensaje de permisos/RLS) en lugar de mostrar estado vacío.
- Mantener reintento manual (`refetch`) para que el usuario no tenga que recargar toda la página.

3) Verificación funcional (fin a fin)
- Abrir `/admin/photo-library`.
- Confirmar que aparecen fotos existentes del bucket.
- Subir una imagen nueva y comprobar que aparece en la cuadrícula.
- Abrir editor de blog → imagen destacada → icono de biblioteca → navegar carpetas → seleccionar foto.
- Probar mover entre carpetas y recorte para asegurar que no se rompió nada con políticas nuevas.

Detalles técnicos (para implementación)
- Archivo nuevo de migración: `supabase/migrations/<timestamp>_fix_admin_photos_update_policy.sql`
- SQL esperado (resumen):
  - `create policy "Authenticated users can update admin-photos" on storage.objects for update to authenticated using (bucket_id='admin-photos') with check (bucket_id='admin-photos');`
- Cambios frontend:
  - `src/hooks/usePhotoLibrary.tsx`: devolver `error/isError`.
  - `src/components/admin/PhotoLibraryManager.tsx`: estado visual de error + botón “Reintentar”.
  - `src/components/admin/PhotoLibraryPicker.tsx`: mismo patrón de error.
- Resultado esperado: desaparece el falso estado vacío y se muestran correctamente las fotos ya subidas.

