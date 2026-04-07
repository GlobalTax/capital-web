
## Plan: Envíos ROD — Sistema de distribución masiva

### 1. Base de datos
- **`rod_sends`**: Tabla principal de envíos (asunto, cuerpo HTML, idioma target `es`/`en`, estado `draft`/`scheduled`/`sending`/`sent`/`failed`, fecha programada, documentos adjuntos seleccionados, estadísticas de envío)
- **`rod_send_recipients`**: Registro por destinatario (email, estado delivery, errores, timestamps)
- RLS policies para acceso solo admin autenticado

### 2. Nueva pestaña "Envíos ROD" en OportunidadesPage
- Pestaña adicional junto a Documentos ROD y Listados ROD
- Vista principal: historial de envíos con estados y métricas
- Botón "Nuevo envío" que abre el composer

### 3. Composer de email (basado en MailStep de outbound)
- **Selector de idioma/lista**: Castellano, Inglés, o Ambas
- **Editor de asunto + cuerpo**: Textarea con variables (nombre, empresa) y auto-guardado
- **Selector de adjuntos**: Checkboxes con los documentos activos de RODDocumentsManager (PDF ES, PDF EN, Excel ES, Excel EN) filtrados por idioma
- **Vista previa**: Preview en tiempo real del email resultante
- **Firma**: Integración con el sistema de firmas existente
- **Acciones**: "Enviar ahora" / "Programar envío" (date-time picker)

### 4. Edge Function `send-rod-email`
- Recibe el `rod_send_id`, descarga adjuntos del bucket, envía en lotes
- Actualiza `rod_send_recipients` con estados de delivery
- Respeta rate-limits con procesamiento secuencial por lotes

### 5. Cron automático (opcional)
- Configuración en la UI: frecuencia (semanal, quincenal, mensual), día/hora
- pg_cron job que ejecuta envíos programados
- Solo envía si hay un draft preparado y marcado como "auto"

### 6. Historial y métricas
- Tabla de envíos pasados con contadores (enviados, fallidos, pendientes)
- Detalle expandible por envío con lista de destinatarios

### Orden de implementación
1. Migración DB (rod_sends + rod_send_recipients)
2. Componente RODSendsTab + Composer
3. Edge Function de envío
4. Sistema de programación/cron
