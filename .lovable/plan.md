
## Eliminar "Email enviado" de las tarjetas del Pipeline

### Cambio

**`src/features/leads-pipeline/components/PipelineCard.tsx`** (líneas 237-257)

Eliminar el bloque "Email Status" completo (email abierto / email enviado), manteniendo solo el contador de llamadas:

```tsx
{/* Call attempts only */}
{lead.call_attempts_count && lead.call_attempts_count > 0 && (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span className="flex items-center">
      <Phone className="h-3 w-3 mr-1" />
      {lead.call_attempts_count} llamada{lead.call_attempts_count > 1 ? 's' : ''}
    </span>
  </div>
)}
```

También limpiar imports no usados (`Mail`, `MailOpen`) si ya no se usan en otro lugar del componente.
