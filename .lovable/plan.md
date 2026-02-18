

# Ejecutar Pipeline Completo de Noticias

Ejecucion manual secuencial de las 3 Edge Functions del pipeline de noticias:

1. **fetch-ma-news** - Busca nuevos articulos de fuentes M&A configuradas
2. **process-news-ai** - Procesa los articulos con IA (clasificacion, resumen, sector)
3. **auto-publish-news** - Publica automaticamente los que cumplan criterios de fuentes de confianza

Las 3 funciones se invocan con `{"scheduled": true}` para evitar el bloqueo de autenticacion.

No se modificara ningun archivo, solo se ejecutaran las funciones ya desplegadas.

