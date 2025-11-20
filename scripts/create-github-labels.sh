#!/bin/bash
# Script to create GitHub labels for the backlog issues
# This script creates all necessary labels in the repository

set -e

REPO="fabioaap/code-to-figma"

echo "🏷️  Creating GitHub labels for backlog issues..."
echo "Repository: $REPO"
echo ""

# Check if gh is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

# Function to create or update a label
create_label() {
    local name="$1"
    local color="$2"
    local description="$3"
    
    # Check if label already exists
    if gh label list --repo "$REPO" | grep -q "^${name}"; then
        echo "⏭️  Label already exists: $name"
    else
        if gh label create "$name" --repo "$REPO" --color "$color" --description "$description" > /dev/null 2>&1; then
            echo "✅ Created label: $name"
        else
            echo "❌ Failed to create label: $name"
        fi
    fi
}

echo "Creating Epic labels..."
create_label "epic:mvp" "0E8A16" "EPIC 1: MVP Export Storybook → Figma"
create_label "epic:autolayout" "0E8A16" "EPIC 2: Auto Layout Engine Avançado"
create_label "epic:variants" "0E8A16" "EPIC 3: Variantes & Componentes"
create_label "epic:performance" "0E8A16" "EPIC 4: Performance & Escalabilidade"
create_label "epic:observability" "0E8A16" "EPIC 5: Observabilidade & Guardrails"
create_label "epic:tokens" "0E8A16" "EPIC 6: Design Tokens"
create_label "epic:security" "0E8A16" "EPIC 7: Segurança & Compliance"
create_label "epic:documentation" "0E8A16" "EPIC 8: Comunidade & Documentação"

echo ""
echo "Creating Priority labels..."
create_label "priority:must" "B60205" "Must Have - Prioridade crítica"
create_label "priority:should" "FBCA04" "Should Have - Prioridade alta"
create_label "priority:could" "0075CA" "Could Have - Prioridade média"
create_label "priority:wont" "E4E669" "Won't Have - Não será implementado"

echo ""
echo "Creating Type labels..."
create_label "type:delivery" "5319E7" "Entrega de funcionalidade"
create_label "type:discovery" "C5DEF5" "Pesquisa e descoberta"

echo ""
echo "Creating Area labels..."
create_label "area:autolayout" "D4C5F9" "Auto Layout"
create_label "area:figma-plugin" "D4C5F9" "Plugin Figma"
create_label "area:testing" "D4C5F9" "Testes"
create_label "area:documentation" "D4C5F9" "Documentação"
create_label "area:observability" "D4C5F9" "Observabilidade"
create_label "area:feature-flags" "D4C5F9" "Feature Flags"
create_label "area:security" "D4C5F9" "Segurança"
create_label "area:examples" "D4C5F9" "Exemplos"

echo ""
echo "✅ Label creation completed!"
echo ""
echo "Next step: Run 'node scripts/create-github-issues.js' to create issues"
