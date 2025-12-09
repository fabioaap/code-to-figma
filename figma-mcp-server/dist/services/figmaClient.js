/**
 * Figma REST API Client
 *
 * Handles communication with Figma API including:
 * - File and node fetching
 * - Image rendering
 * - Retry logic with exponential backoff
 * - Rate limit handling
 */
import { request } from 'undici';
import { getConfig } from '../config.js';
const FIGMA_API_BASE = 'https://api.figma.com/v1';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
export class FigmaClient {
    token;
    constructor(token) {
        const config = getConfig();
        this.token = token || config.FIGMA_PERSONAL_TOKEN;
    }
    async retryWithBackoff(fn, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
        try {
            return await fn();
        }
        catch (error) {
            const err = error;
            if (retries === 0 || err.statusCode === 401 || err.statusCode === 403) {
                throw error;
            }
            // Retry on rate limit or server errors
            if (err.statusCode === 429 || (err.statusCode && err.statusCode >= 500)) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.retryWithBackoff(fn, retries - 1, delay * 2);
            }
            throw error;
        }
    }
    async getFile(fileId) {
        return this.retryWithBackoff(async () => {
            const response = await request(`${FIGMA_API_BASE}/files/${fileId}`, {
                headers: {
                    'X-Figma-Token': this.token,
                },
            });
            if (response.statusCode !== 200) {
                throw new Error(`Figma API error: ${response.statusCode}`);
            }
            return (await response.body.json());
        });
    }
    async getNodes(fileId, nodeIds) {
        const ids = nodeIds.join(',');
        return this.retryWithBackoff(async () => {
            const response = await request(`${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${encodeURIComponent(ids)}`, {
                headers: {
                    'X-Figma-Token': this.token,
                },
            });
            if (response.statusCode !== 200) {
                throw new Error(`Figma API error: ${response.statusCode}`);
            }
            return (await response.body.json());
        });
    }
    /**
     * Get specific frame nodes with their children
     * Convenience method for getNodes that returns structured response
     */
    async getFrameNodes(fileId, frameId) {
        return this.getNodes(fileId, [frameId]);
    }
    async getImages(fileId, nodeIds, options = {}) {
        const ids = nodeIds.join(',');
        const format = options.format || 'png';
        const scale = options.scale || 2;
        return this.retryWithBackoff(async () => {
            const response = await request(`${FIGMA_API_BASE}/images/${fileId}?ids=${encodeURIComponent(ids)}&format=${format}&scale=${scale}`, {
                headers: {
                    'X-Figma-Token': this.token,
                },
            });
            if (response.statusCode !== 200) {
                throw new Error(`Figma API error: ${response.statusCode}`);
            }
            return (await response.body.json());
        });
    }
}
export const createFigmaClient = (token) => new FigmaClient(token);
// Default singleton instance
export const figmaClient = new FigmaClient();
//# sourceMappingURL=figmaClient.js.map