/**
 * Configuration Management for Figma MCP Server
 * 
 * Loads and validates environment variables using Zod schemas.
 * Ensures all required credentials are present before server starts.
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env.local if present
dotenv.config({ path: '.env.local' });

const configSchema = z.object({
  FIGMA_PERSONAL_TOKEN: z.string().min(1, 'FIGMA_PERSONAL_TOKEN is required'),
  FIGMA_FILE_ID: z.string().optional().default('Sz4z0rpDmocXZ8LylxEgqF'),
  FIGMA_FRAME_ID: z.string().optional().default('8565:17355'),
  MCP_SERVER_PORT: z.coerce.number().optional().default(3845),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

export type Config = z.infer<typeof configSchema>;

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    cachedConfig = configSchema.parse({
      // Accept FIGMA_PERSONAL_TOKEN or fallback to FIGMA_ACCESS_TOKEN for backward compatibility
      FIGMA_PERSONAL_TOKEN: process.env.FIGMA_PERSONAL_TOKEN || process.env.FIGMA_ACCESS_TOKEN,
      FIGMA_FILE_ID: process.env.FIGMA_FILE_ID,
      FIGMA_FRAME_ID: process.env.FIGMA_FRAME_ID,
      MCP_SERVER_PORT: process.env.MCP_SERVER_PORT,
      NODE_ENV: process.env.NODE_ENV,
    });

    return cachedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.errors.map((e: z.ZodIssue) => e.path.join('.')).join(', ');
      throw new Error(
        `Configuration validation failed: ${missingFields}\n` +
        `Please check your .env.local file. See .env.local.example for required values.`
      );
    }
    throw error;
  }
}

export function getConfig(): Config {
  // Lazy-load configuration if not yet loaded
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}
