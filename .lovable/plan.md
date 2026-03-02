

## Anadir buscador en tabla de valoraciones outbound

### Que se hace
Anadir un input de busqueda encima de la tabla en `ReviewCalculateStep.tsx` que filtre empresas en tiempo real por nombre, con contador de resultados y boton limpiar.

### Cambios (1 solo archivo)

**`src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx`**

1. Anadir estado `searchQuery` (useState)
2. Anadir import de `Search` desde lucide-react
3. Crear `filteredCompanies` con `useMemo` que filtra `companies` por `client_company` (case-insensitive)
4. Anadir input de busqueda entre la barra de acciones y la tabla (dentro del Card, encima de Table)
   - Icono Search a la izquierda
   - Placeholder dinamico: "Buscar entre {companies.length} empresas..."
   - Boton X para limpiar cuando hay texto
   - Contador de resultados cuando hay query activa
5. Reemplazar `companies.map(...)` por `filteredCompanies.map(...)` en el TableBody
6. Mostrar mensaje "No se encontraron empresas" cuando filteredCompanies esta vacio y hay query

### Detalles tecnicos

- Busqueda client-side con `useMemo` (sin queries a DB, datos ya cargados)
- Busca en `client_company` con `.toLowerCase().includes(query)`
- El indice `#` mostrara posicion dentro de resultados filtrados
- Los botones "Seleccionar todo" / "Deseleccionar" siguen operando sobre `activeCompanies` (no filtradas)
- Los conteos en stats cards no cambian (muestran totales reales)

### Resultado
Con 143 empresas, escribir "CASA" filtra instantaneamente y muestra solo las coincidencias con contador "2 resultados".

