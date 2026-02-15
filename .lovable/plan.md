

## Aumentar la distancia entre el menu y el hero en la pagina de Seguridad

### Problema

La pagina `/sectores/seguridad` renderiza el `Header` directamente sin usar `UnifiedLayout`, por lo que no tiene el padding-top necesario para compensar el header fijo. El hero queda demasiado pegado (o parcialmente oculto) bajo el menu.

### Solucion

Anadir padding-top al contenedor principal de la pagina para que el contenido empiece debajo del header fijo, igual que hace `UnifiedLayout` (`pt-24 md:pt-[104px]`).

### Cambio

| Archivo | Linea | Cambio |
|---------|-------|--------|
| `src/pages/sectores/Seguridad.tsx` | 177 | `<div className="min-h-screen bg-background">` cambiar a `<div className="min-h-screen bg-background pt-24 md:pt-[104px]">` |

Esto anade 96px de padding en movil (para el header de 64px) y 104px en desktop (para TopBar 40px + Header 64px), que es el mismo espaciado que usa el resto de paginas con `UnifiedLayout`.

