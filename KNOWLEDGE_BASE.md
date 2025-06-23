
# Base de Conocimiento - Capittal M&A Platform

## 📋 Descripción General del Proyecto

### Propósito
Capittal es una plataforma digital especializada en fusiones y adquisiciones (M&A) que ofrece servicios de valoración empresarial, consultoría en transacciones y gestión de operaciones de compraventa de empresas.

### Objetivos Principales
- Proporcionar una calculadora de valoración empresarial precisa y accesible
- Mostrar casos de éxito y operaciones realizadas
- Generar leads cualificados para servicios de M&A
- Establecer confianza a través de transparencia y experiencia demostrada
- Gestionar contenido dinámico (equipo, testimonios, casos de estudio)

### Propuesta de Valor
- **Experiencia Probada**: 200+ operaciones realizadas
- **Máximo Valor**: 40% más valor que la media del mercado
- **Equipo Senior**: 100% profesionales senior dedicados
- **Confidencialidad Total**: 0 filtraciones en el proceso
- **Rapidez**: Procesos de 6-8 meses
- **Personalización**: 100% enfoque personalizado

---

## 👥 Personas de Usuario

### 1. Empresario/CEO (Usuario Principal)
- **Perfil**: Dueño de empresa con facturación >€2M, edad 45-65 años
- **Necesidades**: 
  - Conocer el valor de su empresa
  - Proceso confidencial y profesional
  - Maximizar el precio de venta
  - Asesoramiento experto en M&A
- **Comportamiento**: Busca información, compara opciones, valora experiencia

### 2. Director Financiero/CFO
- **Perfil**: Profesional financiero, edad 35-55 años
- **Necesidades**:
  - Análisis financiero detallado
  - Documentación técnica precisa
  - Procesos estructurados
- **Comportamiento**: Analiza números, valida información, busca referencias

### 3. Inversor/Comprador
- **Perfil**: Fondo de inversión, family office, empresario serial
- **Necesidades**:
  - Acceso a oportunidades de inversión
  - Due diligence profesional
  - Proceso transparente
- **Comportamiento**: Evalúa múltiples opciones, busca rentabilidad

### 4. Administrador del Sistema
- **Perfil**: Equipo interno de Capittal
- **Necesidades**:
  - Gestionar contenido de la web
  - Actualizar datos de operaciones
  - Administrar equipo y testimonios
- **Comportamiento**: Acceso frecuente, actualización regular de contenido

---

## 🎯 Especificaciones de Características

### Feature 1: Calculadora de Valoración
**Historia de Usuario**: Como empresario, quiero conocer el valor estimado de mi empresa para tomar decisiones informadas sobre una posible venta.

**Criterios de Aceptación**:
- [ ] Proceso de 4 pasos intuitivo
- [ ] Validación de datos en tiempo real
- [ ] Cálculo basado en múltiplos de mercado
- [ ] Generación de PDF con resultados
- [ ] Integración con HubSpot para leads
- [ ] Responsive design completo

**Pasos del Proceso**:
1. **Información Básica**: Nombre empresa, sector, facturación
2. **Datos Financieros**: EBITDA, ingresos, crecimiento
3. **Características**: Dependencia del propietario, diversificación
4. **Resultados**: Valoración estimada, rango de valores, descarga PDF

### Feature 2: Panel de Administración
**Historia de Usuario**: Como administrador, quiero gestionar el contenido de la web de forma autónoma.

**Criterios de Aceptación**:
- [ ] Autenticación segura con Supabase
- [ ] CRUD completo para todas las entidades
- [ ] Subida de imágenes optimizada
- [ ] Vista previa antes de publicar
- [ ] Control de estado (activo/inactivo)

**Entidades Gestionables**:
- Miembros del equipo
- Testimonios de clientes
- Casos de estudio
- Operaciones destacadas
- Múltiplos de valoración
- Estadísticas del mercado

### Feature 3: Showcase Corporativo
**Historia de Usuario**: Como visitante, quiero conocer la experiencia y credibilidad de Capittal.

**Criterios de Aceptación**:
- [ ] Página principal con propuesta de valor clara
- [ ] Casos de éxito con datos reales
- [ ] Equipo con fotos y experiencia
- [ ] Testimonios de clientes verificados
- [ ] Estadísticas de rendimiento actualizadas

---

## 🎨 Activos de Diseño

