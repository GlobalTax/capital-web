
## Plan: Alta de Compradores por Imagen con IA Vision

Se añadirá la capacidad de dar de alta compradores potenciales **subiendo una imagen** (logo, captura de informe financiero, tarjeta de visita, etc.) que será analizada con IA Vision para extraer automáticamente la información de la empresa.

---

### Flujo de Usuario Propuesto

```text
+----------------------------------------------------------+
|  🪄 Búsqueda inteligente                                 |
+----------------------------------------------------------+
| [📷 Subir imagen] [nombre o URL___________] [🔍 Buscar]  |
|                                                          |
| Sube un logo, captura o informe · O escribe nombre/URL   |
+----------------------------------------------------------+
          ↓ Si sube imagen
+----------------------------------------------------------+
| 📷 Analizando imagen con IA...                           |
| [████████████░░░░░] Extrayendo datos...                  |
+----------------------------------------------------------+
          ↓ Resultado
+----------------------------------------------------------+
| ✅ Empresa detectada                                     |
| [LOGO]  CARPAS ZARAGOZA SL                              |
|         Sector: Industrial · Fact: 1M-5M€               |
|         Descripción generada por IA...                   |
| [Usar estos datos ✓]         [Editar manualmente ✏️]    |
+----------------------------------------------------------+
```

---

### Arquitectura

```text
+---------------------------+     +-----------------------------+
|  BuyerQuickSearch         |     |  potential-buyer-enrich     |
|  (Actualizado)            |     |  (Actualizada)              |
+---------------------------+     +-----------------------------+
| - Input texto (existente) |     | mode: "text" | "image"      |
| + Botón subir imagen      |---->| Si mode="image":            |
| + Drop zone/Paste         |     |   - Recibe base64           |
+---------------------------+     |   - Llama a GPT-4o Vision   |
          |                       |   - Extrae: nombre, sector, |
          v                       |     descripción, facturación|
+---------------------------+     |   - Busca logo por dominio  |
|  ImageAnalysisPreview     |     +-----------------------------+
+---------------------------+
| - Preview de imagen       |
| - Datos extraídos         |
| - Confirmar / Editar      |
+---------------------------+
```

---

### Cambios a Implementar

#### 1. Actualizar Edge Function `potential-buyer-enrich`

Añadir soporte para análisis de imágenes:

**Nuevo input:**
```typescript
{
  mode: "text" | "image",
  query?: string,      // Para mode="text"
  imageBase64?: string // Para mode="image"
}
```

**Nuevo flujo para `mode="image"`:**
1. Recibir imagen en base64
2. Llamar a GPT-4o Vision con prompt especializado en extraer:
   - Nombre de empresa
   - Sector de actividad
   - Datos financieros (facturación, EBITDA si visible)
   - Descripción de actividad
   - Dominio/URL si aparece
3. Si se detecta un dominio, buscar logo con Clearbit
4. Devolver datos estructurados igual que el modo texto

**Prompt de Vision:**
```
Analiza esta imagen y extrae información sobre la empresa mostrada.
Puede ser un logo, una tarjeta de visita, un informe financiero, 
una captura de web o cualquier documento empresarial.

Extrae:
- Nombre de la empresa
- Dominio web si es visible
- Sector de actividad
- Descripción breve de la actividad
- Rango de facturación si hay datos financieros visibles

Responde en JSON...
```

#### 2. Actualizar Componente `BuyerQuickSearch.tsx`

Añadir capacidad de subir/pegar imagen:

**Nuevos elementos UI:**
- Botón "📷 Subir imagen" junto al input de texto
- Soporte para drag & drop de imágenes
- Soporte para pegar imagen (Ctrl+V)
- Preview de la imagen subida
- Estado de "Analizando..." con spinner

**Nuevos estados:**
```typescript
const [uploadedImage, setUploadedImage] = useState<string | null>(null);
const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
```

