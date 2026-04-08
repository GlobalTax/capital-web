
## Plan: Mostrar estado email solo en etapas iniciales

El indicador de "Email pendiente/enviado" y el dropdown de envío solo se mostrarán cuando el lead esté en las columnas **Nuevo** o **Contactando**. A partir de **Calificado** en adelante, se ocultan ambos elementos ya que son irrelevantes.

### Cambios en `PipelineCard.tsx`

1. Definir un conjunto de estados iniciales donde el email es relevante:
   ```ts
   const EARLY_STAGES = ['nuevo', 'contactando'];
   ```

2. Condicionar la visibilidad del **indicador visual** (líneas 226-243) para que solo se renderice si `lead.lead_status_crm` está en `EARLY_STAGES`.

3. Condicionar el **dropdown de 3 puntos** (líneas 163-174) para que solo se muestre en esas mismas etapas. En el resto de columnas, el botón de 3 puntos desaparece completamente ya que no tiene otras opciones.