### Sistema de Diseño Capittal

#### Paleta de Colores
```css
/* Colores Principales */
--primary-white: #FFFFFF;      /* Fondo principal */
--primary-black: #000000;      /* Texto y acentos */
--border-gray: hsl(214.3 31.8% 91.4%); /* Bordes suaves 0.5px */

/* Escalas de Grises */
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-600: #6B7280;
--gray-900: #111827;
```

#### Tipografía
- **Fuente Principal**: Manrope (Google Fonts)
- **Jerarquía**:
  - H1: text-3xl font-bold (Títulos principales)
  - H2: text-2xl font-bold (Secciones)
  - H3: text-xl font-bold (Subsecciones)
  - Body: text-base (Contenido general)
  - Small: text-sm (Detalles y metadatos)

#### Componentes Base
```css
/* Botones */
.capittal-button {
  @apply bg-white text-black border-0.5 border-border rounded-lg px-6 py-3 
         hover:shadow-lg hover:-translate-y-1 transition-all duration-300;
}

/* Cards */
.capittal-card {
  @apply bg-white border-0.5 border-border rounded-lg p-6 shadow-sm 
         hover:shadow-xl hover:-translate-y-1 transition-all duration-300;
}

/* Inputs */
.capittal-input {
  @apply bg-white border-0.5 border-border rounded-lg px-4 py-3 
         focus:ring-2 focus:ring-black/20;
}
```

#### Principios de Diseño
- **Minimalismo**: Solo blanco, negro y grises
- **Bordes Ultra-finos**: 0.5px para elegancia
- **Microinteracciones**: Elevación suave en hover
- **Consistencia**: Mismo radio (10px) en todos los elementos
- **Espaciado**: Sistema basado en 6px (space-y-6, p-6)

---

## 🔌 Documentación de API

### Supabase Configuration
```typescript
// Cliente Supabase
const SUPABASE_URL = "https://fwhqtzkkvnjkazhaficj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Tablas de Base de Datos

#### `team_members`
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `testimonials`
```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `case_studies`
```sql
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sector TEXT,
  transaction_value DECIMAL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Integraciones Externas

#### HubSpot CRM
- **Endpoint**: Edge Function `/hubspot-integration`
- **Propósito**: Crear contactos desde la calculadora
- **Autenticación**: API Key en Supabase Secrets
- **Campos Enviados**:
  - Nombre de empresa
  - Email de contacto
  - Teléfono
  - Sector
  - Facturación anual
  - EBITDA estimado
  - Resultado de valoración

```typescript
// Ejemplo de payload HubSpot
{
  properties: {
    email: "usuario@empresa.com",
    firstname: "Juan",
    lastname: "Pérez",
    company: "Empresa SA",
    phone: "+34600000000",
    annual_revenue: "5000000",
    ebitda: "500000",
    sector: "Tecnología",
    valuation_result: "12500000"
  }
}
```

---

## 🗄️ Esquema de Base de Datos

### Diagrama de Relaciones

```
admin_users
├── user_id (UUID) → auth.users
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)

team_members
├── id (UUID PK)
├── name (TEXT)
├── position (TEXT)
├── image_url (TEXT)
├── is_active (BOOLEAN)
└── display_order (INTEGER)

testimonials
├── id (UUID PK)
├── client_name (TEXT)
├── company (TEXT)
├── content (TEXT)
├── rating (INTEGER 1-5)
└── is_active (BOOLEAN)

case_studies
├── id (UUID PK)
├── title (TEXT)
├── description (TEXT)
├── sector (TEXT)
├── transaction_value (DECIMAL)
├── image_url (TEXT)
├── is_featured (BOOLEAN)
└── is_active (BOOLEAN)

operations
├── id (UUID PK)
├── title (TEXT)
├── sector (TEXT)
├── transaction_value (DECIMAL)
├── transaction_type (TEXT)
├── year (INTEGER)
├── is_featured (BOOLEAN)
└── is_active (BOOLEAN)

valuation_multiples
├── id (UUID PK)
├── sector (TEXT)
├── multiple_ebitda (DECIMAL)
├── multiple_revenue (DECIMAL)
├── is_active (BOOLEAN)
└── updated_at (TIMESTAMP)

