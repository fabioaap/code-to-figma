/**
 * US2 get_frame_snapshot Tool Implementation
 * 
 * MCP tool that:
 * 1. Requests image generation for a specific node from Figma API
 * 2. Returns the image URL for the requested node
 */

import { figmaClient } from '../services/figmaClient.js';
import pino from 'pino';

const logger = pino({ level: 'info' }, process.stderr);

export interface GetFrameSnapshotInput {
  fileId: string;
  nodeId: string;
  format?: 'jpg' | 'png' | 'svg';
  scale?: number;
}

export interface GetFrameSnapshotOutput {
  imageUrl: string;
  format: string;
  scale: number;
}

/**
 * Main tool implementation: Get snapshot image of a Figma frame/node
 * 
 * @param input - Tool parameters matching GetFrameSnapshotInput schema
 * @returns Object containing the image URL and metadata
 */
export async function getFrameSnapshot(
  input: GetFrameSnapshotInput
): Promise<GetFrameSnapshotOutput> {
  const { fileId, nodeId, format = 'png', scale = 2 } = input;

  logger.info({ fileId, nodeId, format, scale }, 'Requesting frame snapshot from Figma');

  try {
    const response = await figmaClient.getImages(fileId, [nodeId], { format, scale });

    if (response.err) {
      throw new Error(`Figma API error: ${response.err}`);
    }

    const imageUrl = response.images[nodeId];

    if (!imageUrl) {
      throw new Error(`No image URL returned for node ${nodeId}`);
    }

    logger.info({ imageUrl }, 'Successfully retrieved snapshot URL');

    return {
      imageUrl,
      format,
      scale,
    };
  } catch (error) {
    const err = error as Error;
    logger.error({ error: err.message, fileId, nodeId }, 'Failed to get frame snapshot');
    throw error;
  }
}

/**
 * Tool invocation wrapper for MCP server
 */
export async function invokeGetFrameSnapshot(args: unknown): Promise<GetFrameSnapshotOutput> {
  // Basic input validation
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments: expected object with fileId and nodeId');
  }

  const input = args as GetFrameSnapshotInput;

  if (!input.fileId || typeof input.fileId !== 'string') {
    throw new Error('Missing or invalid fileId');
  }

  if (!input.nodeId || typeof input.nodeId !== 'string') {
    throw new Error('Missing or invalid nodeId');
  }

  return getFrameSnapshot(input);
}
