

# Implementar llms.txt para Capittal

## Que es llms.txt

El estandar [llms.txt](https://llmstxt.org/) proporciona un archivo en texto plano en `/llms.txt` que describe tu sitio web de forma optimizada para LLMs, similar a como `robots.txt` es para crawlers y `sitemap.xml` para buscadores. Opcionalmente se puede incluir `/llms-full.txt` con contenido mas detallado.

## Archivos a crear

### 1. `public/llms.txt` - Version concisa
Contenido estructurado en Markdown siguiendo el estandar:
- Titulo y descripcion de Capittal
- Servicios principales (valoraciones, venta/compra empresas, due diligence, asesoramiento legal, reestructuraciones, planificacion fiscal)
- Sectores cubiertos (tecnologia, healthcare, seguridad, construccion, industrial, retail, energia, logistica, alimentacion, medio ambiente)
- Herramientas (calculadora de valoracion, calculadora fiscal)
- Recursos (blog, noticias, casos de estudio)
- Contacto e informacion corporativa
- Links a las paginas principales

### 2. `public/llms-full.txt` - Version extendida
Contenido mas detallado incluyendo:
- Descripciones completas de cada servicio
- Metodologia de valoracion
- Proceso de venta de empresas
- Informacion sobre el equipo
- Detalles de cada sector
- FAQs comunes

### 3. Actualizar `public/robots.txt`
Anadir referencia a `llms.txt`:
```
# LLMs
Sitemap: https://capittal.es/llms.txt
```

## Contenido de llms.txt (estructura)

```text
# Capittal

> Asesores especializados en valoracion y venta de empresas en Espana.

Capittal es una firma de asesoramiento financiero...

## Servicios
- [Valoraciones](https://capittal.es/servicios/valoraciones): ...
- [Venta de Empresas](https://capittal.es/servicios/venta-empresas): ...
- [Due Diligence](https://capittal.es/servicios/due-diligence): ...
- [Asesoramiento Legal](https://capittal.es/servicios/asesoramiento-legal): ...
- [Reestructuraciones](https://capittal.es/servicios/reestructuraciones): ...
- [Planificacion Fiscal](https://capittal.es/servicios/planificacion-fiscal): ...

## Herramientas
- [Calculadora de Valoracion](https://capittal.es/lp/calculadora): ...
- [Calculadora Fiscal](https://capittal.es/lp/calculadora-fiscal): ...

## Sectores
- [Tecnologia](https://capittal.es/sectores/tecnologia)
- [Healthcare](https://capittal.es/sectores/healthcare)
- ...

## Recursos
- [Blog](https://capittal.es/recursos/blog)
- [Noticias](https://capittal.es/recursos/noticias)
- [Casos de Estudio](https://capittal.es/recursos/case-studies)

## Contacto
- Web: https://capittal.es/contacto
- Idiomas: Espanol, Catalan, Ingles
```

## Complejidad
Baja. Son 2-3 archivos estaticos en `public/`.

