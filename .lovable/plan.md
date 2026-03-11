

## Plan: Hacer el nombre de campaña editable inline

### Situación actual
- El nombre de la campaña se muestra como texto estático en `CampaignRegistryTable.tsx` (línea 230), con el comentario "non-editable in table, use modal".
- Ya existe `updateCampaignCell` en el hook `useCampaignRegistry` que permite actualizar cualquier campo de campaña (incluido `name`).
- Ya existe el componente `EditableCell` que gestiona edición inline con feedback visual.

### Cambio necesario
Un único cambio en `CampaignRegistryTable.tsx`: reemplazar el `<div>` estático del nombre por el componente `EditableCell`, conectado a `updateCampaignCell`.

**Archivo:** `src/components/admin/campaigns/CampaignRegistryTable.tsx`

Reemplazar el bloque del case `'campaign_name'` (líneas ~223-236) para usar `EditableCell`:

```tsx
case 'campaign_name':
  return (
    <div className="px-3 py-2.5 flex items-center gap-2">
      <span className={cn(
        "w-2 h-2 rounded-full shrink-0",
        campaign.delivery_status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'
      )} />
      <div className="min-w-0 flex-1">
        <EditableCell
          value={campaign.name}
          onSave={async (newValue) => {
            if (!newValue.trim()) throw new Error('El nombre no puede estar vacío');
            await updateCampaignCell({ campaignId: campaign.id, field: 'name', value: newValue.trim() });
          }}
          displayClassName="font-medium"
          emptyText="Sin nombre"
        />
        <div className="text-[10px] text-muted-foreground">
          {CHANNEL_LABELS[campaign.channel]}
        </div>
      </div>
    </div>
  );
```

- Importar `EditableCell` si no está ya importado.
- No requiere cambios en base de datos ni en el hook.

