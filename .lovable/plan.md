
# Plan: Habilitar acciones de guardado y envío en Calculadora Manual

## Diagnóstico del Estado Actual

### Problema Identificado
La calculadora manual (`/admin/calculadora-manual`) usa `UnifiedCalculator` con la configuración `MANUAL_ENTRY_CONFIG` que tiene `autosave: false`. El flujo actual:

1. El usuario completa el formulario (paso 1)
2. Al pulsar "Calcular", se mueve al paso 2 (`Step4Results`)
3. `Step4Results` llama automáticamente a `saveValuation()` que:
   - Guarda en base de datos 
   - **Envía email automáticamente** (sin opción de solo guardar)

**Resultado**: No hay control sobre cuándo enviar email vs solo guardar. Además, parece que no hay valoraciones guardadas con `source_project = 'manual-admin-entry'` (0 registros), sugiriendo un posible problema en el flujo.

### Flujo de "Valoración PRO" (Referencia)
El `ProfessionalValuationForm.tsx` tiene:
- Botón "Guardar borrador" que llama a `onSave(data, true)` - solo guarda
- Botón "Enviar por email" que llama a `onSendEmail(data, email)` - guarda + envía

Estos usan hooks separados (`useProfessionalValuations`) y la edge function `send-professional-valuation-email`.

---

## Arquitectura de la Solución

### Principio: Reutilizar Servicios Existentes

```text
+---------------------------+
|  ManualLeadEntryPage.tsx  |
+---------------------------+
            |
            v
+---------------------------+
|    ManualResultsStep      | <-- NUEVO componente
+---------------------------+
     |             |
     v             v
+-----------+  +-----------------+
| Guardar   |  | Enviar por mail |
| (sin mail)|  |                 |
+-----------+  +-----------------+
     |             |
     v             v
+------------------+
| useOptimized...  | (reutilizar hook existente)
| saveValuation()  |
+------------------+
     |                    |
     v                    v
+------------------+  +----------------------+
| update-valuation |  | send-valuation-email |
| (Edge Function)  |  | (Edge Function)      |
+------------------+  +----------------------+
```

---

## Cambios a Implementar

### 1. Crear Componente `ManualResultsStep.tsx`
**Ubicación**: `src/components/admin/valuation/ManualResultsStep.tsx`

Componente específico para mostrar resultados de la calculadora manual con dos acciones:

```typescript
interface ManualResultsStepProps {
  companyData: ExtendedCompanyData;
  result: ValuationResult;
  extraMetadata?: {
    leadSource?: string;
    leadSourceDetail?: string;
  };
  onReset: () => void;
}
```

**Botones:**
- "Guardar valoración" (icono Save) - guarda sin enviar email
- "Enviar por email" (icono Send) - guarda + envía email al cliente + copia interna
- Estados: loading individual, disabled mientras procesa

### 2. Modificar `Step4Results.tsx` para Calculadora Manual

Añadir prop `manualMode?: boolean` que:
- Si `true`: NO ejecuta el guardado automático con email en `useEffect`
- Muestra botones de acción manual en lugar de los normales
- Reutiliza `useOptimizedSupabaseValuation` pero con control explícito

### 3. Crear Función `saveWithoutEmail` en Hook

Modificar `useOptimizedSupabaseValuation.tsx` para añadir función que:
- Guarda valoración en DB (igual que ahora)
- NO ejecuta el bloque de `setTimeout` que envía email
- Retorna éxito/fracaso

```typescript
const saveValuationOnly = useCallback(async (
  companyData: CompanyData, 
  result: ValuationResult, 
  uniqueToken?: string,
  options?: { sourceProject?: string; leadSource?: string; leadSourceDetail?: string; }
) => {
  // Solo guarda en DB, sin enviar email
  // Reutiliza lógica de saveValuation pero sin el setTimeout de emails
}, [...]);
```

### 4. Crear Función `sendEmailOnly` para Envío Explícito

Nueva función que:
- Verifica que la valoración exista
- Llama a `send-valuation-email` edge function
- Actualiza campo `email_sent` en DB
- Retorna resultado con messageId

```typescript
const sendValuationEmail = useCallback(async (
  companyData: CompanyData,
  result: ValuationResult,
  valuationId: string
) => {
  // Invoca send-valuation-email directamente
  // Actualiza email_sent = true
}, [...]);
```

### 5. Actualizar `StepContentV2.tsx` para Modo Manual

Detectar cuando `sourceProject === 'manual-admin-entry'` y:
- Pasar prop `manualMode={true}` a `Step4Results`
- O renderizar componente alternativo `ManualResultsStep`

