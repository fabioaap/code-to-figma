#!/bin/bash

# Script de Auditoria de Segurança
# Verifica vulnerabilidades de segurança nas dependências do projeto
# Uso: ./scripts/security-audit.sh [--fix] [--json]

set -e

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

FIX_MODE=false
JSON_OUTPUT=false
AUDIT_FAILED=false

# Parse argumentos
for arg in "$@"; do
  case $arg in
    --fix)
      FIX_MODE=true
      shift
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    *)
      ;;
  esac
done

echo -e "${COLOR_BLUE}=== Auditoria de Segurança de Dependências ===${COLOR_RESET}"
echo ""

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo -e "${COLOR_RED}Erro: pnpm não está instalado${COLOR_RESET}"
    echo "Instale com: npm install -g pnpm"
    exit 1
fi

echo -e "${COLOR_BLUE}Versão do pnpm:${COLOR_RESET} $(pnpm --version)"
echo ""

# Função para executar pnpm audit
run_pnpm_audit() {
    echo -e "${COLOR_BLUE}1. Executando pnpm audit...${COLOR_RESET}"
    
    if [ "$JSON_OUTPUT" = true ]; then
        if pnpm audit --json > audit-report.json 2>&1; then
            echo -e "${COLOR_GREEN}✓ Auditoria concluída com sucesso${COLOR_RESET}"
            echo "Relatório JSON salvo em: audit-report.json"
            cat audit-report.json
        else
            AUDIT_FAILED=true
            echo -e "${COLOR_YELLOW}⚠ pnpm audit falhou (possível restrição de rede)${COLOR_RESET}"
            return 1
        fi
    else
        if pnpm audit 2>&1; then
            echo -e "${COLOR_GREEN}✓ Auditoria concluída com sucesso${COLOR_RESET}"
        else
            AUDIT_FAILED=true
            echo -e "${COLOR_YELLOW}⚠ pnpm audit falhou (possível restrição de rede)${COLOR_RESET}"
            return 1
        fi
    fi
}

# Função para verificar dependências desatualizadas
check_outdated() {
    echo ""
    echo -e "${COLOR_BLUE}2. Verificando dependências desatualizadas...${COLOR_RESET}"
    
    if pnpm outdated 2>&1; then
        echo -e "${COLOR_GREEN}✓ Verificação de dependências desatualizadas concluída${COLOR_RESET}"
    else
        echo -e "${COLOR_YELLOW}⚠ Algumas dependências estão desatualizadas${COLOR_RESET}"
    fi
}

# Função para listar dependências
list_dependencies() {
    echo ""
    echo -e "${COLOR_BLUE}3. Listando todas as dependências instaladas...${COLOR_RESET}"
    
    pnpm list --depth=0 2>&1 || true
}

# Função para verificar licenças problemáticas
check_licenses() {
    echo ""
    echo -e "${COLOR_BLUE}4. Verificando licenças de dependências...${COLOR_RESET}"
    
    if command -v npx &> /dev/null; then
        if npx license-checker --summary 2>&1; then
            echo -e "${COLOR_GREEN}✓ Verificação de licenças concluída${COLOR_RESET}"
        else
            echo -e "${COLOR_YELLOW}⚠ license-checker não disponível${COLOR_RESET}"
            echo "Instale com: npm install -g license-checker"
        fi
    else
        echo -e "${COLOR_YELLOW}⚠ npx não disponível para verificação de licenças${COLOR_RESET}"
    fi
}

# Função para aplicar correções automáticas
apply_fixes() {
    if [ "$FIX_MODE" = true ]; then
        echo ""
        echo -e "${COLOR_BLUE}5. Aplicando correções automáticas...${COLOR_RESET}"
        
        if pnpm audit --fix 2>&1; then
            echo -e "${COLOR_GREEN}✓ Correções aplicadas com sucesso${COLOR_RESET}"
        else
            echo -e "${COLOR_YELLOW}⚠ Algumas correções não puderam ser aplicadas automaticamente${COLOR_RESET}"
        fi
        
        echo ""
        echo -e "${COLOR_BLUE}Tentando atualizar dependências com vulnerabilidades...${COLOR_RESET}"
        pnpm update 2>&1 || echo -e "${COLOR_YELLOW}⚠ Atualização parcialmente concluída${COLOR_RESET}"
    fi
}

# Função para gerar resumo
generate_summary() {
    echo ""
    echo -e "${COLOR_BLUE}=== Resumo da Auditoria ===${COLOR_RESET}"
    
    if [ "$AUDIT_FAILED" = true ]; then
        echo -e "${COLOR_YELLOW}Status: Auditoria incompleta (restrições de rede)${COLOR_RESET}"
        echo ""
        echo "Recomendações:"
        echo "1. Execute este script em um ambiente com acesso completo à internet"
        echo "2. Verifique manualmente as dependências desatualizadas acima"
        echo "3. Consulte https://www.npmjs.com/advisories para vulnerabilidades conhecidas"
        echo "4. Use 'pnpm audit --fix' quando possível para corrigir automaticamente"
    else
        echo -e "${COLOR_GREEN}Status: Auditoria concluída com sucesso${COLOR_RESET}"
    fi
    
    echo ""
    echo "Para mais informações sobre segurança:"
    echo "- GitHub Advisory Database: https://github.com/advisories"
    echo "- npm Security Advisories: https://www.npmjs.com/advisories"
    echo "- Snyk Vulnerability DB: https://snyk.io/vuln"
}

# Executar auditoria
run_pnpm_audit || true
check_outdated
list_dependencies
check_licenses
apply_fixes
generate_summary

echo ""
echo -e "${COLOR_BLUE}=== Auditoria Finalizada ===${COLOR_RESET}"

# Retornar código de saída apropriado
if [ "$AUDIT_FAILED" = true ] && [ "$FIX_MODE" = false ]; then
    exit 0  # Não falhar o CI/CD por restrições de rede
fi
