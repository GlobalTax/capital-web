

## Plan: Alta de Compradores Potenciales con IA (0 Fricciones)

Se transformará el formulario de compradores potenciales para que con solo introducir el **nombre de empresa** o **URL del website**, el sistema auto-rellene todos los campos posibles (logo, descripción, sector, datos financieros) usando IA y APIs externas.

---

### Flujo de Usuario Propuesto

```text
+----------------------------------------------------------+
| 🔍 Nombre o URL                              [🪄 Buscar] |
| [empresaejemplo.com                                    ] |
+----------------------------------------------------------+
          ↓ Busca automáticamente
+----------------------------------------------------------+
| ✅ Datos encontrados                                     |
| [LOGO]  Empresa Ejemplo S.L.                            |
|         Fabricante de componentes industriales...        |
|         Sector: Industrial · Fact: 5M-10M€              |
|         [Usar estos datos]        [Editar manualmente]   |
+----------------------------------------------------------+
```

---

### Arquitectura

```text
+------------------------+     +----------------------------+
|  PotentialBuyerForm    |     |  potential-buyer-enrich    |
|  (Renovado)            |     |  (Nueva Edge Function)     |
+------------------------+     +----------------------------+
|  1. Input nombre/URL   |---->|  1. Detectar tipo input    |
|  2. Botón "Buscar"     |     |  2. find-company-logo      |
|  3. Preview resultado  |     |  3. Firecrawl (website)    |
|  4. Confirmar o editar |     |  4. AI: generar descripción|
+------------------------+     +----------------------------+
```

---

### Cambios a Implementar

#### 1. Nueva Edge Function - `potential-buyer-enrich`

Combina múltiples fuentes para extraer datos completos:

**Entradas:**
- `query`: nombre de empresa, dominio, o URL completa

**Proceso:**
1. Detectar si es URL, dominio, o nombre
2. Llamar a `find-company-logo` para obtener logo vía Clearbit
3. Si hay website, usar Firecrawl para scrape de contenido
4. Usar IA (Gemini Flash) para generar:
   - Descripción profesional (1-2 frases)
   - Sector inferido del contenido
   - Rango de facturación estimado (si hay datos)

**Salida:**
```typescript
{
  success: true,
  data: {
    name: "Empresa Ejemplo S.L.",
    logo_url: "https://logo.clearbit.com/empresaejemplo.es",
    website: "https://www.empresaejemplo.es",
    description: "Fabricante especializado en componentes industriales para el sector automoción, con presencia en España y Portugal.",
    sector_focus: ["Industrial y Manufacturero", "Automoción"],
    revenue_range: "5M-10M",
    source: "clearbit+firecrawl+ai"
  }
}
```

#### 2. Nuevo Componente - `BuyerQuickSearch.tsx`

Componente de búsqueda inteligente con preview de resultados:

**Características:**
- Input unificado para nombre, dominio o URL
- Detección automática del tipo de input
- Spinner durante la búsqueda
- Preview de datos encontrados con logo visible
- Botón "Usar datos" para auto-rellenar el formulario
- Opción de "Editar manualmente" si los datos no son correctos

**Diseño:**
```text
+----------------------------------------------------------+
| 🪄 Búsqueda inteligente                                  |
+----------------------------------------------------------+
| [empresaejemplo.es                    ] [🔍 Buscar]      |
|                                                          |
| Introduce el nombre de empresa, dominio o URL del sitio  |
+----------------------------------------------------------+

// Después de buscar:
+----------------------------------------------------------+
| ✅ Empresa encontrada                                    |
+----------------------------------------------------------+
| [LOGO IMG]  Empresa Ejemplo S.L.                        |
|             www.empresaejemplo.es                        |
|             Fabricante de componentes industriales...    |
|             Sector: Industrial · Fact: 5M-10M€          |
|                                                          |
| [Usar estos datos ✓]            [Editar manualmente ✏️] |
+----------------------------------------------------------+
```

#### 3. Modificar `PotentialBuyerForm.tsx`

Integrar el nuevo flujo de búsqueda:

**Cambios:**
1. Añadir `BuyerQuickSearch` al inicio del formulario (antes del nombre)
2. Función `handleEnrichData` para auto-rellenar todos los campos
3. Estado `isEnriched` para mostrar indicador de datos auto-completados
4. Mantener edición manual como fallback
5. Hacer el logo requerido solo si no se usó búsqueda inteligente

