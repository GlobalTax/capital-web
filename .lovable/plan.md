

## Diagnostico profundo y plan de fix definitivo

### Hallazgo clave

He verificado exhaustivamente:
- Las 4 politicas RLS para `campaign-presentations` existen y son correctas (`TO authenticated`, `WITH CHECK bucket_id = 'campaign-presentations'`)
- El JWT del usuario ES valido (role=authenticated, sub=5e522cb6...)
- El bucket existe, acepta PDFs, no hay triggers ni constraints
- No hay politicas restrictivas
- Los postgres_logs no muestran el error (lo que sugiere que el Storage service lo maneja internamente)

Sin embargo, el bucket `operation-documents` usa un patron diferente que SI funciona:

```text
operation-documents (FUNCIONA):
  FOR ALL TO authenticated
  USING (bucket_id = 'operation-documents' AND EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active AND role IN (...)))
  WITH CHECK (misma condicion)

campaign-presentations (FALLA):
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'campaign-presentations')
```

La diferencia clave: `operation-documents` usa `FOR ALL` (una sola politica combinada) con verificacion explicita de `admin_users`, mientras que `campaign-presentations` usa politicas separadas sin verificacion de admin.

### Plan

**Paso 1: Migración SQL** -- Reemplazar las 4 politicas actuales con UNA sola politica `FOR ALL` que replica exactamente el patron del bucket `operation-documents` (que funciona):

```sql
DROP POLICY IF EXISTS "campaign_presentations_insert" ON storage.objects;
DROP POLICY IF EXISTS "campaign_presentations_select" ON storage.objects;
DROP POLICY IF EXISTS "campaign_presentations_update" ON storage.objects;
DROP POLICY IF EXISTS "campaign_presentations_delete" ON storage.objects;

CREATE POLICY "Admin users can manage campaign presentations"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'campaign-presentations'
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'editor', 'viewer')
  )
)
WITH CHECK (
  bucket_id = 'campaign-presentations'
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'editor', 'viewer')
  )
);
```

**Paso 2: No se requieren cambios de código** -- El wrapper `safeStorageUpload` ya verifica sesion y loguea el estado de auth.

### Por qué deberia funcionar

Esta es la replica exacta del patron que funciona para `operation-documents` -- el unico bucket privado con uploads confirmados funcionando. Al usar `FOR ALL` con verificacion explicita de `admin_users`, eliminamos cualquier ambiguedad en como el Storage service de Supabase evalua las politicas.

### Si sigue sin funcionar

Si este cambio tambien falla, significara que el problema NO es de RLS y esta en la capa del servicio de Storage de Supabase. En ese caso, la unica solucion sera usar una Edge Function con `service_role` para hacer las subidas (bypass completo de RLS).

