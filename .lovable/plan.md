

## Plan: Añadir columna CNAE a las listas de contacto

### Problema
El campo CNAE se importa y almacena correctamente, pero no aparece como columna visible porque falta en la definición de columnas por defecto.

### Cambio

**Archivo: `src/hooks/useListColumnPreferences.ts`**

Añadir una entrada en `DEFAULT_COLUMNS` para CNAE, visible por defecto, después de CIF (posición 3). Ajustar las posiciones del resto de columnas.

```typescript
{ key: 'cnae', label: 'CNAE', visible: true, position: 3, sortable: true },
```

Las columnas existentes a partir de `descripcion_actividad` se desplazarán una posición.

### Nota
Los usuarios que ya tengan preferencias guardadas en localStorage recibirán la columna automáticamente gracias al merge existente (líneas 59-67), aunque aparecerá al final. Para verla en la posición correcta tendrán que pulsar "Restablecer" en el configurador de columnas.

