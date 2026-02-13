

## Mejorar etiquetas de anos financieros

### Cambio
Actualizar las etiquetas de los 3 campos de anos financieros en el Paso 1 de la campana para que sean mas descriptivas:

- **Ano 1** -> **Ultimo ano disponible** (con texto aclaratorio "Ultimo ejercicio depositado en el Registro Mercantil")
- **Ano 2** -> **Ano anterior**
- **Ano 3** -> **Dos anos antes**

### Archivo afectado

`src/components/admin/campanas-valoracion/steps/CampaignConfigStep.tsx` (lineas 138-159)

### Detalle del cambio

Reemplazar la etiqueta generica `Ano {idx + 1}` por etiquetas contextuales:
- idx 0: "Ultimo ano disponible"
- idx 1: "Ano anterior"  
- idx 2: "Dos anos antes"

Actualizar tambien el texto descriptivo de la seccion para que diga: "Indica el ultimo ejercicio depositado en el Registro Mercantil. Los demas anos se calculan a partir de este."

Opcionalmente, simplificar la UI: el usuario solo introduce el primer ano (ultimo disponible) y los otros dos se calculan automaticamente como ano-1 y ano-2, reduciendo friccion. Si prefieres mantener los 3 campos editables independientemente, se mantiene como esta pero solo cambian las etiquetas.

### Detalles tecnicos

Cambio minimo en el JSX del componente, sin impacto en base de datos ni en otros archivos.

