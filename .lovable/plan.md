

## Simulador de Operacion para el Sector Seguridad

### Concepto

Crear una herramienta interactiva especifica para empresas de seguridad privada que simule una operacion de compraventa, teniendo en cuenta las metricas clave del sector: ingresos recurrentes por contratos, numero de conexiones en CRA (Central Receptora de Alarmas), personal habilitado, licencias y certificaciones. Seria una nueva landing page en `/lp/simulador-seguridad`.

### Diferencias con la calculadora generica

| Calculadora actual | Simulador Seguridad |
|---|---|
| Pide facturacion y EBITDA genericos | Pide ingresos recurrentes mensuales (MRR), numero de conexiones CRA, contratos activos |
| Multiplo EBITDA estandar | Multiplo ajustado por recurrencia, churn rate y tipo de servicio (vigilancia, alarmas, contra incendios) |
| Resultado: rango de valoracion | Resultado: valoracion + simulacion de estructura de operacion (precio fijo + earn-out ligado a retencion de contratos) |
| Formulario generico | Formulario con subsectores especificos: vigilancia, alarmas, sistemas electronicos, contra incendios, ciberseguridad |

### Flujo del simulador

1. **Paso 1 - Tipo de empresa**: seleccionar subsector (alarmas/CRA, vigilancia, sistemas electronicos, contra incendios, ciberseguridad, mixto)
2. **Paso 2 - Datos clave**: segun el subsector, pedir metricas especificas (MRR, conexiones, contratos, personal, licencias)
3. **Paso 3 - Contacto**: nombre, email, empresa (para captar el lead)
4. **Resultado**: valoracion estimada con desglose (valor base + prima por recurrencia + prima por licencias), estructura de deal sugerida (% precio fijo + % earn-out), y comparativa con operaciones recientes del sector

### Archivos a crear

| Archivo | Descripcion |
|---|---|
| `src/pages/LandingSimuladorSeguridad.tsx` | Pagina principal de la landing con SEO, layout y contenido contextual |
| `src/components/security-simulator/SecuritySimulatorForm.tsx` | Formulario multi-paso con campos especificos del sector |
| `src/components/security-simulator/SecuritySimulatorResults.tsx` | Visualizacion de resultados: valoracion, estructura de deal, comparativa |
| `src/components/security-simulator/subsectorFields.ts` | Configuracion de campos por subsector (alarmas vs vigilancia vs contra incendios) |
| `src/utils/securityValuation.ts` | Logica de calculo: multiplos por subsector, primas por recurrencia, simulacion de earn-out |

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/App.tsx` | Anadir ruta `/lp/simulador-seguridad` |
| `src/pages/sectores/Seguridad.tsx` | Anadir CTA que lleve al simulador desde la pagina de sector |

### Logica de valoracion (securityValuation.ts)

- **Alarmas/CRA**: valoracion basada en numero de conexiones x valor por conexion (rango 800-1.500 EUR/conexion segun mercado) + prima por % de contratos > 24 meses
- **Vigilancia**: multiplo EBITDA (4x-6x) ajustado por concentracion de clientes y margen operativo
- **Sistemas electronicos**: multiplo sobre ingresos recurrentes de mantenimiento (1.5x-3x MRR anual) + backlog de instalaciones
- **Contra incendios**: multiplo mixto (EBITDA + cartera de mantenimiento obligatorio)
- **Ciberseguridad**: multiplo revenue (2x-5x) por perfil de crecimiento

### Captacion de leads

- El formulario guardara el lead en `contact_leads` con `source = 'simulador-seguridad'` y los datos del subsector
- Se enviara notificacion al equipo via la edge function `send-form-notifications`
- El resultado se podra descargar como PDF con branding Capittal

### SEO

- URL: `/lp/simulador-seguridad`
- Title: "Simulador de Operacion Seguridad Privada | Capittal M&A"
- Meta description enfocada en keywords: valoracion empresa seguridad, vender empresa alarmas, compraventa vigilancia
- Canonical y hreflang configurados

### Detalle tecnico

La estructura reutiliza patrones existentes del proyecto:
- Layout con `UnifiedLayout variant="landing"` igual que las otras LPs
- Captacion de leads con el mismo protocolo de persistencia (send-form-notifications + contact_leads)
- Componentes de UI de shadcn/ui para formularios (Select, Input, RadioGroup)
- Recharts para la visualizacion del desglose de valoracion en resultados
- React PDF Renderer para generacion del informe descargable

