
## Añadir Ahrefs Web Analytics al TrackingInitializer

### Cambio
Añadir una nueva sección al `TrackingInitializer.tsx` que cargue el script de Ahrefs Web Analytics (`https://analytics.ahrefs.com/analytics.js`) con el atributo `data-key="EQfyZr09+AcMIe1vpsSrVQ"`.

### Ubicacion
Se insertara como una nueva seccion `// ========== AHREFS WEB ANALYTICS ==========` despues del bloque de Brevo (linea ~325), siguiendo el mismo patron de los demas scripts:
1. Comprobar si ya esta cargado (evitar duplicados)
2. Crear elemento `<script>` con `async`, `src` y `data-key`
3. Append al `<head>`

### Detalle tecnico

```typescript
// ========== AHREFS WEB ANALYTICS ==========
if (!document.getElementById('ahrefs-analytics')) {
  const ahrefsScript = document.createElement('script');
  ahrefsScript.id = 'ahrefs-analytics';
  ahrefsScript.src = 'https://analytics.ahrefs.com/analytics.js';
  ahrefsScript.setAttribute('data-key', 'EQfyZr09+AcMIe1vpsSrVQ');
  ahrefsScript.async = true;
  document.head.appendChild(ahrefsScript);
}
```

### Notas
- Ahrefs Analytics es un script ligero de analitica web que no requiere consentimiento de cookies (no usa cookies ni datos personales), por lo que se carga sin depender de Cookiebot.
- Se respetan los guards existentes: no se carga en preview/sandbox, iframes, ni dominios no permitidos.
- No se modifica `TrackingConfigService` ya que la data-key es fija y publica.
