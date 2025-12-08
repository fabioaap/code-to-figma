/**
 * T013 [US1] get_design_tokens Tool Implementation
 * 
 * MCP tool that:
 * 1. Fetches frame data from Figma API
 * 2. Transforms layers into TokenSet
 * 3. Validates against schema
 * 4. Optionally writes to packages/tokens/src/tokens.json
 * 
 * This tool implements the contract defined in:
 * specs/001-figma-mcp-server/contracts/figma-mcp-tools.yaml#/tools/get-design-tokens
 */

import { figmaClient } from '../services/figmaClient.js';
import { mapFigmaFrameToTokenSet, type TokenSet, type FigmaNode } from '../schemas/tokenSet.js';
import fs from 'fs/promises';
import path from 'path';
import pino from 'pino';

const logger = pino({ level: 'info' }, process.stderr);

export interface GetDesignTokensInput {
  fileId: string;
  frameId: string;
  writeTo?: string;
}

export interface GetDesignTokensOutput extends TokenSet {
  // Extends TokenSet with no additional fields for now
  // Future: Could add stats like { extractedColors: number, ... }
}

/**
 * Main tool implementation: Extract design tokens from Figma frame
 * 
 * @param input - Tool parameters matching GetDesignTokensInput schema
 * @returns TokenSet ready for consumption by design-system
 * @throws Error on API failures, validation errors, or file write issues
 */
export async function getDesignTokens(
  input: GetDesignTokensInput
): Promise<GetDesignTokensOutput> {
  const { fileId, frameId, writeTo } = input;

  logger.info({ fileId, frameId }, 'Fetching design tokens from Figma');

  try {
    // Step 1: Fetch frame data from Figma API
    const response = await figmaClient.getFrameNodes(fileId, frameId);

    if (!response.nodes || !(response.nodes as Record<string, unknown>)[frameId]) {
      throw new Error(`Frame ${frameId} not found in file ${fileId}`);
    }

    const frameData = (response.nodes as Record<string, { document: FigmaNode }>)[frameId];
    const frameNode: FigmaNode = frameData.document;

    // Step 2: Transform to TokenSet with validation
    const tokenSet = mapFigmaFrameToTokenSet(frameNode, {
      sourceFrameId: frameId,
      sourceFileId: fileId,
      exportedAt: new Date().toISOString(),
      version: '0.1.0', // TODO: Read from package.json or config
    });

    logger.info(
      {
        colors: Object.keys(tokenSet.colors).length,
        typography: Object.keys(tokenSet.typography || {}).length,
        spacing: Object.keys(tokenSet.spacing || {}).length,
      },
      'Successfully extracted tokens'
    );

    // Step 3: Write to file if path specified
    if (writeTo) {
      await writeTokenSetToFile(tokenSet, writeTo);
      logger.info({ path: writeTo }, 'Tokens written to file');
    }

    return tokenSet;
  } catch (error) {
    const err = error as Error;
    logger.error({ error: err.message, fileId, frameId }, 'Failed to get design tokens');
    throw error;
  }
}

/**
 * Write TokenSet to JSON file, merging with existing tokens if present
 * 
 * Merging strategy:
 * - Metadata: Always use new values
 * - Colors/Typography/Spacing: Merge with new values taking precedence
 * - Preserve tokens not present in new export
 * 
 * @param tokenSet - Validated TokenSet to write
 * @param outputPath - Absolute or relative path to output JSON file
 */
async function writeTokenSetToFile(tokenSet: TokenSet, outputPath: string): Promise<void> {
  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Read existing tokens if file exists
  let existingTokens: Partial<TokenSet> = {};
  try {
    const existingContent = await fs.readFile(outputPath, 'utf-8');
    existingTokens = JSON.parse(existingContent);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'ENOENT') {
      logger.warn({ error: err.message }, 'Failed to read existing tokens, will overwrite');
    }
  }

  // Merge tokens: new values override, but preserve non-conflicting keys
  const merged: TokenSet = {
    metadata: tokenSet.metadata, // Always use fresh metadata
    colors: {
      ...existingTokens.colors,
      ...tokenSet.colors,
    },
    typography: {
      ...existingTokens.typography,
      ...tokenSet.typography,
    },
    spacing: {
      ...existingTokens.spacing,
      ...tokenSet.spacing,
    },
    shadows: {
      ...existingTokens.shadows,
      ...tokenSet.shadows,
    },
  };

  // Write formatted JSON
  await fs.writeFile(outputPath, JSON.stringify(merged, null, 2), 'utf-8');
}

/**
 * Tool invocation wrapper for MCP server
 * 
 * Validates input and returns MCP-compatible response
 */
export async function invokeGetDesignTokens(args: unknown): Promise<GetDesignTokensOutput> {
  // Basic input validation
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments: expected object with fileId and frameId');
  }

  const input = args as GetDesignTokensInput;

  if (!input.fileId || typeof input.fileId !== 'string') {
    throw new Error('Missing or invalid fileId');
  }

  if (!input.frameId || typeof input.frameId !== 'string') {
    throw new Error('Missing or invalid frameId');
  }

  // Use default output path if not specified
  const defaultOutputPath = path.join(
    process.cwd(),
    '../../packages/tokens/src/tokens.json'
  );

  return getDesignTokens({
    fileId: input.fileId,
    frameId: input.frameId,
    writeTo: input.writeTo || defaultOutputPath,
  });
}
