#!/bin/bash

# Script de Auditoria de Segurança - Versão Shell
# 
# Este é um wrapper simples que executa npm audit e formata o resultado.
# Use como alternativa ao script Node.js quando necessário.

set -e

REPORT_DIR="audit-reports"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo "🔒 Iniciando Auditoria de Segurança"
echo ""
echo "📂 Diretório: $(pwd)"
echo "📅 Data: $(date)"
echo ""

# Cria diretório de relatórios
mkdir -p "$REPORT_DIR"

# Verifica se package-lock.json existe, se não, avisa
if [ ! -f "package-lock.json" ]; then
    echo "⚠️  package-lock.json não encontrado"
    echo "🔄 Gerando package-lock.json temporário..."
    echo ""
    
    # Tenta gerar com npm (pode demorar)
    if timeout 120 npm install --package-lock-only --legacy-peer-deps; then
        echo "✅ package-lock.json gerado"
        CLEANUP_LOCK=true
    else
        echo "❌ Não foi possível gerar package-lock.json"
        echo "💡 Execute 'npm install' manualmente ou use pnpm audit se disponível"
        exit 1
    fi
fi

# Executa npm audit e salva resultado
echo "🔍 Executando npm audit..."
echo ""

# Salva JSON
npm audit --json > "$REPORT_DIR/audit-${TIMESTAMP}.json" || true

# Salva texto
npm audit > "$REPORT_DIR/audit-${TIMESTAMP}.txt" 2>&1 || AUDIT_EXIT=$?

# Cria symlinks para latest
ln -sf "audit-${TIMESTAMP}.json" "$REPORT_DIR/latest.json"
ln -sf "audit-${TIMESTAMP}.txt" "$REPORT_DIR/latest.txt"

echo ""
echo "💾 Relatórios salvos em $REPORT_DIR/"
echo "   - latest.json (JSON completo)"
echo "   - latest.txt (Texto legível)"
echo ""

# Mostra resumo
if [ -f "$REPORT_DIR/latest.txt" ]; then
    echo "======================================================================"
    echo "📊 RESUMO DA AUDITORIA"
    echo "======================================================================"
    echo ""
    grep -A 20 "found" "$REPORT_DIR/latest.txt" | head -n 25 || cat "$REPORT_DIR/latest.txt"
    echo ""
fi

# Cleanup do package-lock se foi gerado
if [ "$CLEANUP_LOCK" = true ]; then
    echo "🧹 Removendo package-lock.json temporário"
    rm -f package-lock.json
fi

# Retorna o código de saída do audit
if [ -n "$AUDIT_EXIT" ] && [ "$AUDIT_EXIT" -ne 0 ]; then
    echo "❌ AUDITORIA ENCONTROU VULNERABILIDADES"
    echo "💡 Execute 'npm audit fix' para tentar corrigir automaticamente"
    echo ""
    exit "$AUDIT_EXIT"
fi

echo "✅ AUDITORIA CONCLUÍDA"
echo ""
exit 0
