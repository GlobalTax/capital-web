

## Plan: Corregir el fallo de deploy en GitHub Actions

### Problema
El workflow `production-deploy.yml` falla con exit code 1 en el job `deploy-production`. Además hay warnings de deprecación de Node.js 20.

### Causas probables

Sin acceso a los logs completos del CI, las causas más comunes son:

1. **`npm ci` falla** — el `package-lock.json` puede no estar sincronizado con `package.json` (Lovable usa `--legacy-peer-deps` pero el workflow no)
2. **Build falla** — el script de build ejecuta `generate-sitemap.mjs` que puede necesitar conexión a Supabase, y los secrets podrían no estar configurados en GitHub
3. **Node.js 18 vs dependencias** — algunas dependencias pueden requerir Node 20+

### Cambios propuestos

**Archivo: `.github/workflows/production-deploy.yml`**

1. Subir `node-version` de `'18'` a `'20'` (consistente con el runner y las dependencias)
2. Añadir `--legacy-peer-deps` a `npm ci` (igual que en `security-check.yml`)
3. Mover las variables de entorno de Supabase al nivel del job para que `generate-sitemap.mjs` también las tenga disponibles
4. Hacer lo mismo en los otros workflows (`hotfix-deploy.yml`, `security-integration.yml`)

**Archivos a modificar:**
- `.github/workflows/production-deploy.yml`
- `.github/workflows/hotfix-deploy.yml`
- `.github/workflows/security-integration.yml`
- `.github/workflows/security-check.yml` (actualizar node-version a 20)

### Nota importante
Si los GitHub Secrets (`PRODUCTION_SUPABASE_URL`, `PRODUCTION_SUPABASE_ANON_KEY`) no están configurados en el repositorio de GitHub, el build seguirá fallando. Esto se configura en GitHub → Settings → Secrets and variables → Actions.

