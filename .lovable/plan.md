

## Plan: Consolidar y simplificar el sidebar del admin

### Problema actual
- **16 secciones** con ~75 items totales
- Items duplicados en varias secciones (Pipeline Ventas, Content Studio, Calendario, Recursos)
- Secciones con solo 1-2 items (Noticias M&A, Corporativos)
- Separación confusa entre "LEADS" y "ANALIZAR LEADS"

### Propuesta: 8 secciones consolidadas

```text
DASHBOARD (3)
├── Vista General
├── Calendario Editorial
└── Search Analytics

CRM & LEADS (8)
├── Leads (Todos)
├── Pipeline Ventas
├── Pipeline Compras
├── Contactos Compra
├── Reservas Llamadas
├── Entrada Manual Leads
├── Listas de Empresas
└── Gestión NDAs

DIRECTORIOS (6)
├── Directorio Empresas
├── Directorio Corporativos
├── Capital Riesgo (CR)
├── Search Funds (SF)
├── Boutiques M&A
└── Rel. Oportunidades

CONTENIDO & BLOG (6)
├── Content Studio (AI)
├── Blog & Contenido
├── Casos de Éxito
├── Noticias M&A
├── Landing Pages
└── Recursos & Lead Magnets

MÚLTIPLOS & DATOS (5)
├── Múltiplos
├── Múltiplos Asesores
├── Intel PE Sectorial
├── Sectores
├── Sector Dossiers (AI)

MARKETING & OUTBOUND (5)
├── Campañas Outbound
├── Costes Campañas
├── Newsletter Semanal
├── Importar Brevo
├── Valoraciones Pro

GESTIONAR WEB (8)
├── Equipo
├── Testimonios
├── Test. Colaboradores
├── LP Venta Empresas
├── Logos Carousel
├── Banners
├── Hero Slides
├── Áreas de Práctica
├── La Firma
├── Biblioteca de Fotos

CONFIGURACIÓN (7)
├── Notificaciones
├── Usuarios Admin
├── Workflow Fase 0
├── Destinatarios Email
├── Firma de Email
├── Ajustes
└── Navegación Sidebar
```

### Cambios clave
- **LEADS + ANALIZAR LEADS** → fusionados en **CRM & LEADS**
- **CAPITAL RIESGO + SEARCH FUNDS + CORPORATIVOS + BOUTIQUES** → subpáginas dentro de **DIRECTORIOS** (cada uno lleva a su directorio, los sub-items como Apollo Import, Backers, etc. se acceden desde dentro de cada directorio)
- **CREAR CONTENIDO + NOTICIAS + RECURSOS** → fusionados en **CONTENIDO & BLOG**
- **GESTIONAR DATOS** → dividido: datos de valoración van a MÚLTIPLOS, elementos visuales de la web van a **GESTIONAR WEB**
- **WEB INTELLIGENCE** (Apollo Visitors, Dealsuite) → movido a MARKETING & OUTBOUND
- **IA & AGENTES** → eliminado como sección; Agentes IA y Content Studio van a CONTENIDO
- **EMPLEO** → eliminado del sidebar principal (se accede desde Configuración o se añade como sub-item)
- Items duplicados eliminados

### Items eliminados/reubicados
- Valoraciones & Recovery → accesible desde Dashboard (enlace secundario)
- Calculadora Asesores → accesible desde Múltiplos Asesores
- Test Exit-Ready → dentro de Recursos
- Radar SF, Backers, Matching Inbox, Inteligencia SF → accesibles desde la página de SF Directory
- Apollo Imports (3 duplicados) → accesibles desde cada directorio respectivo

### Archivos a modificar
1. **`src/features/admin/config/sidebar-config.ts`** — reescribir la estructura de secciones
2. **`src/components/admin/sidebar/AdminSidebar.tsx`** — verificar que los permisos siguen mapeados correctamente

### Notas
- Ninguna ruta cambia, solo la organización del sidebar
- Los items con `visible: false` se eliminan definitivamente
- Se mantienen los badges AI y URGENTE donde apliquen
