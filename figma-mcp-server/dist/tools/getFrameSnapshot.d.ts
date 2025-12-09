/**
 * US2 get_frame_snapshot Tool Implementation
 *
 * MCP tool that:
 * 1. Requests image generation for a specific node from Figma API
 * 2. Returns the image URL for the requested node
 */
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
export declare function getFrameSnapshot(input: GetFrameSnapshotInput): Promise<GetFrameSnapshotOutput>;
/**
 * Tool invocation wrapper for MCP server
 */
export declare function invokeGetFrameSnapshot(args: unknown): Promise<GetFrameSnapshotOutput>;
//# sourceMappingURL=getFrameSnapshot.d.ts.map