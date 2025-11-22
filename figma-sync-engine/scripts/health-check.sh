#!/bin/bash

# ============================================================================
# Health Check Script - figma-sync-engine
# ============================================================================
# Script de validação geral para verificar a saúde do repositório
# Executa: lint, build, test, security check e dependências
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Status tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Logging functions
log_header() {
    echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

log_step() {
    echo -e "${BOLD}▶ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED_CHECKS++))
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Start timer
START_TIME=$(date +%s)

# ============================================================================
# Header
# ============================================================================
clear
echo -e "${BOLD}${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           FIGMA SYNC ENGINE - HEALTH CHECK                   ║
║           Validação Geral do Repositório                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ============================================================================
# 1. Environment Check
# ============================================================================
log_header "1. VERIFICAÇÃO DE AMBIENTE"

log_step "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js instalado: $NODE_VERSION"
    ((TOTAL_CHECKS++))
else
    log_error "Node.js não encontrado"
    ((TOTAL_CHECKS++))
    exit 1
fi

log_step "Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "npm instalado: v$NPM_VERSION"
    ((TOTAL_CHECKS++))
else
    log_error "npm não encontrado"
    ((TOTAL_CHECKS++))
    exit 1
fi

log_step "Verificando pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    log_success "pnpm instalado: v$PNPM_VERSION"
    USE_PNPM=true
    ((TOTAL_CHECKS++))
else
    log_warning "pnpm não encontrado globalmente, usando npx pnpm"
    USE_PNPM=false
    ((TOTAL_CHECKS++))
fi

# ============================================================================
# 2. Dependencies Check
# ============================================================================
log_header "2. VERIFICAÇÃO DE DEPENDÊNCIAS"

log_step "Verificando node_modules..."
if [ -d "node_modules" ]; then
    log_success "node_modules existe"
    ((TOTAL_CHECKS++))
else
    log_warning "node_modules não encontrado - executando instalação..."
    ((TOTAL_CHECKS++))
    
    if [ "$USE_PNPM" = true ]; then
        pnpm install --frozen-lockfile || {
            log_error "Falha ao instalar dependências com pnpm"
            exit 1
        }
    else
        npx pnpm install --frozen-lockfile || {
            log_error "Falha ao instalar dependências com npx pnpm"
            exit 1
        }
    fi
    log_success "Dependências instaladas com sucesso"
fi

log_step "Verificando integridade das dependências..."
if [ "$USE_PNPM" = true ]; then
    if pnpm list --depth=0 &> /dev/null; then
        log_success "Todas as dependências estão íntegras"
        ((TOTAL_CHECKS++))
    else
        log_warning "Algumas dependências podem estar faltando"
        ((TOTAL_CHECKS++))
    fi
else
    if npx pnpm list --depth=0 &> /dev/null; then
        log_success "Todas as dependências estão íntegras"
        ((TOTAL_CHECKS++))
    else
        log_warning "Algumas dependências podem estar faltando"
        ((TOTAL_CHECKS++))
    fi
fi

# ============================================================================
# 3. Lint Check
# ============================================================================
log_header "3. VERIFICAÇÃO DE LINT"

log_step "Executando lint em todos os pacotes..."
((TOTAL_CHECKS++))

if [ "$USE_PNPM" = true ]; then
    if pnpm lint 2>&1 | tee /tmp/lint-output.log; then
        log_success "Lint passou em todos os pacotes"
    else
        log_error "Lint falhou - verifique os erros acima"
        exit 1
    fi
else
    if npx pnpm lint 2>&1 | tee /tmp/lint-output.log; then
        log_success "Lint passou em todos os pacotes"
    else
        log_error "Lint falhou - verifique os erros acima"
        exit 1
    fi
fi

# ============================================================================
# 4. Build Check
# ============================================================================
log_header "4. VERIFICAÇÃO DE BUILD"

log_step "Executando build de todos os pacotes..."
((TOTAL_CHECKS++))

if [ "$USE_PNPM" = true ]; then
    if pnpm build 2>&1 | tee /tmp/build-output.log; then
        log_success "Build concluído com sucesso em todos os pacotes"
    else
        log_error "Build falhou - verifique os erros acima"
        exit 1
    fi
else
    if npx pnpm build 2>&1 | tee /tmp/build-output.log; then
        log_success "Build concluído com sucesso em todos os pacotes"
    else
        log_error "Build falhou - verifique os erros acima"
        exit 1
    fi
fi

log_step "Verificando artefatos de build..."
BUILD_DIRS=0
for pkg_dir in packages/*/; do
    if [ -d "${pkg_dir}dist" ]; then
        ((BUILD_DIRS++))
    fi
done

if [ $BUILD_DIRS -gt 0 ]; then
    log_success "Encontrados $BUILD_DIRS diretórios dist com artefatos"
    ((TOTAL_CHECKS++))
else
    log_warning "Nenhum diretório dist encontrado"
    ((TOTAL_CHECKS++))
fi

# ============================================================================
# 5. Test Check
# ============================================================================
log_header "5. VERIFICAÇÃO DE TESTES"

log_step "Executando testes em todos os pacotes..."
((TOTAL_CHECKS++))

if [ "$USE_PNPM" = true ]; then
    if pnpm test 2>&1 | tee /tmp/test-output.log; then
        log_success "Todos os testes passaram"
    else
        log_error "Alguns testes falharam - verifique os erros acima"
        exit 1
    fi
else
    if npx pnpm test 2>&1 | tee /tmp/test-output.log; then
        log_success "Todos os testes passaram"
    else
        log_error "Alguns testes falharam - verifique os erros acima"
        exit 1
    fi
fi

# ============================================================================
# 6. Security Audit
# ============================================================================
log_header "6. VERIFICAÇÃO DE SEGURANÇA"

log_step "Executando npm audit..."
((TOTAL_CHECKS++))

if [ "$USE_PNPM" = true ]; then
    AUDIT_OUTPUT=$(pnpm audit --json 2>/dev/null || echo '{"error": true}')
else
    AUDIT_OUTPUT=$(npx pnpm audit --json 2>/dev/null || echo '{"error": true}')
fi

# Check if audit found vulnerabilities
if echo "$AUDIT_OUTPUT" | grep -q '"error": true'; then
    log_warning "Não foi possível executar audit completo"
elif echo "$AUDIT_OUTPUT" | grep -q '"vulnerabilities"'; then
    # Parse vulnerabilities count
    CRITICAL=$(echo "$AUDIT_OUTPUT" | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' || echo "0")
    HIGH=$(echo "$AUDIT_OUTPUT" | grep -o '"high":[0-9]*' | grep -o '[0-9]*' || echo "0")
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        log_warning "Encontradas vulnerabilidades: $CRITICAL críticas, $HIGH altas"
        log_info "Execute 'pnpm audit' para mais detalhes"
    else
        log_success "Nenhuma vulnerabilidade crítica ou alta encontrada"
    fi
else
    log_success "Audit passou sem problemas"
fi

# ============================================================================
# 7. Git Status Check (opcional)
# ============================================================================
log_header "7. VERIFICAÇÃO DE GIT"

if command -v git &> /dev/null && [ -d .git ]; then
    log_step "Verificando status do Git..."
    
    # Check for uncommitted changes
    if git diff --quiet && git diff --cached --quiet; then
        log_success "Working directory limpo"
        ((TOTAL_CHECKS++))
    else
        log_warning "Existem alterações não commitadas"
        log_info "Arquivos modificados:"
        git status --short | head -5
        ((TOTAL_CHECKS++))
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    log_info "Branch atual: $CURRENT_BRANCH"
else
    log_info "Git não disponível ou não é um repositório Git"
fi

# ============================================================================
# 8. Repository Structure Check
# ============================================================================
log_header "8. VERIFICAÇÃO DE ESTRUTURA"

log_step "Verificando estrutura do monorepo..."

EXPECTED_PACKAGES=("html-to-figma-core" "autolayout-interpreter" "storybook-addon-export" "figma-plugin-lite")
FOUND_PACKAGES=0

for pkg in "${EXPECTED_PACKAGES[@]}"; do
    if [ -d "packages/$pkg" ] && [ -f "packages/$pkg/package.json" ]; then
        ((FOUND_PACKAGES++))
    fi
done

if [ $FOUND_PACKAGES -eq ${#EXPECTED_PACKAGES[@]} ]; then
    log_success "Todos os $FOUND_PACKAGES pacotes esperados encontrados"
    ((TOTAL_CHECKS++))
else
    log_warning "Esperados ${#EXPECTED_PACKAGES[@]} pacotes, encontrados $FOUND_PACKAGES"
    ((TOTAL_CHECKS++))
fi

log_step "Verificando arquivos de configuração..."
CONFIG_FILES=("package.json" "pnpm-workspace.yaml" "turbo.json" "tsconfig.base.json")
FOUND_CONFIGS=0

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        ((FOUND_CONFIGS++))
    fi
done

if [ $FOUND_CONFIGS -eq ${#CONFIG_FILES[@]} ]; then
    log_success "Todos os arquivos de configuração encontrados"
    ((TOTAL_CHECKS++))
else
    log_warning "Esperados ${#CONFIG_FILES[@]} arquivos de config, encontrados $FOUND_CONFIGS"
    ((TOTAL_CHECKS++))
fi

# ============================================================================
# Summary Report
# ============================================================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log_header "RESUMO DA VALIDAÇÃO"

echo -e "${BOLD}Estatísticas:${NC}"
echo -e "  Total de verificações: $TOTAL_CHECKS"
echo -e "  ${GREEN}✓ Passou: $PASSED_CHECKS${NC}"
echo -e "  ${RED}✗ Falhou: $FAILED_CHECKS${NC}"
echo -e "  ${YELLOW}⚠ Avisos: $WARNINGS${NC}"
echo -e "  Tempo de execução: ${DURATION}s"
echo ""

# Final status
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    ✓ SAÚDE DO REPOSITÓRIO: OK                ║
║                                                               ║
║           Todos os checks passaram com sucesso!              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Nota: Existem $WARNINGS avisos que podem precisar de atenção.${NC}"
    fi
    
    exit 0
else
    echo -e "${RED}${BOLD}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                ✗ SAÚDE DO REPOSITÓRIO: FALHOU                ║
║                                                               ║
║         Alguns checks falharam. Verifique os logs acima.     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    exit 1
fi
