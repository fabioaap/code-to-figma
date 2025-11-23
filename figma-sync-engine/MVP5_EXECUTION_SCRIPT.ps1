#!/usr/bin/env pwsh
# MVP5_EXECUTION_SCRIPT.ps1
# PowerShell script to automate MVP5 implementation validation and testing
# 
# Usage:
#   pwsh .\MVP5_EXECUTION_SCRIPT.ps1 [-SkipInstall] [-SkipBuild] [-SkipTests] [-StartDev]
#
# Options:
#   -SkipInstall : Skip pnpm install step
#   -SkipBuild   : Skip build step
#   -SkipTests   : Skip test execution
#   -StartDev    : Start development server after validation (interactive)

param(
    [switch]$SkipInstall = $false,
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false,
    [switch]$StartDev = $false
)

# Color output functions
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Yellow
}

# Start execution
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║        MVP5 EXECUTION SCRIPT - Figma Sync Engine         ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

$startTime = Get-Date

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Error-Message "package.json not found. Please run this script from the figma-sync-engine directory."
    exit 1
}

# Verify pnpm is installed
Write-Step "Checking Prerequisites"
try {
    $pnpmVersion = pnpm --version
    Write-Success "pnpm is installed (version: $pnpmVersion)"
} catch {
    Write-Error-Message "pnpm is not installed. Please install pnpm first:"
    Write-Info "npm install -g pnpm"
    exit 1
}

# Step 1: Install Dependencies
if (-not $SkipInstall) {
    Write-Step "Step 1: Installing Dependencies"
    Write-Info "Running: pnpm install"
    
    pnpm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Dependency installation failed!"
        exit 1
    }
    Write-Success "Dependencies installed successfully"
} else {
    Write-Info "Skipping dependency installation (--SkipInstall flag)"
}

# Step 2: Build All Packages
if (-not $SkipBuild) {
    Write-Step "Step 2: Building All Packages"
    Write-Info "Running: pnpm build"
    
    pnpm build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Build failed!"
        exit 1
    }
    Write-Success "All packages built successfully"
} else {
    Write-Info "Skipping build step (--SkipBuild flag)"
}

# Step 3: Run Linting
Write-Step "Step 3: Running Linting"
Write-Info "Running: pnpm lint"

pnpm lint

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Linting found issues!"
    Write-Info "You may need to fix linting errors before proceeding."
} else {
    Write-Success "Linting passed successfully"
}

# Step 4: Run Tests
if (-not $SkipTests) {
    Write-Step "Step 4: Running Tests"
    Write-Info "Running: pnpm test"
    
    pnpm test
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Tests failed!"
        Write-Info "Some tests may be failing. Please review the test output above."
    } else {
        Write-Success "All tests passed successfully"
    }
} else {
    Write-Info "Skipping tests (--SkipTests flag)"
}

# Step 5: Specific MVP5 Addon Tests
Write-Step "Step 5: Running MVP5 Storybook Addon Tests"
Write-Info "Running: pnpm test --filter @figma-sync-engine/storybook-addon-export"

pnpm test --filter @figma-sync-engine/storybook-addon-export

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Storybook addon tests failed!"
} else {
    Write-Success "Storybook addon tests passed"
}

# Calculate execution time
$endTime = Get-Date
$duration = $endTime - $startTime
$durationSeconds = [math]::Round($duration.TotalSeconds, 2)

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                    EXECUTION SUMMARY                      ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

Write-Info "Total execution time: $durationSeconds seconds"
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Success "MVP5 validation completed successfully!"
    Write-Host ""
    Write-Info "Next steps for manual testing:"
    Write-Info "  1. Run: pnpm dev"
    Write-Info "  2. Open browser: http://localhost:6006"
    Write-Info "  3. Navigate to Button story in examples/react-button"
    Write-Info "  4. Test 'Export to Figma' functionality in the addon panel"
    Write-Host ""
} else {
    Write-Error-Message "Some steps failed. Please review the output above."
    Write-Host ""
}

# Optional: Start development server
if ($StartDev) {
    Write-Step "Starting Development Server"
    Write-Info "Running: pnpm dev"
    Write-Info "Press Ctrl+C to stop the development server"
    Write-Host ""
    
    pnpm dev
}

# Exit with appropriate code
exit $LASTEXITCODE
