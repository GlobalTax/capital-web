

## Plan: Hacer visible y funcional el banner de "Seleccionar todas las filtradas"

### Problema
El banner para seleccionar todas las empresas filtradas ya existe en el código (líneas 1681-1699), pero es muy sutil visualmente (`bg-accent/10`) y puede pasar desapercibido. La lógica de `handleSelectAllFiltered` es correcta — selecciona todos los IDs de `filteredCompanies`.

### Cambio
En **`src/pages/admin/ContactListDetailPage.tsx`**, hacer el banner más prominente y siempre visible cuando haya más empresas filtradas que las de la página:

1. **Estilo más visible**: Cambiar `bg-accent/10 border-accent/20` por un fondo más llamativo tipo `bg-blue-50 border-blue-300` con texto azul oscuro, similar al patrón de Gmail.
2. **Posición**: Moverlo ENCIMA de la barra de bulk actions (antes de "100 seleccionadas") para que sea lo primero que se vea.
3. **Texto más claro**: Mostrar cuántas empresas hay en total filtradas vs seleccionadas: "Has seleccionado 100 de 3.241 empresas filtradas. → **Seleccionar las 3.241**".

### Archivo afectado
| Archivo | Cambio |
|---------|--------|
| `src/pages/admin/ContactListDetailPage.tsx` | Reforzar visibilidad del banner (estilos + posición), ~15 líneas |