**Flujo del formulario:**
```text
1. Usuario abre el modal
2. Ve BuyerQuickSearch prominente
3. Escribe nombre/URL → Click "Buscar"
4. Ve preview con datos → Click "Usar datos"
5. Formulario se rellena automáticamente
6. Usuario puede ajustar cualquier campo
7. Click "Añadir comprador"
```

#### 4. Modificar Validación del Schema

Hacer el logo opcional si viene de búsqueda inteligente:

```typescript
const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  logo_url: z.string().optional().or(z.string().url()),
  // ... resto de campos
}).refine(
  (data) => data.logo_url || data._fromEnrichment,
  { message: 'El logo es requerido', path: ['logo_url'] }
);
```

O simplemente hacer logo requerido siempre pero auto-completado por la búsqueda.

---

### Secuencia de Implementación

1. **Edge Function** `potential-buyer-enrich`:
   - Detectar tipo de input (URL, dominio, nombre)
   - Integrar `find-company-logo` para logos
   - Usar Firecrawl para scrape si hay website
   - Usar Lovable AI para generar descripción y inferir sector

2. **Componente** `BuyerQuickSearch.tsx`:
   - Input con botón de búsqueda
   - Llamada a la edge function
   - Preview de resultados con imagen
   - Callbacks para aceptar o rechazar datos

3. **Actualizar** `PotentialBuyerForm.tsx`:
   - Integrar BuyerQuickSearch
   - Handler para auto-rellenar campos
   - Mantener flujo manual como alternativa

4. **Actualizar** validación:
   - Ajustar schema para nuevo flujo
   - Logo requerido pero auto-completado

---

### Resultado Visual Esperado

**Paso 1 - Búsqueda:**
```text
+---------------------------------------------+
| Añadir Comprador Potencial                  |
+---------------------------------------------+
| 🪄 Búsqueda inteligente                     |
| [carpas-zaragoza.es       ] [🔍 Buscar]    |
| Escribe nombre, dominio o URL               |
+---------------------------------------------+
| ─── O rellena manualmente ───               |
| Nombre de la empresa *                      |
| [ _________________________________ ]       |
+---------------------------------------------+
```

**Paso 2 - Resultado encontrado:**
```text
+---------------------------------------------+
| ✅ Empresa encontrada                       |
+---------------------------------------------+
| [🏢]  CARPAS ZARAGOZA SL                   |
|       www.carpas-zaragoza.es               |
|       Empresa especializada en              |
|       fabricación e instalación de          |
|       carpas y estructuras modulares...     |
|       📊 Sector: Industrial · 1M-5M€       |
|                                             |
| [✓ Usar estos datos]  [✏️ Editar manual]   |
+---------------------------------------------+
```

**Paso 3 - Formulario auto-completado:**
```text
+---------------------------------------------+
| Añadir Comprador Potencial          [✓ AI] |
+---------------------------------------------+
| Nombre * [CARPAS ZARAGOZA SL_________]     |
| Logo     [🏢 carpas-zaragoza.es/logo] [X]  |
| Website  [https://carpas-zaragoza.es_]     |
| Descripción                                 |
| [Empresa especializada en fabricación_]    |
| [e instalación de carpas y estructur_]     |
|                                             |
| Facturación [1M-5M €_▼] Estado [Identif▼]  |
+---------------------------------------------+
```

---

### Consideraciones Técnicas

- **Clearbit Logo API**: Gratuita, solo necesita dominio
- **Firecrawl**: Para extraer contenido del website
- **Lovable AI**: Para generar descripción profesional del contenido scrapeado
- **Fallback**: Si no encuentra datos, el usuario puede rellenar manualmente
- **Performance**: Búsqueda asíncrona con feedback visual (spinner)
- **Error Handling**: Mensajes claros si no se encuentra la empresa

---

### Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `supabase/functions/potential-buyer-enrich/index.ts` | CREAR |
| `src/components/admin/leads/BuyerQuickSearch.tsx` | CREAR |
| `src/components/admin/leads/PotentialBuyerForm.tsx` | MODIFICAR |
| `src/types/leadPotentialBuyers.ts` | MODIFICAR (añadir tipos) |

