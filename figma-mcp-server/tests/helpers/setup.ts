/**
 * Vitest Global Setup
 * 
 * Configures test environment before running test suites
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';

// Set test environment variables
beforeAll(() => {
  process.env.FIGMA_PERSONAL_TOKEN = 'test-token-12345';
  process.env.FIGMA_FILE_ID = 'test-file-id';
  process.env.FIGMA_FRAME_ID = 'test-frame-id';
  process.env.MCP_SERVER_PORT = '3845';
  process.env.LOG_LEVEL = 'silent'; // Suppress logs during tests
});

// Clean up after all tests
afterAll(() => {
  delete process.env.FIGMA_PERSONAL_TOKEN;
  delete process.env.FIGMA_FILE_ID;
  delete process.env.FIGMA_FRAME_ID;
  delete process.env.MCP_SERVER_PORT;
  delete process.env.LOG_LEVEL;
});

// Reset config cache before each test
beforeEach(async () => {
  // Clear require cache for config module to force reload
  const configPath = new URL('../../src/config.js', import.meta.url).pathname;
  delete (await import('module')).default._cache[configPath];
});
