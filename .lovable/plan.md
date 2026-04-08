

## Plan: Restaurar todos los items eliminados del sidebar

### Problema
Durante la consolidación del sidebar se eliminaron muchos items que antes existían. El usuario quiere que **no se elimine nada**, solo se reorganice.

### Items a restaurar, organizados por sección

#### LEADS (añadir los que faltan)
- Reservas Llamadas → `/admin/bookings`
- Gestión NDAs → `/admin/ndas`
- Prospectos → `/admin/prospectos`
- Mandatos Compra → `/admin/mandatos-compra`
- Deals Pausados → `/admin/deals-paused`

#### INVERSORES (añadir sub-items de cada directorio)
- Apollo Import CR → `/admin/cr-apollo-import`
- Portfolio CR → `/admin/cr-portfolio-list`
- Portfolio Scraper CR → `/admin/cr-portfolio-scraper`
- Fund Intelligence → `/admin/fund-intelligence`
- Apollo Import SF → `/admin/sf-apollo-import`
- Radar SF → `/admin/sf-radar`
- Adquisiciones SF → `/admin/sf-acquisitions`
- Backers SF → `/admin/sf-backers`
- Matching Inbox SF → `/admin/sf-matches`
- Apollo Import MNA → `/admin/mna-apollo-import`

#### CONTENIDO & BLOG (añadir)
- Agentes IA → `/admin/ai-agents`
- Presentaciones → `/admin/presentations`

#### MARKETING & OUTBOUND (añadir)
- Costes Campañas → `/admin/campaign-costs`

#### GESTIONAR WEB (añadir)
- (nada faltante)

#### CONFIGURACIÓN (añadir)
- Data Enrichment → `/admin/data-enrichment`

#### Nueva sección: EMPLEO
- Ofertas de Empleo → `/admin/jobs`
- Solicitudes → `/admin/job-applications`
- Categorías → `/admin/job-categories`
- Plantillas → `/admin/job-templates`
- Solicitudes Colaboradores → `/admin/collaborator-applications`

### Archivo a modificar
- `src/features/admin/config/sidebar-config.ts` — añadir todos los items faltantes a sus secciones correspondientes

### Notas
- Ninguna ruta cambia
- Solo se añaden items al sidebar, no se elimina nada
- Se mantienen los mismos iconos que usaban anteriormente