**Función de análisis:**
```typescript
const handleImageUpload = async (file: File) => {
  // Convertir a base64
  const base64 = await fileToBase64(file);
  setUploadedImage(base64);
  setIsAnalyzingImage(true);
  
  // Llamar a la edge function
  const { data } = await supabase.functions.invoke('potential-buyer-enrich', {
    body: { mode: 'image', imageBase64: base64 }
  });
  
  if (data?.success) {
    setResult(data.data);
  }
  setIsAnalyzingImage(false);
};
```

**Diseño actualizado:**
```text
+----------------------------------------------------------+
| 🪄 Búsqueda inteligente                                  |
+----------------------------------------------------------+
| [📷 Imagen] [nombre, dominio o URL______] [🔍 Buscar]    |
|                                                          |
| Sube un logo o captura, o escribe nombre/URL de empresa  |
+----------------------------------------------------------+
```

O alternativamente con zona de drop:

```text
+----------------------------------------------------------+
| 🪄 Búsqueda inteligente                                  |
+----------------------------------------------------------+
| ┌──────────────────────────────────────────────────────┐ |
| │  📷 Arrastra imagen aquí o haz clic para subir      │ |
| │     Logo, tarjeta, informe financiero...            │ |
| └──────────────────────────────────────────────────────┘ |
|            ─── O ───                                     |
| [nombre, dominio o URL_________________] [🔍 Buscar]     |
+----------------------------------------------------------+
```

#### 3. Actualizar Tipos

En `src/types/leadPotentialBuyers.ts`:

```typescript
export interface EnrichmentRequest {
  mode: 'text' | 'image';
  query?: string;
  imageBase64?: string;
}
```

---

### Secuencia de Implementacion

1. **Edge Function**: Actualizar `potential-buyer-enrich` con modo imagen
   - Añadir detección de modo (text vs image)
   - Implementar análisis con GPT-4o Vision
   - Mantener compatibilidad con flujo texto existente

2. **Componente**: Actualizar `BuyerQuickSearch.tsx`
   - Añadir input file para imágenes
   - Implementar conversión a base64
   - Añadir preview de imagen
   - Estados de carga específicos para imagen

3. **Desplegar** edge function actualizada

---

### Resultado Visual Esperado

**Estado inicial:**
```text
+---------------------------------------------+
| 🪄 Búsqueda inteligente                     |
+---------------------------------------------+
| [📷] [carpas-zaragoza.es       ] [🔍]       |
|                                             |
| Sube imagen o escribe nombre/URL            |
+---------------------------------------------+
```

**Después de subir imagen:**
```text
+---------------------------------------------+
| 🪄 Analizando imagen...                     |
+---------------------------------------------+
| [Vista previa de la imagen subida]          |
| ████████░░░░ Extrayendo datos con IA...     |
+---------------------------------------------+
```

**Resultado encontrado:**
```text
+---------------------------------------------+
| ✅ Empresa detectada en imagen              |
+---------------------------------------------+
| [LOGO]  CARPAS ZARAGOZA SL                 |
|         Industrial · 1M-5M€                 |
|         Fabricación de carpas...            |
|                                             |
| [✓ Usar estos datos]  [✏️ Editar manual]   |
+---------------------------------------------+
```

---

### Consideraciones Tecnicas

- **GPT-4o Vision**: Mejor modelo para extracción de texto e interpretación de imágenes
- **Base64**: Las imágenes se envían como data URL (como en `parse-campaign-screenshot`)
- **Límite de tamaño**: Limitar a 5MB para evitar timeouts
- **Formatos**: Aceptar PNG, JPG, WEBP
- **Fallback**: Si Vision no extrae datos útiles, mostrar mensaje y permitir edición manual
- **Logo**: Si se detecta dominio en la imagen, buscar logo con Clearbit

---

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `supabase/functions/potential-buyer-enrich/index.ts` | Añadir modo imagen con GPT-4o Vision |
| `src/components/admin/leads/BuyerQuickSearch.tsx` | Añadir upload de imagen y preview |
| `src/types/leadPotentialBuyers.ts` | Añadir tipos para request con imagen |