statistics
├── id (UUID PK)
├── label (TEXT)
├── value (TEXT)
├── description (TEXT)
├── display_order (INTEGER)
└── is_active (BOOLEAN)
```

### Políticas RLS (Row Level Security)
- **admin_users**: Solo lectura para verificar permisos
- **Resto de tablas**: Lectura pública, escritura solo para admins
- **Función helper**: `current_user_is_admin()` para validar permisos

---

## ⚙️ Configuración del Entorno

### Requisitos del Sistema
- Node.js >= 18.0.0
- npm >= 8.0.0
- Navegador moderno con ES6+ support

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd capittal-platform

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

### Variables de Entorno
```env
# Supabase Configuration
VITE_SUPABASE_URL="https://fwhqtzkkvnjkazhaficj.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# HubSpot Integration (Supabase Secrets)
HUBSPOT_API_KEY="your-hubspot-api-key"
HUBSPOT_ACCESS_TOKEN="your-hubspot-access-token"
```

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Routing**: React Router DOM
- **State Management**: React Hooks + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React
- **Charts**: Recharts

---

## 🧪 Pautas de Prueba

### Tipos de Pruebas Requeridas

#### 1. Pruebas de Calculadora
- [ ] Validación de campos obligatorios
- [ ] Cálculos de valoración correctos
- [ ] Generación de PDF funcional
- [ ] Integración HubSpot exitosa
- [ ] Navegación entre pasos

#### 2. Pruebas de Panel Admin
- [ ] Autenticación y autorización
- [ ] CRUD de todas las entidades
- [ ] Subida de imágenes
- [ ] Validación de formularios
- [ ] Estados activo/inactivo

#### 3. Pruebas de UI/UX
- [ ] Responsividad en todos los dispositivos
- [ ] Tiempos de carga < 3 segundos
- [ ] Accesibilidad (WCAG 2.1 AA)
- [ ] Cross-browser compatibility
- [ ] SEO meta tags

#### 4. Pruebas de Rendimiento
- [ ] Core Web Vitals óptimos
- [ ] Imágenes optimizadas
- [ ] Lazy loading implementado
- [ ] Bundle size < 500KB

### Herramientas de Testing
- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Performance**: Lighthouse CI
- **Accessibility**: axe-core

---

## 🚀 Instrucciones de Implementación

### Entornos

#### Desarrollo
```bash
npm run dev
# Servidor local: http://localhost:8080
# Hot reload habilitado
# Source maps disponibles
```

#### Staging
- **URL**: https://staging.capittal.lovable.app
- **Deploy**: Automático desde rama `main`
- **Base de datos**: Supabase Production
- **Configuración**: Variables de entorno de producción

#### Producción
- **URL**: https://capittal.com (dominio personalizado)
- **Deploy**: Manual desde Lovable dashboard
- **CDN**: Habilitado para assets estáticos
- **Monitoring**: Supabase analytics + Google Analytics

### Pipeline de Deploy
1. **Commit** a rama `main`
2. **Build automático** en Lovable
3. **Tests de calidad** (Lighthouse)
4. **Deploy a staging**
5. **Revisión manual**
6. **Deploy a producción** (manual)

### Rollback
- Usar botón "Revert" en Lovable dashboard
- Restaurar a versión anterior específica
- Tiempo de rollback: < 2 minutos

---

## 🔧 Prácticas de Control de Versiones

### Estrategia de Branching
- **main**: Rama principal, siempre deployable
- **feature/**: Nuevas características
- **fix/**: Corrección de bugs
- **hotfix/**: Correcciones urgentes

### Convenciones de Commits
```
feat: add new valuation calculator step
fix: resolve mobile navigation issue
docs: update knowledge base
style: apply new border design system
refactor: optimize team members component
test: add calculator validation tests
```

### Proceso de Code Review
1. **Pull Request** con descripción detallada
2. **Review** por al menos 1 team member
3. **Tests** pasando en CI/CD
4. **Merge** solo después de aprobación

### Directrices de Código
- **TypeScript**: Strict mode habilitado
- **ESLint**: Configuración estricta
- **Prettier**: Formato automático
- **Imports**: Paths absolutos con `@/`
- **Components**: Un componente por archivo
- **Hooks**: Lógica reutilizable en custom hooks

---

## 🔒 Prácticas de Seguridad

### Autenticación y Autorización
- **Supabase Auth**: Gestión de usuarios
- **RLS Policies**: Restricción a nivel de base de datos
- **JWT Tokens**: Validación automática
- **Admin Access**: Verificación con `current_user_is_admin()`

### Protección de Datos
- **HTTPS**: Obligatorio en todas las conexiones
- **API Keys**: Almacenadas en Supabase Secrets
- **Validación**: Server-side en Edge Functions
- **Sanitización**: Inputs validados con Zod

### Headers de Seguridad
```typescript
// Implementado en Edge Functions
{
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block'
}
```

### Auditoría
- **Logs**: Supabase Edge Function logs
- **Monitoring**: Real-time error tracking
- **Backups**: Automáticos cada 24h
- **Recovery**: RTO < 1 hora, RPO < 15 minutos

---

## 📋 Requisitos de Cumplimiento

### GDPR (Reglamento General de Protección de Datos)
- [ ] **Consentimiento explícito** para cookies y tracking
- [ ] **Política de privacidad** clara y accesible
- [ ] **Derecho al olvido** implementado
- [ ] **Portabilidad de datos** disponible
- [ ] **Breach notification** proceso definido

### LOPD (Ley Orgánica de Protección de Datos - España)
- [ ] **Registro de actividades** de tratamiento
- [ ] **DPO** (Data Protection Officer) designado
- [ ] **Evaluación de impacto** para datos sensibles
- [ ] **Transferencias internacionales** documentadas

### Sector Financiero
- [ ] **MiFID II**: Transparencia en servicios financieros
- [ ] **AML** (Anti-Money Laundering): Procedimientos KYC
- [ ] **ESMA**: Regulación de mercados financieros
- [ ] **CNMV**: Cumplimiento normativa española

### Cookies y Tracking
```javascript
// Configuración Google Analytics
gtag('config', 'GA_TRACKING_ID', {
  'anonymize_ip': true,
  'cookie_flags': 'secure;samesite=strict'
});
```

### Términos Legales Implementados
- **Términos de Uso**: `/terminos-uso`
- **Política de Privacidad**: `/politica-privacidad`
- **Política de Cookies**: `/cookies`
- **Aviso Legal**: Incluido en footer

---

## 👥 Roles y Responsabilidades

### Product Owner
- **Responsabilidad**: Definición de requisitos y prioridades
- **Archivos**: Historias de usuario, criterios de aceptación
- **Frecuencia**: Review semanal de funcionalidades

### Tech Lead
- **Responsabilidad**: Arquitectura técnica y code reviews
- **Archivos**: Documentación de API, esquemas de BD
- **Frecuencia**: Review diario de PRs

### Designer
- **Responsabilidad**: Sistema de diseño y experiencia usuario
- **Archivos**: Activos de diseño, guías de estilo
- **Frecuencia**: Update mensual de componentes

### DevOps
- **Responsabilidad**: Infraestructura y deployments
- **Archivos**: Configuración de entorno, scripts de deploy
- **Frecuencia**: Monitoring continuo

---

## 📅 Roadmap y Actualizaciones

### Q1 2024
- [x] Calculadora de valoración básica
- [x] Panel de administración
- [x] Integración HubSpot
- [x] Diseño responsive

### Q2 2024
- [ ] Calculadora avanzada con más sectores
- [ ] Blog de contenidos
- [ ] Webinars y eventos
- [ ] Chat con IA para consultas

### Q3 2024
- [ ] Portal del cliente
- [ ] Documentos interactivos
- [ ] Marketplace de empresas
- [ ] API pública para partners

### Proceso de Actualización
1. **Review mensual** de este documento
2. **Update automático** desde comentarios en código
3. **Sincronización** con roadmap de producto
4. **Notificación** a stakeholders de cambios críticos

---

## 🎯 KPIs y Métricas

### Métricas de Negocio
- **Conversión calculadora**: > 15%
- **Leads cualificados**: > 50/mes
- **Tiempo en página**: > 3 minutos
- **Bounce rate**: < 40%

### Métricas Técnicas
- **Page Speed**: > 90 (Lighthouse)
- **Uptime**: > 99.9%
- **Error rate**: < 0.1%
- **Build time**: < 2 minutos

### Métricas de Contenido
- **Actualizaciones mensuales**: 100%
- **Imágenes optimizadas**: 100%
- **SEO score**: > 95
- **Accesibilidad**: AAA compliance

---

*Última actualización: 2024-12-23*
*Versión: 1.0.0*
*Mantenido por: Equipo Capittal*
