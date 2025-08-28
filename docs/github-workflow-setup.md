# 🚀 GitHub Workflow Setup - Capittal

## 📋 Configuración Completa de GitHub Actions

Este documento describe la configuración completa del flujo de trabajo de GitHub con integración de seguridad para Capittal.

## 🌳 Estructura de Branches

```
main (producción)
├── staging (pre-producción)  
├── develop (desarrollo)
├── hotfix/* (fixes críticos)
└── feature/* (nuevas funcionalidades)
```

## ⚙️ Configuración Automática

### 1. Ejecutar Script de Setup
```bash
# Dar permisos de ejecución
chmod +x scripts/setup-github-branch-structure.sh

# Ejecutar configuración automática
./scripts/setup-github-branch-structure.sh
```

### 2. Configuración Manual en GitHub

#### Branch Protection Rules
1. Ve a **Settings** → **Branches**
2. Añade reglas para `main`:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (mínimo 1) 
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging

3. Añade las mismas reglas para `staging`

#### Environments Configuration
1. Ve a **Settings** → **Environments**
2. Crear environments:
   - `staging`
   - `production`

3. Para cada environment, configurar:
   - **Protection rules**: Require reviewers (production)
   - **Environment secrets**: Variables específicas del ambiente

### 3. Variables de Entorno Requeridas

#### Repository Secrets (Settings → Secrets and variables → Actions)
```bash
# Supabase Production
PRODUCTION_SUPABASE_URL=https://your-project.supabase.co
PRODUCTION_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Staging  
STAGING_SUPABASE_URL=https://your-staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Management
SUPABASE_ACCESS_TOKEN=sbp_xxx...
SUPABASE_PROJECT_ID=fwhqtzkkvnjkazhaficj
```

## 🔄 Workflows Implementados

### 1. Security Check (`security-check.yml`)
- **Trigger**: En cada PR y push a main/staging/develop
- **Funciones**:
  - TypeScript type checking
  - ESLint security validation
  - Detección de secretos hardcoded
  - Validación de configuración de seguridad
  - Supabase security linter

### 2. Staging Deploy (`staging-deploy.yml`)
- **Trigger**: Push a branch `staging`
- **Funciones**:
  - Tests automatizados
  - Build para staging
  - Validación de seguridad pre-deploy
  - Deploy automático a staging
  - Activación de monitoreo

### 3. Production Deploy (`production-deploy.yml`)
- **Trigger**: Push a `main` o manual con confirmación
- **Funciones**:
  - Validación crítica de seguridad
  - Suite completa de tests
  - Backup automático pre-deploy
  - Deploy controlado a producción
  - Monitoreo crítico post-deploy

### 4. Hotfix Deploy (`hotfix-deploy.yml`)
- **Trigger**: Push a branches `hotfix/**`
- **Funciones**:
  - Validación de emergencia
  - Deploy rápido para fixes críticos
  - Monitoreo mejorado post-hotfix
  - Logging detallado de emergencia

### 5. Security Integration (`security-integration.yml`)
- **Trigger**: Cada 6 horas, manual, o push a branches principales
- **Funciones**:
  - Monitoreo continuo de seguridad
  - Validación de RLS policies
  - Check de feature flags
  - Generación de reportes de seguridad

## 🛡️ Integración de Seguridad

### SecurityManager Integration
Los workflows integran automáticamente con:
- `SecurityManager` para rate limiting y XSS protection
- `securityMonitoring` para logging de eventos
- `useCentralizedErrorHandler` para manejo de errores
- Sistema de feature flags para rollback de emergencia

### Validaciones Automáticas
- **Pre-deploy**: Validación de RLS policies
- **Post-deploy**: Monitoreo de eventos de seguridad
- **Continuo**: Detección de patrones sospechosos
- **Alertas**: Notificaciones automáticas de incidentes críticos

## 🚀 Flujo de Trabajo Recomendado

### Desarrollo de Features
```bash
# 1. Crear feature branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y hacer commits
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push y crear PR a develop
git push origin feature/nueva-funcionalidad
# Crear PR desde GitHub hacia develop
```

### Release a Staging
```bash
# 1. Merge develop → staging
git checkout staging
git pull origin staging
git merge develop
git push origin staging
# Automáticamente deploya a staging
```

### Release a Production
```bash
# 1. Merge staging → main (con PR y revisión)
# Crear PR desde staging hacia main
# Después de aprobación y merge, automáticamente deploya a producción
```

### Hotfixes Críticos
```bash
# 1. Crear hotfix branch desde main
git checkout main
git pull origin main
git checkout -b hotfix/fix-critico

# 2. Fix y push
git add .
git commit -m "hotfix: arreglo crítico de seguridad"
git push origin hotfix/fix-critico
# Automáticamente deploya como hotfix

# 3. Merge back a main y develop
git checkout main
git merge hotfix/fix-critico
git push origin main

git checkout develop  
git merge hotfix/fix-critico
git push origin develop
```

## 📊 Monitoreo y Alertas

### Security Dashboard
- Métricas de seguridad en tiempo real
- Alertas automáticas por eventos críticos
- Dashboard de health checks post-deploy
- Logs centralizados de todos los deployments

### Rollback Automático
- Feature flags para rollback inmediato
- Backup automático pre-deploy
- Detección de fallos y rollback
- Alertas de emergencia al equipo

## 🔧 Troubleshooting

### Problemas Comunes

1. **Fallo en security check**: Revisar logs del workflow para detalles específicos
2. **Deploy fallido**: Verificar variables de entorno y conexión a Supabase
3. **RLS policy violation**: Verificar que las policies estén correctamente configuradas
4. **Rate limit exceeded**: El SecurityManager protege contra ataques, esperar o whitelist IP

### Debug Commands
```bash
# Ver logs de último deployment
gh workflow view

# Re-ejecutar workflow fallido  
gh workflow run security-check.yml

# Verificar status de branches
git status --porcelain
```

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Supabase CI/CD](https://supabase.com/docs/guides/cli/github-action)
- [Capittal Security Guidelines](./security-guidelines.md)