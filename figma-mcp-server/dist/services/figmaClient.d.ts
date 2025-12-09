/**
 * Figma REST API Client
 *
 * Handles communication with Figma API including:
 * - File and node fetching
 * - Image rendering
 * - Retry logic with exponential backoff
 * - Rate limit handling
 */
export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    children?: FigmaNode[];
    [key: string]: unknown;
}
export interface FigmaFileResponse {
    name: string;
    lastModified: string;
    document: FigmaNode;
    components: Record<string, unknown>;
    styles: Record<string, unknown>;
}
export interface FigmaImageResponse {
    err: string | null;
    images: Record<string, string>;
}
export declare class FigmaClient {
    private token;
    constructor(token?: string);
    private retryWithBackoff;
    getFile(fileId: string): Promise<FigmaFileResponse>;
    getNodes(fileId: string, nodeIds: string[]): Promise<Record<string, unknown>>;
    /**
     * Get specific frame nodes with their children
     * Convenience method for getNodes that returns structured response
     */
    getFrameNodes(fileId: string, frameId: string): Promise<Record<string, unknown>>;
    getImages(fileId: string, nodeIds: string[], options?: {
        format?: 'jpg' | 'png' | 'svg';
        scale?: number;
    }): Promise<FigmaImageResponse>;
}
export declare const createFigmaClient: (token?: string) => FigmaClient;
export declare const figmaClient: FigmaClient;
//# sourceMappingURL=figmaClient.d.ts.map