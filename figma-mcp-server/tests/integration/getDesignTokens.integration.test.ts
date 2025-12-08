/**
 * T011 [P] [US1] Integration test for get_design_tokens tool
 * 
 * Stubs Figma API responses and validates that the tool:
 * 1. Fetches frame data from Figma
 * 2. Transforms layers into TokenSet
 * 3. Writes correct diff to packages/tokens/src/tokens.json
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDesignTokens } from '../../src/tools/getDesignTokens.js';
import { mockFigmaFrameResponse, mockFigmaLayersForTokens } from '../helpers/mockFigma.js';
import fs from 'fs/promises';
import path from 'path';

// Mock figmaClient to avoid real API calls
vi.mock('../../src/services/figmaClient.js', () => ({
  figmaClient: {
    getFrameNodes: vi.fn(),
    getImageExport: vi.fn(),
  },
}));

describe('getDesignTokens Integration', () => {
  const testFileId = 'Sz4z0rpDmocXZ8LylxEgqF';
  const testFrameId = '8565:17355';
  const tempOutputPath = path.join(process.cwd(), 'tests/__temp__/tokens.json');

  beforeEach(async () => {
    // Clear previous test outputs
    try {
      await fs.rm(path.dirname(tempOutputPath), { recursive: true, force: true });
    } catch {
      // Ignore if directory doesn't exist
    }
    await fs.mkdir(path.dirname(tempOutputPath), { recursive: true });

    // Reset mocks
    vi.clearAllMocks();
  });

  it('should fetch frame data and transform into valid TokenSet', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    
    // Mock Figma API response
    vi.mocked(figmaClient.getFrameNodes).mockResolvedValue(mockFigmaFrameResponse);

    const result = await getDesignTokens({
      fileId: testFileId,
      frameId: testFrameId,
      writeTo: tempOutputPath,
    });

    expect(result).toBeDefined();
    expect(result.metadata.sourceFrameId).toBe(testFrameId);
    expect(result.metadata.sourceFileId).toBe(testFileId);
    expect(result.colors).toBeDefined();
    expect(Object.keys(result.colors).length).toBeGreaterThan(0);
  });

  it('should write TokenSet to specified output path', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    vi.mocked(figmaClient.getFrameNodes).mockResolvedValue(mockFigmaFrameResponse);

    await getDesignTokens({
      fileId: testFileId,
      frameId: testFrameId,
      writeTo: tempOutputPath,
    });

    // Verify file was written
    const fileExists = await fs.access(tempOutputPath).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);

    // Verify content is valid JSON
    const content = await fs.readFile(tempOutputPath, 'utf-8');
    const parsed = JSON.parse(content);
    expect(parsed.metadata).toBeDefined();
    expect(parsed.colors).toBeDefined();
  });

  it('should extract colors from Figma layers', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    vi.mocked(figmaClient.getFrameNodes).mockResolvedValue({
      ...mockFigmaFrameResponse,
      nodes: {
        [testFrameId]: {
          ...mockFigmaFrameResponse.nodes[testFrameId],
          document: {
            ...mockFigmaFrameResponse.nodes[testFrameId].document,
            children: mockFigmaLayersForTokens.colors,
          },
        },
      },
    });

    const result = await getDesignTokens({
      fileId: testFileId,
      frameId: testFrameId,
      writeTo: tempOutputPath,
    });

    expect(result.colors['color.rede.primary']).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(result.colors['color.status.success']).toBeDefined();
  });

  it('should extract typography tokens from text layers', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    vi.mocked(figmaClient.getFrameNodes).mockResolvedValue({
      ...mockFigmaFrameResponse,
      nodes: {
        [testFrameId]: {
          ...mockFigmaFrameResponse.nodes[testFrameId],
          document: {
            ...mockFigmaFrameResponse.nodes[testFrameId].document,
            children: mockFigmaLayersForTokens.typography,
          },
        },
      },
    });

    const result = await getDesignTokens({
      fileId: testFileId,
      frameId: testFrameId,
      writeTo: tempOutputPath,
    });

    expect(result.typography).toBeDefined();
    const typographyKeys = Object.keys(result.typography || {});
    expect(typographyKeys.length).toBeGreaterThan(0);
    
    const firstTypography = result.typography?.[typographyKeys[0]];
    expect(firstTypography?.fontFamily).toBeDefined();
    expect(firstTypography?.fontSize).toBeTypeOf('number');
    expect(firstTypography?.fontWeight).toBeTypeOf('number');
  });

  it('should extract spacing tokens from layout', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    vi.mocked(figmaClient.getFrameNodes).mockResolvedValue({
      ...mockFigmaFrameResponse,
      nodes: {
        [testFrameId]: {
          ...mockFigmaFrameResponse.nodes[testFrameId],
          document: {
            ...mockFigmaFrameResponse.nodes[testFrameId].document,
            children: mockFigmaLayersForTokens.spacing,
          },
        },
      },
    });

    const result = await getDesignTokens({
      fileId: testFileId,
      frameId: testFrameId,
      writeTo: tempOutputPath,
    });

    expect(result.spacing).toBeDefined();
    const spacingKeys = Object.keys(result.spacing || {});
    expect(spacingKeys.length).toBeGreaterThan(0);
    
    const firstSpacing = result.spacing?.[spacingKeys[0]];
    expect(firstSpacing).toMatch(/^[0-9]+px$/);
  });

  it('should handle missing or invalid frame gracefully', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    vi.mocked(figmaClient.getFrameNodes).mockRejectedValue(new Error('Frame not found'));

    await expect(
      getDesignTokens({
        fileId: testFileId,
        frameId: 'invalid-frame',
        writeTo: tempOutputPath,
      })
    ).rejects.toThrow();
  });

  it('should preserve existing tokens when merging', async () => {
    // Pre-populate output with existing tokens
    const existingTokens = {
      metadata: {
        sourceFrameId: 'old-frame',
        sourceFileId: testFileId,
        exportedAt: '2025-01-01T00:00:00Z',
        version: '0.0.1',
      },
      colors: {
        'color.legacy.blue': '#0000FF',
      },
    };
    await fs.writeFile(tempOutputPath, JSON.stringify(existingTokens, null, 2));

    const { figmaClient } = await import('../../src/services/figmaClient.js');
    vi.mocked(figmaClient.getFrameNodes).mockResolvedValue(mockFigmaFrameResponse);

    await getDesignTokens({
      fileId: testFileId,
      frameId: testFrameId,
      writeTo: tempOutputPath,
    });

    const content = await fs.readFile(tempOutputPath, 'utf-8');
    const merged = JSON.parse(content);

    // Should have new metadata but preserve non-conflicting colors
    expect(merged.metadata.sourceFrameId).toBe(testFrameId);
    expect(merged.colors['color.legacy.blue']).toBe('#0000FF'); // preserved
  });
});
