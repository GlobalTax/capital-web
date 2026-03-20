

## Fix: Descarga y previsualización de Estudios de Mercado

### Diagnóstico

El bucket `market-studies` tiene políticas RLS que bloquean tanto `createSignedUrl` como `download` desde el cliente. El proyecto ya resuelve este mismo problema para el bucket `campaign-presentations` usando