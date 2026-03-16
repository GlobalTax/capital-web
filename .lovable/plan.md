

## Plan: Corregir guardado del cuerpo del email

### Causa raíz

El problema es un bug de caché: cuando el auto-save guarda el template en la base de datos, **no invalida la query de la campaña** en React Query. Entonces:

1. El usuario edita el cuerpo del email → el auto-save actualiza la DB correctamente
2. El usuario cambia de paso (o la página se recarga)
3. Al volver al paso del email, el componente se remonta y lee `campaign.email_body_template` del caché de React Query, que **sigue teniendo el valor antiguo**
4. Los cambios "desaparecen"

Además, si el save falla (por RLS o cualquier error), el catch silencia el error sin mostrar nada al usuario.

### Solución

**Archivo: `src/hooks/useCampaignEmails.ts`** — En `saveTemplateMutation`, añadir `onSuccess` que invalide la query de la campaña:

```typescript
const saveTemplateMutation = useMutation({
  mutationFn: async (...) => { ... },
  onSuccess: () => {
    // Invalidar la query de la campaña para que el template actualizado se refleje
    queryClient.invalidateQueries({ queryKey: ['valuation-campaigns', campaignId] });
    queryClient.invalidateQueries({ queryKey: ['valuation-campaigns'] });
  },
});
```

**Archivo: `src/components/admin/campanas-valoracion/steps/MailStep.tsx`** — Dos cambios:

1. **Sincronizar estado local con prop**: Añadir un `useEffect` que actualice `subject` y `body` cuando `campaign.email_subject_template` / `email_body_template` cambien desde fuera (refetch), pero solo si el usuario no está editando activamente.

2. **Mostrar error en auto-save**: En el catch del `triggerAutoSave`, mostrar un toast de error en vez de silenciarlo.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useCampaignEmails.ts` | Invalidar query de campaña en `onSuccess` del `saveTemplateMutation` |
| `src/components/admin/campanas-valoracion/steps/MailStep.tsx` | Sincronizar estado local con prop + mostrar errores de save |

