#!/usr/bin/env node

/**
 * T015 [US1] writeTokensFromMcp - Token Pipeline Orchestrator
 * 
 * Orchestrates the complete token refresh workflow:
 * 1. Calls getDesignTokens to fetch from Figma
 * 2. Writes to packages/tokens/src/tokens.json
 * 3. Triggers pnpm build:tokens
 * 4. Triggers pnpm build:design-system
 * 5. Updates PROGRESS_DASHBOARD.md with sync log
 * 
 * This script is the entry point for automated token updates,
 * implementing the workflow described in specs/001-figma-mcp-server/quickstart.md#4
 */

import { getDesignTokens } from '../src/tools/getDesignTokens.js';
import { loadConfig } from '../src/config.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

interface TokenSyncResult {
  success: boolean;
  tokensPath: string;
  stats: {
    colors: number;
    typography: number;
    spacing: number;
  };
  buildResults: {
    tokens: boolean;
    designSystem: boolean;
  };
  duration: number;
  error?: string;
}

/**
 * Execute shell command and return success status
 */
function runCommand(command: string, args: string[], cwd: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      resolve(code === 0);
    });

    proc.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Update PROGRESS_DASHBOARD.md with sync log entry
 */
async function logSyncToProgress(result: TokenSyncResult): Promise<void> {
  const dashboardPath = path.join(
    process.cwd(),
    '../../PROGRESS_DASHBOARD.md'
  );

  try {
    const timestamp = new Date().toISOString();
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    
    const logEntry = `\n## Figma Token Sync - ${timestamp}\n\n` +
      `- **Status**: ${status}\n` +
      `- **Tokens Extracted**: ${result.stats.colors} colors, ` +
      `${result.stats.typography} typography, ${result.stats.spacing} spacing\n` +
      `- **Build Results**: tokens=${result.buildResults.tokens ? '✓' : '✗'}, ` +
      `design-system=${result.buildResults.designSystem ? '✓' : '✗'}\n` +
      `- **Duration**: ${result.duration}ms\n` +
      (result.error ? `- **Error**: ${result.error}\n` : '') +
      `\n---\n`;

    // Append to dashboard
    await fs.appendFile(dashboardPath, logEntry, 'utf-8');
    console.error(`✓ Logged sync to ${dashboardPath}`);
  } catch (error) {
    const err = error as Error;
    console.error(`⚠ Failed to log to PROGRESS_DASHBOARD.md: ${err.message}`);
  }
}

/**
 * Main orchestration function
 */
async function main() {
  const startTime = Date.now();
  
  console.error('🚀 Starting Figma token sync pipeline...\n');

  try {
    // Step 1: Load configuration
    const config = loadConfig();
    console.error(`✓ Configuration loaded`);
    console.error(`  File ID: ${config.FIGMA_FILE_ID}`);
    console.error(`  Frame ID: ${config.FIGMA_FRAME_ID}\n`);

    // Step 2: Fetch tokens from Figma
    const tokensPath = path.join(
      process.cwd(),
      '../../packages/tokens/src/tokens.json'
    );

    console.error('📥 Fetching design tokens from Figma...');
    const tokenSet = await getDesignTokens({
      fileId: config.FIGMA_FILE_ID || 'Sz4z0rpDmocXZ8LylxEgqF',
      frameId: config.FIGMA_FRAME_ID || '8565:17355',
      writeTo: tokensPath,
    });

    const stats = {
      colors: Object.keys(tokenSet.colors).length,
      typography: Object.keys(tokenSet.typography || {}).length,
      spacing: Object.keys(tokenSet.spacing || {}).length,
    };

    console.error(`✓ Tokens extracted:`);
    console.error(`  Colors: ${stats.colors}`);
    console.error(`  Typography: ${stats.typography}`);
    console.error(`  Spacing: ${stats.spacing}\n`);

    // Step 3: Build tokens package
    console.error('🔨 Building tokens package...');
    const repoRoot = path.join(process.cwd(), '../..');
    const tokensBuildSuccess = await runCommand('pnpm', ['build:tokens'], repoRoot);

    if (!tokensBuildSuccess) {
      throw new Error('pnpm build:tokens failed');
    }
    console.error('✓ Tokens package built\n');

    // Step 4: Build design-system package
    console.error('🔨 Building design-system package...');
    const designSystemBuildSuccess = await runCommand('pnpm', ['build:design-system'], repoRoot);

    if (!designSystemBuildSuccess) {
      throw new Error('pnpm build:design-system failed');
    }
    console.error('✓ Design-system package built\n');

    // Step 5: Log results
    const duration = Date.now() - startTime;
    const result: TokenSyncResult = {
      success: true,
      tokensPath,
      stats,
      buildResults: {
        tokens: tokensBuildSuccess,
        designSystem: designSystemBuildSuccess,
      },
      duration,
    };

    await logSyncToProgress(result);

    console.error(`\n✅ Token sync completed successfully in ${duration}ms`);
    console.error(`📝 Tokens written to: ${tokensPath}`);
    console.error(`📖 Next: Review changes and commit to git\n`);

    process.exit(0);
  } catch (error) {
    const err = error as Error;
    const duration = Date.now() - startTime;
    
    console.error(`\n❌ Token sync failed: ${err.message}\n`);

    const failureResult: TokenSyncResult = {
      success: false,
      tokensPath: '',
      stats: { colors: 0, typography: 0, spacing: 0 },
      buildResults: { tokens: false, designSystem: false },
      duration,
      error: err.message,
    };

    await logSyncToProgress(failureResult);

    process.exit(1);
  }
}

main();
