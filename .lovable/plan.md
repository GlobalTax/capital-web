

## Enriquecer datos de empresas con IA en el paso de importacion

### Objetivo
Anadir un boton de enriquecimiento con IA en el paso de importacion de empresas (`CompaniesStep`) que, dado el nombre de la empresa y su CIF/dominio, busque y complete automaticamente los datos que faltan: email de contacto, nombre del contacto, telefono y CIF.

### Como funciona

1. Tras importar empresas (Excel o manual), muchas filas tendran campos vacios (email, telefono, contacto).
2. Un boton "Enriquecer con IA" aparecera sobre la tabla de empresas cuando haya registros con datos incompletos.
3. Al pulsarlo, se invocara una nueva Edge Function que, para cada empresa:
   - Usa Firecrawl Search para buscar informacion publica de la empresa (web, LinkedIn, directorios)
   - Usa Lovable AI (Gemini) para extraer datos estructurados del resultado: email general, persona de contacto, telefono, CIF si falta
4. Los campos completados se actualizan en `valuation_campaign_companies` y se reflejan en la tabla.

### Cambios

#### 1. Nueva Edge Function: `enrich-campaign-companies-data`

Recibe un array de empresas con campos incompletos. Para cada una:

```
1. Buscar en Firecrawl: "{empresa} {cif} contacto email site:.es"
2. Enviar resultados a Gemini con tool calling para extraer:
   - contact_name (persona de contacto, director general o similar)
   - contact_email (email profesional)
   - contact_phone (telefono)
   - cif (si no lo tenia)
3. Devolver los datos encontrados
```

Patron similar a `cr-people-enrich` pero enfocado en datos de contacto empresarial.

#### 2. CompaniesStep.tsx - Boton y logica de enriquecimiento

- Nuevo boton "Enriquecer con IA" con icono `Sparkles` en la cabecera de la tabla
- Badge indicando cuantas empresas tienen datos incompletos
- Estado de progreso durante el enriquecimiento (X de Y completadas)
- Actualizacion en tiempo real de la tabla conforme se completan

#### 3. Hook o logica inline

- Iterar empresas con datos faltantes
- Llamar al edge function en lotes de 3-5 para no saturar
- Actualizar cada registro en `valuation_campaign_companies` con los datos encontrados
- Mostrar resumen al finalizar (X enriquecidas, Y sin resultados)

### Flujo del usuario

```
1. Importa Excel con empresas (muchas sin email/contacto)
2. Ve badge: "12 empresas sin email"
3. Pulsa "Enriquecer con IA"
4. Barra de progreso: "Procesando 3/12..."
5. La tabla se actualiza en tiempo real
6. Resumen: "8 enriquecidas, 4 sin resultados"
```

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/enrich-campaign-companies-data/index.ts` | Nueva Edge Function |
| `supabase/config.toml` | Registrar nueva funcion |
| `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx` | Boton + logica de enriquecimiento |

### Detalles tecnicos

- Usa Firecrawl Search (2 creditos por busqueda) siguiendo el patron de `cr-people-enrich`
- Usa Lovable AI con tool calling para extraccion estructurada, siguiendo el patron de `enrich-campaign-company`
- Procesamiento secuencial con delay de 1.5s entre empresas para evitar rate limits
- Fallback: si Firecrawl falla, intenta solo con IA usando el nombre de la empresa
- Solo procesa empresas que tengan al menos un campo vacio (email, contacto, telefono o CIF)
- Los campos que ya tienen valor NO se sobreescriben