---

## Flujo Detallado de Cada Acción

### Acción: "Guardar (sin enviar)"

```text
1. Usuario completa formulario
2. Click en "Calcular valoración"
3. Se muestra resultado con botones
4. Click en "Guardar valoración"
   |
   v
5. saveValuationOnly()
   - createInitialValuation() si no existe token
   - update-valuation edge function con datos finales
   - source_project = 'manual-admin-entry'
   - lead_source = 'meta-ads' (o el seleccionado)
   |
   v
6. Toast: "Valoración guardada correctamente"
7. Valoración visible en /admin/contacts con badge "Manual"
```

### Accion: "Enviar por mail"

```text
1. Click en "Enviar por email"
   |
   v
2. Validar email existe
   - Si no: Toast error "El contacto no tiene email"
   - Mantener botón "Guardar" habilitado
   |
   v
3. saveValuationOnly() primero (si no guardada)
   |
   v
4. sendValuationEmail()
   - Invoca send-valuation-email
   - Email al cliente con PDF
   - Email interno a equipo (BCC automático ya configurado)
   |
   v
5. Verificar respuesta
   - Si error: Toast error con mensaje específico
   - No marcar como éxito si provider falló
   |
   v
6. Toast: "Email enviado correctamente"
7. Actualizar UI (deshabilitar botón re-envío)
```

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/admin/valuation/ManualResultsStep.tsx` | **CREAR** | Componente de resultados con botones separados |
| `src/hooks/useOptimizedSupabaseValuation.tsx` | MODIFICAR | Añadir `saveValuationOnly()` y `sendValuationEmail()` |
| `src/components/valuation-v2/StepContentV2.tsx` | MODIFICAR | Detectar modo manual y usar componente correcto |
| `src/components/valuation/Step4Results.tsx` | MODIFICAR | Añadir prop `manualMode` para skip auto-email |

---

## Detalle Técnico: Nuevo Componente ManualResultsStep

```typescript
// src/components/admin/valuation/ManualResultsStep.tsx

import { useState } from 'react';
import { Save, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedSupabaseValuation } from '@/hooks/useOptimizedSupabaseValuation';
import { formatCurrency } from '@/shared/utils/format';

interface ManualResultsStepProps {
  companyData: ExtendedCompanyData;
  result: ValuationResult;
  extraMetadata?: {
    leadSource?: string;
    leadSourceDetail?: string;
  };
  sourceProject?: string;
  onReset: () => void;
}

