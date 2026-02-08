

## Ajustes del Hero para movil

### Problemas detectados

1. **Overlay insuficiente en movil**: El gradiente horizontal (`from-white/95 ... to-white/40`) esta pensado para desktop donde el texto queda a la izquierda. En movil, el texto ocupa todo el ancho y la zona derecha (con solo 40% de opacidad) puede dejar el texto poco legible sobre imagenes claras.

2. **Service Pills desbordadas**: Las pills con borde y padding (`px-4 py-1.5`) pueden causar scroll horizontal o wrapping feo en pantallas de 320-390px, especialmente con textos como "Valoracion & Due Diligence".

3. **Indicadores de slide apretados**: Los indicadores (`bottom-12 left-6`) y el contador (`bottom-12 right-6`) compiten por espacio en pantallas estrechas y pueden solaparse con el area de safe-area en iPhones.

4. **Padding lateral escaso**: El contenedor usa `px-6` en todas las resoluciones, lo que esta bien, pero combinado con `max-w-2xl` no hay problema de desbordamiento.

### Cambios propuestos

**Archivo**: `src/components/Hero.tsx`

1. **Overlay movil mejorado** (linea 199): Cambiar el gradiente para que en movil sea vertical (de arriba a abajo) en lugar de horizontal, cubriendo uniformemente toda la pantalla. En desktop mantener el gradiente horizontal actual.
   - Reemplazar la clase unica por dos capas: una con gradiente horizontal para desktop y otra con gradiente vertical solo visible en movil (`md:hidden`), o usar un gradiente mas uniforme que funcione en ambos.
   - Solucion mas simple: usar `from-white/95 via-white/85 to-white/60` que refuerza la cobertura general sin necesitar mediaquery separado.

2. **Service Pills responsivas** (linea 227): Reducir el padding y tamano de fuente en movil. Cambiar `px-4 py-1.5 text-sm` a `px-2.5 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm`.

3. **Indicadores con safe-area** (linea 277): Cambiar `bottom-12` a `bottom-6 sm:bottom-12` para que en movil esten mas cerca del borde y dejen espacio para gestos, y anadir `safe-area-inset-bottom` implicitamente con padding extra.

4. **Contador de slide movil** (linea 293): Igual, ajustar `bottom-6 sm:bottom-12` y reducir tamano en movil.

### Seccion tecnica

```text
Linea 199 - Overlay:
  De: bg-gradient-to-r from-white/95 via-white/80 to-white/40
  A:  bg-gradient-to-r from-white/95 via-white/85 to-white/60

Linea 227 - Service Pills container:
  De: mt-6 flex flex-wrap items-center gap-2
  A:  mt-4 sm:mt-6 flex flex-wrap items-center gap-1.5 sm:gap-2

Linea 233 - Cada pill:
  De: px-4 py-1.5 ... text-sm
  A:  px-2.5 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm

Linea 277 - Slide indicators:
  De: bottom-12 left-6 lg:left-12
  A:  bottom-6 sm:bottom-12 left-6 lg:left-12

Linea 293 - Slide counter:
  De: bottom-12 right-6 lg:right-12
  A:  bottom-6 sm:bottom-12 right-6 lg:right-12
```

### Resultado esperado

- Texto y botones siempre legibles sobre cualquier imagen en movil
- Service pills compactas que no desbordan en pantallas de 320px
- Indicadores de slide bien posicionados sin conflicto con la safe area de iOS
- Sin cambios visuales en desktop (mismo aspecto actual)

