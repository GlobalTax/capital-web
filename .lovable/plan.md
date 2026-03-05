
Objetivo: desbloquear la subida de PDFs corrigiendo el fallo real actual (no es RLS ahora, es invocación de Edge Function).

Diagnóstico confirmado (con evidencia):
- La llamada actual falla en preflight/CORS con `FunctionsFetchError`.
- La función `upload-campaign-presentation` existe en código y en `config.toml`, pero en runtime responde como no existente.
- Prueba directa al endpoint de funciones devuelve `404 NOT_FOUND: Requested function was not found`.
- No hay logs de esa función en Supabase, lo que confirma que no está desplegada/activa en ese proyecto.

Plan de implementación

1) Restaurar disponibilidad de la función (prioridad alta)
- Desplegar explícitamente `upload-campaign-presentation`.
- Verificar inmediatamente que ya responde (no 404) con una llamada de prueba.
- Si el deploy falla, revisar error de empaquetado/runtime y corregir (importes, sintaxis, vars).

2) Endurecer la Edge Function para evitar falsos CORS
- Mantener handler `OPTIONS` devolviendo 200 con CORS.
- Garantizar que todas las respuestas (éxito y error) incluyan CORS headers.
- Añadir validación explícita de secretos requeridos (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, y el usado para validar JWT) y devolver error controlado JSON.
- Mejorar logs estructurados en la función para distinguir:
  - auth inválida
  - usuario sin rol admin
  - error de upload storage
  - error de configuración (secrets)

3) Fortalecer el cliente para diagnóstico claro
- En `safeStorageUpload`, mapear `FunctionsFetchError`/404 a mensaje explícito:
  - “La función de subida no está disponible (deploy pendiente o fallo de backend)”.
- Mantener trazas mínimas útiles (`functionName`, `path`, `error.name`, `status` si existe).
- No tocar la lógica de negocio de campaña ni matching.

4) Validación técnica (obligatoria)
- Probar invoke de la función tras deploy:
  - `OPTIONS` (CORS preflight OK)
  - `POST` sin body (debe devolver 400 controlado, no 404/500 opaco)
  - `POST` real con archivo desde UI (debe devolver 200 y `path`)
- Confirmar en logs de función que entra la request y que sube al bucket.
- Confirmar en UI:
  - aparece `campaign_presentations` actualizado
  - desaparece `FunctionsFetchError`

5) Contingencia si vuelve a fallar
- Si sigue 404: problema de deploy/publicación del function slug (nombre o entorno).
- Si pasa a 401/403: ajustar validación de JWT/rol dentro de la función.
- Si pasa a 500 con logs: corregir error puntual según stacktrace.
- Solo si todo lo anterior falla, activar fallback temporal a subida directa con RLS (ya no recomendado como ruta principal).

Archivos involucrados
- `supabase/functions/upload-campaign-presentation/index.ts` (robustez CORS/logs/validación)
- `src/utils/campaignPresentationStorage.ts` (manejo de errores más preciso)
- Sin cambios de esquema DB/RLS para esta iteración (el bloqueo actual no está en policies).

Resultado esperado
- La subida deja de fallar por CORS/preflight.
- La función responde de forma consistente y observable.
- Errores futuros se diagnostican en minutos con mensajes y logs claros en lugar de `Failed to fetch`.
