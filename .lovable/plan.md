

## Recuperar contactos borrados de "Outbound Seguridad 11/03"

### Situación

La campaña **"Outbound Seguridad 11/03"** (`33c01bd4`) tenía ~23 empresas y ahora solo tiene 2 (samuel y ORIOL). Los registros fueron eliminados permanentemente (hard delete, sin audit log).

### Fuente de recuperación

La campaña hermana **"Outbound Seguridad 11/03 - Anual Report Scutum"** (`129053de`) contiene exactamente las mismas 23 empresas (incluyendo las 2 que quedan). Usaré los datos de esa campaña como fuente para re-insertar las 21 empresas faltantes.

### Plan de ejecución

1. **Insertar 21 registros** en `valuation_campaign_companies` con `campaign_id = '33c01bd4-4f39-4577-8d25-e00ebe3edac6'`, copiando de la campaña Scutum:
   - Todos los campos: empresa, nombre, email, teléfono, CIF, web, provincia, revenue, ebitda, financial_year, financial_years_data, múltiplos, valoraciones, normalized_ebitda
   - Status: `'pending'` (estado inicial)
   - Source: `'manual'`
   - Se excluyen samuel (CIF `A02721918`) y ORIOL (CIF `b87124932`) que ya existen

2. **Verificar** que la campaña muestre los 23 contactos tras la inserción.

### Nota importante

Los emails que se hubieran enviado previamente desde esta campaña a esos contactos no se pueden recuperar (los registros de `campaign_emails` se eliminaron junto con las empresas si tenían FK cascade). Los contactos se restaurarán en estado `pending` y habrá que re-enviar si es necesario.

