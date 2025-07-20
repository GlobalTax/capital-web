
# Sistema de Sanitización y Seguridad XSS

## Descripción General

Este sistema implementa protección robusta contra ataques XSS (Cross-Site Scripting) utilizando DOMPurify y validaciones personalizadas en toda la aplicación.

## Componentes Principales

### 1. Sanitización (`src/utils/sanitization.ts`)

#### Perfiles de Sanitización
- **STRICT**: Solo texto plano, remueve todo HTML
- **MODERATE**: Permite HTML básico (b, i, em, strong, p, br)
- **PERMISSIVE**: Permite HTML más amplio incluyendo enlaces y listas

#### Funciones Principales
```typescript
// Sanitización general
sanitizeText(input: string, profile: 'STRICT' | 'MODERATE' | 'PERMISSIVE')

// Sanitización específica por tipo de campo
sanitizeEmail(email: string)
sanitizePhone(phone: string)
sanitizeCompanyName(name: string)
sanitizePerson(name: string)

// Sanitización de objetos completos
sanitizeObject(obj: Record<string, any>, fieldProfiles: {...})
```

#### Detección de XSS
```typescript
// Detecta patrones comunes de XSS
detectXSSAttempt(input: string): boolean

// Logging de eventos de seguridad
logSecurityEvent(eventType: 'XSS_ATTEMPT' | 'SANITIZATION_APPLIED', details: {...})
```

### 2. Validación Integrada (`src/utils/validationUtils.ts`)

Todas las funciones de validación ahora incluyen sanitización automática:

```typescript
// Validación + sanitización de email
const result = validateEmail(userInput);
// result.sanitizedValue contiene el valor limpio
// result.isValid indica si es válido
// result.message contiene errores si los hay
```

### 3. Implementación en Formularios

#### Formulario de Contacto (`src/hooks/useContactForm.tsx`)
- Sanitización automática de todos los campos antes del envío
- Validación integrada con logging de intentos de XSS
- Uso de valores sanitizados para inserción en base de datos

#### Formulario Standalone (`src/components/standalone/StandaloneCompanyForm.tsx`)
- Sanitización en tiempo real durante la escritura
- Validación al perder el foco (onBlur)
- Mostrado de errores de validación
- Formateo automático de teléfonos españoles

## Configuración de Seguridad

### Logging de Eventos
Todos los intentos de XSS y aplicaciones de sanitización se registran:

```typescript
// Ejemplo de log de seguridad
{
  timestamp: "2024-01-15T10:30:00.000Z",
  type: "XSS_ATTEMPT",
  context: "email_validation",
  userAgent: "Mozilla/5.0...",
  inputLength: 45,
  hadScript: true,
  hadOnEvent: false
}
```

### Perfiles por Contexto
- **Formularios de contacto**: STRICT (solo texto plano)
- **Campos de empresa**: STRICT con caracteres especiales permitidos (&, -, etc.)
- **Contenido HTML futuro**: MODERATE o PERMISSIVE según necesidad

## Testing y Verificación

### Casos de Test Incluidos (`src/utils/testingSanitization.ts`)

#### XSS Test Cases
```javascript
[
  '<script>alert("xss")</script>',
  'javascript:void(0)',
  '<img src="x" onerror="alert(1)">',
  '<iframe src="javascript:alert(1)"></iframe>',
  // ... más casos
]
```

#### Contenido Válido
```javascript
[
  'Empresa S.L.',
  'Juan Pérez García',
  '+34 600 123 456',
  'contacto@empresa.com',
  // ... más casos
]
```

### Ejecutar Tests
```typescript
import { logSanitizationTestResults } from '@/utils/testingSanitization';

// Ejecutar todos los tests y mostrar resultados
const results = logSanitizationTestResults();
```

## Mejores Prácticas

### 1. Sanitización por Defecto
- Todos los inputs del usuario deben ser sanitizados
- Usar el perfil más restrictivo posible para cada contexto
- Nunca confiar en datos del frontend sin sanitizar

### 2. Validación en Capas
1. **Frontend**: Sanitización y validación para UX
2. **Backend**: Re-sanitización y validación para seguridad
3. **Base de datos**: Constraints adicionales

### 3. Logging y Monitoreo
- Registrar todos los intentos de XSS
- Monitorear patrones de ataques
- Alertas automáticas para intentos persistentes

### 4. Testing Regular
- Ejecutar tests de sanitización en cada deploy
- Verificar nuevos vectores de ataque
- Actualizar patrones de detección regularmente

## Configuración en Producción

### Variables de Entorno
- Logging de seguridad debe enviarse a servicio externo
- Configurar alertas para eventos de seguridad
- Monitoreo de performance de sanitización

### Actualizaciones
- Mantener DOMPurify actualizado
- Revisar nuevos vectores de XSS periódicamente
- Actualizar patrones de detección según amenazas emergentes

## Compatibilidad

### Navegadores Soportados
- Todos los navegadores modernos (DOMPurify requirement)
- Fallback manual para navegadores sin DOMPurify

### Performance
- ~0.1ms por operación de sanitización
- Caché interno para patrones repetidos
- Benchmark automático incluido

## Extensibilidad

### Nuevos Perfiles
```typescript
// Añadir nuevos perfiles en SANITIZATION_PROFILES
CUSTOM_PROFILE: {
  ALLOWED_TAGS: ['custom', 'tags'],
  ALLOWED_ATTR: ['custom-attr'],
  // ...configuración
}
```

### Nuevos Validadores
```typescript
// Crear validadores específicos
export const validateCustomField = (input: string): ValidationResult => {
  // Detección XSS
  if (detectXSSAttempt(input)) {
    logSecurityEvent('XSS_ATTEMPT', { input, context: 'custom_field' });
    return { isValid: false, message: 'Contenido no válido' };
  }
  
  // Sanitización
  const sanitized = sanitizeText(input, 'CUSTOM_PROFILE');
  
  // Validación específica
  // ...
  
  return { isValid: true, sanitizedValue: sanitized };
};
```