export const ManualResultsStep = ({ 
  companyData, 
  result, 
  extraMetadata,
  sourceProject,
  onReset 
}: ManualResultsStepProps) => {
  const { toast } = useToast();
  const { saveValuationOnly, sendValuationEmail, isProcessing } = useOptimizedSupabaseValuation();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [savedValuationId, setSavedValuationId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSaveOnly = async () => {
    setIsSaving(true);
    try {
      const result = await saveValuationOnly(companyData, result, undefined, {
        sourceProject: sourceProject || 'manual-admin-entry',
        leadSource: extraMetadata?.leadSource,
        leadSourceDetail: extraMetadata?.leadSourceDetail
      });
      
      if (result.success) {
        setSavedValuationId(result.valuationId);
        toast({
          title: "Valoración guardada",
          description: "La valoración se ha guardado en contactos correctamente.",
        });
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la valoración. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    // Validar email
    if (!companyData.email) {
      toast({
        title: "Email requerido",
        description: "El contacto no tiene email. Puedes guardar la valoración sin enviar.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // Guardar primero si no guardada
      let valuationId = savedValuationId;
      if (!valuationId) {
        const saveResult = await saveValuationOnly(companyData, result, undefined, {
          sourceProject: sourceProject || 'manual-admin-entry',
          leadSource: extraMetadata?.leadSource,
          leadSourceDetail: extraMetadata?.leadSourceDetail
        });
        if (!saveResult.success) throw new Error('Error al guardar');
        valuationId = saveResult.valuationId;
        setSavedValuationId(valuationId);
      }

      // Enviar email
      const emailResult = await sendValuationEmail(companyData, result, valuationId);
      
      if (emailResult.success) {
        setEmailSent(true);
        toast({
          title: "Email enviado",
          description: `Email enviado a ${companyData.email} y copia al equipo.`,
        });
      } else {
        throw new Error(emailResult.error || 'Error al enviar email');
      }
    } catch (error: any) {
      toast({
        title: "Error al enviar email",
        description: error.message || "No se pudo enviar el email. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen de valoración - reutilizar estructura de Step4Results */}
      {/* ... mostrar companyData, result ... */}

      {/* Estado de guardado */}
      {savedValuationId && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Valoración guardada en contactos</span>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={handleSaveOnly}
          disabled={isSaving || isSending || savedValuationId !== null}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : savedValuationId ? 'Guardada' : 'Guardar valoración'}
        </Button>

        <Button
          onClick={handleSendEmail}
          disabled={isSaving || isSending || emailSent || !companyData.email}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Enviando...' : emailSent ? 'Email enviado' : 'Enviar por email'}
        </Button>
      </div>

      {/* Advertencia si no tiene email */}
      {!companyData.email && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span className="text-amber-800">
            Sin email de contacto. Puedes guardar la valoración sin enviar.
          </span>
        </div>
      )}
    </div>
  );
};
```

---

## Detalle Técnico: Modificación del Hook

```typescript
// En useOptimizedSupabaseValuation.tsx - AÑADIR funciones

// Función para guardar SIN enviar email
const saveValuationOnly = useCallback(async (
  companyData: CompanyData, 
  result: ValuationResult, 
  uniqueToken?: string,
  options?: {
    sourceProject?: string;
    leadSource?: string;
    leadSourceDetail?: string;
  }
) => {
  // Reutiliza toda la lógica de saveValuation
  // EXCEPTO el setTimeout que ejecuta el envío de email
  // Retorna { success: true, valuationId: xxx } o { success: false }
}, [/* deps */]);

// Función para enviar email de valoración ya guardada
const sendValuationEmail = useCallback(async (
  companyData: CompanyData,
  result: ValuationResult,
  valuationId: string
) => {
  const response = await supabase.functions.invoke('send-valuation-email', {
    body: {
      recipientEmail: companyData.email,
      companyData,
      result,
      valuationId,
      sourceProject: 'manual-admin-entry'
      // Edge function ya maneja copia interna
    }
  });
  
  if (response.error) {
    return { success: false, error: response.error.message };
  }
  
  return { 
    success: true, 
    messageId: response.data?.messageId,
    outboxId: response.data?.outboxId 
  };
}, []);
```

---

## Verificación del Edge Function send-valuation-email

El edge function `send-valuation-email` ya soporta:
- Detección de `sourceProject === 'manual-admin-entry'` (linea 352)
- Banner de "ENTRADA MANUAL" en email interno (lineas 404-430)
- Envío a equipo interno (lineas 324-332, 550-578)
- Envío a cliente (lineas 580-678)
- Validación de email del cliente antes de enviar (linea 581)
- Outbox tracking para reintentos (lineas 377-398)

**No requiere modificaciones** - ya está preparado.

---

## Pruebas Obligatorias

### Caso 1: Guardar sin enviar
1. Ir a `/admin/calculadora-manual`
2. Seleccionar origen "Meta Ads"
3. Completar formulario con datos de prueba (sin email)
4. Click "Calcular valoración"
5. Click "Guardar valoración"
6. Verificar:
   - Toast de éxito
   - Registro en `company_valuations` con `source_project = 'manual-admin-entry'`
   - Visible en `/admin/contacts` con badge "Manual"
   - NO se envió email (verificar logs de edge function)

### Caso 2: Guardar + Enviar con email válido
1. Completar formulario CON email válido
2. Click "Calcular valoración"
3. Click "Enviar por email"
4. Verificar:
   - Valoración guardada primero
   - Email al cliente (verificar bandeja)
   - Email interno al equipo
   - Toast de éxito
   - `email_sent = true` en DB

### Caso 3: Intento de enviar sin email
1. Completar formulario SIN email
2. Click "Calcular valoración"
3. Click "Enviar por email"
4. Verificar:
   - Toast de error "El contacto no tiene email"
   - Botón "Guardar valoración" sigue habilitado
   - No se envió nada

### Caso 4: Verificar que calculadora principal NO se rompe
1. Ir a `/lp/calculadora`
2. Completar formulario con email válido
3. Click "Calcular"
4. Verificar:
   - Flujo automático funciona igual
   - Email se envía automáticamente
   - Toast de éxito

---

## Orden de Implementación

1. Modificar `useOptimizedSupabaseValuation.tsx` - añadir las dos funciones nuevas
2. Crear `ManualResultsStep.tsx` - componente con botones
3. Modificar `StepContentV2.tsx` - detectar modo manual
4. Probar flujo completo
5. Verificar que LP principal sigue funcionando
