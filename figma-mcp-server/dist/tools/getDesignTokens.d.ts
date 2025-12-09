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
import { type TokenSet } from '../schemas/tokenSet.js';
export interface GetDesignTokensInput {
    fileId: string;
    frameId: string;
    writeTo?: string;
}
export interface GetDesignTokensOutput extends TokenSet {
}
/**
 * Main tool implementation: Extract design tokens from Figma frame
 *
 * @param input - Tool parameters matching GetDesignTokensInput schema
 * @returns TokenSet ready for consumption by design-system
 * @throws Error on API failures, validation errors, or file write issues
 */
export declare function getDesignTokens(input: GetDesignTokensInput): Promise<GetDesignTokensOutput>;
/**
 * Tool invocation wrapper for MCP server
 *
 * Validates input and returns MCP-compatible response
 */
export declare function invokeGetDesignTokens(args: unknown): Promise<GetDesignTokensOutput>;
//# sourceMappingURL=getDesignTokens.d.ts.map