# MVP5 Execution Script

## Overview

The `MVP5_EXECUTION_SCRIPT.ps1` is a PowerShell automation script designed to validate and test the MVP5 implementation of the Figma Sync Engine. It automates the entire build, test, and validation pipeline for the Storybook addon export functionality.

## Prerequisites

- **PowerShell**: PowerShell Core 6+ or PowerShell 7+ (pwsh) must be installed
  - Windows: PowerShell 5.1 is pre-installed, but PowerShell 7+ is recommended
  - macOS: `brew install powershell`
  - Linux: [Install PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell)
  
- **Node.js**: Version 20+ recommended
- **pnpm**: Package manager (script will check if installed)
  - Install: `npm install -g pnpm`

## Usage

### Basic Execution

Run the complete validation pipeline:

```powershell
pwsh .\MVP5_EXECUTION_SCRIPT.ps1
```

This will execute all steps:
1. Install dependencies (pnpm install)
2. Build all packages (pnpm build)
3. Run linting (pnpm lint)
4. Run all tests (pnpm test)
5. Run MVP5-specific addon tests

### Command-Line Options

The script supports several flags to customize execution:

```powershell
pwsh .\MVP5_EXECUTION_SCRIPT.ps1 [-SkipInstall] [-SkipBuild] [-SkipTests] [-StartDev]
```

#### Available Flags

- **`-SkipInstall`**: Skip the dependency installation step
  ```powershell
  pwsh .\MVP5_EXECUTION_SCRIPT.ps1 -SkipInstall
  ```

- **`-SkipBuild`**: Skip the build step (requires packages already built)
  ```powershell
  pwsh .\MVP5_EXECUTION_SCRIPT.ps1 -SkipBuild
  ```

- **`-SkipTests`**: Skip the general test execution (will still run MVP5 addon tests)
  ```powershell
  pwsh .\MVP5_EXECUTION_SCRIPT.ps1 -SkipTests
  ```

- **`-StartDev`**: Start the development server after validation
  ```powershell
  pwsh .\MVP5_EXECUTION_SCRIPT.ps1 -StartDev
  ```

#### Combining Flags

Flags can be combined for faster iterations:

```powershell
# Skip install and build for quick test runs
pwsh .\MVP5_EXECUTION_SCRIPT.ps1 -SkipInstall -SkipBuild

# Run full validation and start dev server
pwsh .\MVP5_EXECUTION_SCRIPT.ps1 -StartDev

# Quick lint check only
pwsh .\MVP5_EXECUTION_SCRIPT.ps1 -SkipInstall -SkipBuild -SkipTests
```

## Execution Steps

The script performs the following steps in order:

### 1. Prerequisites Check
- Verifies pnpm is installed
- Confirms script is running from correct directory

### 2. Install Dependencies (Optional)
- Runs `pnpm install` to install all workspace dependencies
- Can be skipped with `-SkipInstall` flag

### 3. Build Packages (Optional)
- Runs `pnpm build` to compile all packages
- Uses Turbo for optimized monorepo builds
- Can be skipped with `-SkipBuild` flag

### 4. Linting
- Runs `pnpm lint` across all packages
- Reports any code style or quality issues
- Always executed (no skip option)

### 5. General Tests (Optional)
- Runs `pnpm test` for all packages
- Executes unit and integration tests
- Can be skipped with `-SkipTests` flag

### 6. MVP5 Addon Tests
- Runs specific tests for `@figma-sync-engine/storybook-addon-export`
- Validates export functionality
- Always executed (no skip option)

### 7. Summary
- Reports total execution time
- Shows success/failure status
- Provides next steps for manual testing

## Output

The script provides colorized output for easy reading:

- ✓ Green: Successful operations
- ✗ Red: Failed operations or errors
- ℹ Cyan: Informational messages
- Yellow: Step headers

### Example Output

```
╔════════════════════════════════════════════════════════════╗
║        MVP5 EXECUTION SCRIPT - Figma Sync Engine         ║
╚════════════════════════════════════════════════════════════╝

=== Checking Prerequisites ===
✓ pnpm is installed (version: 10.23.0)

=== Step 1: Installing Dependencies ===
ℹ Running: pnpm install
✓ Dependencies installed successfully

=== Step 2: Building All Packages ===
ℹ Running: pnpm build
✓ All packages built successfully

...

╔════════════════════════════════════════════════════════════╗
║                    EXECUTION SUMMARY                      ║
╚════════════════════════════════════════════════════════════╝

ℹ Total execution time: 45.23 seconds
✓ MVP5 validation completed successfully!
```

## Manual Testing Steps

After successful execution, perform manual testing:

1. **Start Development Server**
   ```bash
   pnpm dev
   ```

2. **Open Storybook**
   - Navigate to: `http://localhost:6006`
   - Or use the port shown in terminal

3. **Test Export Functionality**
   - Select the Button story in `examples/react-button`
   - Open the "Figma Export" panel (right sidebar)
   - Test "Copy to Clipboard" button
   - Test "Download File" button
   - Verify exported JSON structure

## Troubleshooting

### pnpm Not Found

If you see "pnpm is not installed":
```bash
npm install -g pnpm
```

### Build Failures

If builds fail:
1. Check Node.js version (should be 20+)
2. Clear cache: `pnpm store prune`
3. Remove node_modules: `rm -rf node_modules packages/*/node_modules`
4. Re-run with full install: `pwsh .\MVP5_EXECUTION_SCRIPT.ps1`

### Test Failures

If tests fail:
1. Review test output for specific failures
2. Check if it's a known issue in the backlog
3. Run specific package tests: `pnpm test --filter @figma-sync-engine/storybook-addon-export`

### Permission Errors (Linux/macOS)

If you get permission errors:
```bash
chmod +x MVP5_EXECUTION_SCRIPT.ps1
```

## Exit Codes

- `0`: All steps completed successfully
- `1`: One or more steps failed
- Non-zero: Error during execution

## Related Documentation

- [MVP5 Quick Start](./docs/MVP5_QUICK_START.md)
- [MVP5 Summary](./docs/MVP5_SUMMARY.md)
- [MVP5 Code Examples](./docs/MVP5_CODE_EXAMPLES.md)
- [Cloud Agent MVP5 Prompt](./docs/CLOUD_AGENT_MVP5_PROMPT.md)

## Contributing

When modifying the script:
1. Test with all flag combinations
2. Ensure colorized output remains clear
3. Update this README with any new features
4. Maintain backward compatibility

## License

MIT - See main repository LICENSE file
