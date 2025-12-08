/**
 * US2 Integration test for get_frame_snapshot tool
 * 
 * Stubs Figma API responses and validates that the tool:
 * 1. Requests image generation from Figma
 * 2. Returns the correct image URL and metadata
 * 3. Handles errors gracefully
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFrameSnapshot } from '../../src/tools/getFrameSnapshot.js';

// Mock figmaClient to avoid real API calls
vi.mock('../../src/services/figmaClient.js', () => ({
  figmaClient: {
    getImages: vi.fn(),
  },
}));

describe('getFrameSnapshot Integration', () => {
  const testFileId = 'Sz4z0rpDmocXZ8LylxEgqF';
  const testNodeId = '123:456';
  const testImageUrl = 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/123-456.png';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve image URL for a valid node', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    
    // Mock Figma API response
    vi.mocked(figmaClient.getImages).mockResolvedValue({
      err: null,
      images: {
        [testNodeId]: testImageUrl,
      },
    });

    const result = await getFrameSnapshot({
      fileId: testFileId,
      nodeId: testNodeId,
    });

    expect(result).toBeDefined();
    expect(result.imageUrl).toBe(testImageUrl);
    expect(result.format).toBe('png'); // default
    expect(result.scale).toBe(2); // default
  });

  it('should respect format and scale options', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    
    vi.mocked(figmaClient.getImages).mockResolvedValue({
      err: null,
      images: {
        [testNodeId]: testImageUrl,
      },
    });

    const result = await getFrameSnapshot({
      fileId: testFileId,
      nodeId: testNodeId,
      format: 'svg',
      scale: 1,
    });

    expect(result.imageUrl).toBe(testImageUrl);
    expect(result.format).toBe('svg');
    expect(result.scale).toBe(1);

    // Verify client was called with correct options
    expect(figmaClient.getImages).toHaveBeenCalledWith(
      testFileId,
      [testNodeId],
      { format: 'svg', scale: 1 }
    );
  });

  it('should handle Figma API errors', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    
    vi.mocked(figmaClient.getImages).mockResolvedValue({
      err: 'Invalid file key',
      images: {},
    });

    await expect(
      getFrameSnapshot({
        fileId: testFileId,
        nodeId: testNodeId,
      })
    ).rejects.toThrow('Figma API error: Invalid file key');
  });

  it('should handle missing image URL in response', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    
    vi.mocked(figmaClient.getImages).mockResolvedValue({
      err: null,
      images: {
        // Node ID missing from response
      },
    });

    await expect(
      getFrameSnapshot({
        fileId: testFileId,
        nodeId: testNodeId,
      })
    ).rejects.toThrow(`No image URL returned for node ${testNodeId}`);
  });

  it('should handle network/client errors', async () => {
    const { figmaClient } = await import('../../src/services/figmaClient.js');
    
    vi.mocked(figmaClient.getImages).mockRejectedValue(new Error('Network error'));

    await expect(
      getFrameSnapshot({
        fileId: testFileId,
        nodeId: testNodeId,
      })
    ).rejects.toThrow('Network error');
  });
});
