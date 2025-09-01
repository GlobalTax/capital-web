# Configuración del Pixel de Meta - Guía de Implementación

## ✅ IMPLEMENTACIÓN COMPLETADA

El sistema de tracking de Meta Pixel está **completamente implementado** y listo para usar. Solo necesitas configurar tu Pixel ID.

## 🚀 CÓMO CONFIGURAR (2 MINUTOS)

### Paso 1: Obtener tu Pixel ID
1. Ve a [Meta Business Manager](https://business.facebook.com)
2. Selecciona tu cuenta publicitaria
3. Ve a **Administrador de Eventos** → **Conjuntos de datos**
4. Copia el ID del pixel (15-16 dígitos, ej: `123456789012345`)

### Paso 2: Configurar en tu web
1. Ve a tu panel de admin: `https://tudominio.com/admin`
2. Busca **"Configuración de Tracking"**
3. En la sección **"Meta Pixel (Facebook)"**:
   - Pega tu Pixel ID
   - Activa **"Enable Lead Tracking"**
   - Activa **"Enable Heatmaps"** (opcional)
4. Presiona **"Guardar Cambios"**

¡Listo! El pixel ya está funcionando.

## 📊 EVENTOS QUE SE TRACKEAN AUTOMÁTICAMENTE

| Acción del Usuario | Evento Meta Pixel | Valor Asignado |
|-------------------|-------------------|----------------|
| **Calculadora de valoración** | `InitiateCheckout` | €1,500 |
| **Formularios de contacto** | `Lead` | €2,000 |
| **Descargas de recursos** | `ViewContent` | - |
| **Clics en teléfono/contacto** | `Contact` | - |
| **Navegación de páginas** | `PageView` | - |

## 🔍 VERIFICACIÓN

### 1. Usando Meta Pixel Helper
- Instala [Meta Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) en Chrome
- Navega por tu web
- Verifica que aparecen los eventos en tiempo real

### 2. En Meta Events Manager
- Ve a Meta Business Manager → Administrador de Eventos
- Verifica que llegan los datos en tiempo real
- Los eventos aparecen en 15-30 segundos

## ⚙️ CONFIGURACIONES ADICIONALES DISPONIBLES

### Google Analytics
- Campo: `Google Analytics ID`
- Formato: `G-XXXXXXXXXX`

### LinkedIn Insight Tag
- Campo: `LinkedIn Insight Tag`
- Formato: Solo números

### Hotjar (Heatmaps)
- Campo: `Hotjar Site ID`
- Formato: Solo números

### Código Personalizado
- Área de texto para JavaScript personalizado
- Se ejecuta automáticamente al cargar la página

## 🎯 PÁGINAS DE ALTA CONVERSIÓN

El sistema prioriza automáticamente el tracking en:
- `/lp/calculadora` - Calculadora principal
- `/contacto` - Página de contacto
- `/venta-empresas` - Servicios de venta
- `/servicios/*` - Todas las páginas de servicios

## 🔒 SEGURIDAD Y PRIVACIDAD

- ✅ No trackea en rutas `/admin`
- ✅ No trackea en desarrollo (`NODE_ENV !== 'production'`)
- ✅ No trackea en iframes
- ✅ Configuración se guarda localmente y de forma segura
- ✅ Validación de formatos de IDs

## 📈 MONITOREO DE RENDIMIENTO

### Consola del navegador
```javascript
// Ver estado del tracking
console.log('Meta Pixel Status:', window.fbq);

// Trackear evento manual
window.fbq('track', 'CustomEvent', { value: 100 });
```

### Métricas automáticas
- Todos los eventos incluyen timestamp y URL
- Attribution tracking habilitado
- Funnel analysis disponible

## 🆘 SOLUCIÓN DE PROBLEMAS

### El pixel no aparece en Meta Pixel Helper
1. Verificar que el Pixel ID es correcto
2. Comprobar que está en producción (no desarrollo)
3. Revisar consola del navegador por errores

### Los eventos no llegan a Meta
1. Verificar conexión a internet
2. Comprobar que no hay bloqueadores de ads
3. Esperar 15-30 segundos para propagación

### Configuración no se guarda
1. Verificar formato del Pixel ID (15-16 dígitos)
2. Comprobar permisos de localStorage
3. Revisar consola por errores de validación

## 🎉 ¡YA ESTÁ LISTO!

Tu configuración del Pixel de Meta está **completamente implementada**. Solo necesitas:

1. **Obtener tu Pixel ID** de Meta Business Manager
2. **Configurarlo** en `/admin` → Configuración de Tracking
3. **Verificar** con Meta Pixel Helper

**Tiempo total: 2-3 minutos**

---

*Sistema implementado por Capittal - Marketing Intelligence Platform*