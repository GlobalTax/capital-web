#!/bin/bash

# Script para configurar la estructura de branches en GitHub
# Ejecutar después de hacer push de los workflows

echo "🌳 Configurando estructura de branches para Capittal..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No estás en un repositorio git${NC}"
    exit 1
fi

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Rama actual: ${CURRENT_BRANCH}${NC}"

# Asegurarse de estar en main y actualizado
echo -e "${YELLOW}🔄 Cambiando a main y actualizando...${NC}"
git checkout main
git pull origin main

# Crear branch develop
echo -e "${YELLOW}🌿 Creando branch develop...${NC}"
if git show-ref --verify --quiet refs/heads/develop; then
    echo -e "${GREEN}✅ Branch develop ya existe${NC}"
else
    git checkout -b develop
    git push -u origin develop
    echo -e "${GREEN}✅ Branch develop creada y pushed${NC}"
fi

# Crear branch staging
echo -e "${YELLOW}🎭 Creando branch staging...${NC}"
git checkout main
if git show-ref --verify --quiet refs/heads/staging; then
    echo -e "${GREEN}✅ Branch staging ya existe${NC}"
else
    git checkout -b staging
    git push -u origin staging
    echo -e "${GREEN}✅ Branch staging creada y pushed${NC}"
fi

# Volver a la rama original
git checkout $CURRENT_BRANCH

echo -e "${GREEN}🎉 Estructura de branches configurada correctamente!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos pasos manuales en GitHub:${NC}"
echo "1. Ve a Settings → Branches en tu repositorio"
echo "2. Configura Branch Protection Rules para 'main':"
echo "   ✅ Require a pull request before merging"
echo "   ✅ Require approvals (mínimo 1)"
echo "   ✅ Require status checks to pass before merging"
echo "   ✅ Require branches to be up to date before merging"
echo "3. Configura las mismas reglas para 'staging'"
echo "4. Configura variables de entorno por ambiente en Settings → Environments"
echo ""
echo -e "${YELLOW}🔐 Variables de entorno necesarias:${NC}"
echo "Staging:"
echo "  - STAGING_SUPABASE_URL"
echo "  - STAGING_SUPABASE_ANON_KEY"
echo "Production:"
echo "  - PRODUCTION_SUPABASE_URL"
echo "  - PRODUCTION_SUPABASE_ANON_KEY"
echo "  - SUPABASE_ACCESS_TOKEN"
echo "  - SUPABASE_PROJECT_ID"