#!/bin/bash
# Master script to set up GitHub issues from backlog
# This orchestrates the entire process

set -e

echo "🚀 GitHub Issues Setup - figma-sync-engine backlog"
echo "=================================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."
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

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Install it from: https://nodejs.org/"
    exit 1
fi

echo "✅ All prerequisites met"
echo ""

# Step 1: Create labels
echo "Step 1/2: Creating GitHub labels..."
./scripts/create-github-labels.sh
echo ""

# Small delay to ensure labels are available
sleep 2

# Step 2: Create issues
echo "Step 2/2: Creating GitHub issues..."
node scripts/create-github-issues.js
echo ""

echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review issues at: https://github.com/fabioaap/code-to-figma/issues"
echo "2. Check the tracker at: figma-sync-engine/docs/backlog-issues-tracker.md"
echo "3. Optional: Create a GitHub Project board to organize the work"
echo "4. Start working on issues following the MoSCoW prioritization"
