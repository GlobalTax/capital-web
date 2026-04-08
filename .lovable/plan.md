

## Plan: Simplificar dropdown y mostrar estado email pre-llamada en la tarjeta

### Cambios en `PipelineCard.tsx`

**1. Simplificar el dropdown (3 puntos)**
- Eliminar "Ver detalle", "Llamada completada" y "No contestó" del menú
- Mantener solo la opción "Enviar email pre-llamada" (deshabilitada si ya se envió)

**2. Indicador visual en la tarjeta**
- Añadir un icono/badge visible directamente en la tarjeta (sin necesidad de abrir el menú) que muestre el estado del email pre-llamada:
  - **Pendiente de enviar**: Icono de email con color naranja/ámbar y texto "Email pendiente"
  - **Enviado**: Icono de check con color verde y texto "Email enviado"
- Se ubicará debajo de los call attempts o antes del footer, como una línea compacta

**3. Hacer clic en la tarjeta sigue abriendo "Ver detalle"**
- El click en la tarjeta ya llama a `onViewDetails()`, así que no se pierde esa funcionalidad

