#!/bin/bash
# Validation script to verify all deliverables are correct

echo "🔍 Validating Backlog Issues Implementation..."
echo ""

ERRORS=0

# Check if all required files exist
echo "Checking file existence..."
FILES=(
    "IMPLEMENTATION_SUMMARY.md"
    "figma-sync-engine/CONTRIBUTING.md"
    "figma-sync-engine/docs/backlog-issues.json"
    "figma-sync-engine/docs/backlog-issues-tracker.md"
    "scripts/README.md"
    "scripts/create-github-issues.js"
    "scripts/create-github-labels.sh"
    "scripts/setup-backlog-issues.sh"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "Checking JSON validity..."
if node -e "JSON.parse(require('fs').readFileSync('figma-sync-engine/docs/backlog-issues.json', 'utf-8'))" 2>/dev/null; then
    echo "  ✅ JSON is valid"
    
    # Count issues
    EPIC_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('figma-sync-engine/docs/backlog-issues.json', 'utf-8')).epics.length)")
    ISSUE_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('figma-sync-engine/docs/backlog-issues.json', 'utf-8')).epics.reduce((sum, e) => sum + e.issues.length, 0))")
    
    echo "  ✅ EPICs: $EPIC_COUNT (expected: 8)"
    echo "  ✅ Issues: $ISSUE_COUNT (expected: 42)"
    
    if [ "$EPIC_COUNT" != "8" ] || [ "$ISSUE_COUNT" != "42" ]; then
        echo "  ❌ Incorrect counts"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "  ❌ JSON is invalid"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "Checking script syntax..."

# Check shell scripts
if bash -n scripts/create-github-labels.sh 2>/dev/null; then
    echo "  ✅ create-github-labels.sh syntax valid"
else
    echo "  ❌ create-github-labels.sh has syntax errors"
    ERRORS=$((ERRORS + 1))
fi

if bash -n scripts/setup-backlog-issues.sh 2>/dev/null; then
    echo "  ✅ setup-backlog-issues.sh syntax valid"
else
    echo "  ❌ setup-backlog-issues.sh has syntax errors"
    ERRORS=$((ERRORS + 1))
fi

# Check Node.js script loads
if node -c scripts/create-github-issues.js 2>/dev/null; then
    echo "  ✅ create-github-issues.js syntax valid"
else
    echo "  ❌ create-github-issues.js has syntax errors"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "Checking executability..."
EXEC_FILES=(
    "scripts/create-github-labels.sh"
    "scripts/setup-backlog-issues.sh"
    "scripts/create-github-issues.js"
)

for file in "${EXEC_FILES[@]}"; do
    if [ -x "$file" ]; then
        echo "  ✅ $file is executable"
    else
        echo "  ⚠️  $file is not executable (can be fixed with chmod +x)"
    fi
done

echo ""
echo "Checking documentation completeness..."

# Check CONTRIBUTING.md sections
if grep -q "## Configuração do Ambiente" figma-sync-engine/CONTRIBUTING.md && \
   grep -q "## Padrões de Código" figma-sync-engine/CONTRIBUTING.md && \
   grep -q "## Testes" figma-sync-engine/CONTRIBUTING.md; then
    echo "  ✅ CONTRIBUTING.md has all required sections"
else
    echo "  ❌ CONTRIBUTING.md missing required sections"
    ERRORS=$((ERRORS + 1))
fi

# Check README updates
if grep -q "Backlog & Roadmap" figma-sync-engine/README.md; then
    echo "  ✅ README.md updated with backlog section"
else
    echo "  ❌ README.md missing backlog section"
    ERRORS=$((ERRORS + 1))
fi

# Check backlog.md updates
if grep -q "backlog-issues-tracker.md" figma-sync-engine/docs/backlog.md; then
    echo "  ✅ backlog.md updated with tracker link"
else
    echo "  ❌ backlog.md missing tracker link"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "==============================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All validations passed!"
    echo ""
    echo "Ready to create issues. Run:"
    echo "  ./scripts/setup-backlog-issues.sh"
    exit 0
else
    echo "❌ $ERRORS validation(s) failed"
    exit 1
fi
