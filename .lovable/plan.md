

# Plan: Actualizar llms.txt, llms-full.txt y ai.txt

## Cambios detectados

Comparando la estructura actual del sitio (navigation data) con los archivos para bots, hay varias discrepancias:

### Contenido que falta o tiene URLs incorrectas

1. **ai.txt** — URLs de servicios incorrectas:
   - `Due Diligence` apunta a `/due-diligence` → debería ser `/servicios/due-diligence`
   - `Reestructuraciones` apunta a `/reestructuraciones` → debería ser `/servicios/reestructuraciones`
   - `Planificación Fiscal` apunta a `/planificacion-fiscal` → debería ser `/servicios/planificacion-fiscal`
   - Faltan servicios: **Asesoramiento Legal**, **Search Funds**
   - Falta herramienta: **Test Exit-Ready**
   - Faltan recursos: **Newsletter**, **Webinars**, **Marketplace**, **Empleos**
   - Falta sección: **Nosotros** (De Looper a Capittal, Por Qué Elegirnos, Equipo, Casos de Éxito)
   - Falta: **Programa de Colaboradores**

2. **llms.txt** — Mismos problemas de URLs y contenido faltante que ai.txt, además:
   - Contacto apunta a `/contacto` pero el sitio usa `/#contacto`
   - Falta enlace a `reservar-reunion`

3. **llms-full.txt** — Mismas correcciones, más:
   - Falta sección de **Asesoramiento Legal** con URL correcta
   - Falta sección de **Nosotros / Sobre Capittal**
   - Falta mención del **Programa de Colaboradores**
   - Falta mención de **Empleos** y **Marketplace**
   - Contacto: añadir URL de reserva de reunión

### Fecha de actualización
- ai.txt: actualizar `Last updated` a `2026-03-10`

## Implementación

Se actualizarán los 3 archivos en paralelo:

1. **`public/ai.txt`**: Corregir URLs de servicios, añadir servicios faltantes (Asesoramiento Legal, Search Funds), añadir Test Exit-Ready a herramientas, añadir recursos faltantes (Newsletter, Webinars, Marketplace, Empleos), añadir sección About/Nosotros, añadir Programa Colaboradores, actualizar fecha.

2. **`public/llms.txt`**: Corregir URLs, añadir servicios y recursos faltantes, añadir secciones de Nosotros y Colaboradores, corregir URL de contacto a `/#contacto`, añadir enlace de reserva.

3. **`public/llms-full.txt`**: Mismas correcciones expandidas con descripciones detalladas para cada nuevo servicio/recurso/sección.

