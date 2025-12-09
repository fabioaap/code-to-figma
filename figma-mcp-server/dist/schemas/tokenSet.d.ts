/**
 * T012 [P] [US1] TokenSet Schema + Layer-to-Token Mappers
 *
 * Defines Zod schemas matching the TokenSet contract from
 * specs/001-figma-mcp-server/contracts/figma-mcp-tools.yaml
 *
 * Includes mapper utilities to convert Figma API layer responses
 * into normalized token structures.
 */
import { z } from 'zod';
/**
 * Typography token structure matching contract requirements
 */
export declare const typographyTokenSchema: z.ZodObject<{
    fontFamily: z.ZodString;
    fontSize: z.ZodNumber;
    fontWeight: z.ZodNumber;
    lineHeight: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
}, "strip", z.ZodTypeAny, {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight?: string | number | undefined;
}, {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight?: string | number | undefined;
}>;
export type TypographyToken = z.infer<typeof typographyTokenSchema>;
/**
 * Metadata tracking the source and version of exported tokens
 */
export declare const tokenMetadataSchema: z.ZodObject<{
    sourceFrameId: z.ZodString;
    sourceFileId: z.ZodString;
    exportedAt: z.ZodString;
    version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sourceFrameId: string;
    sourceFileId: string;
    exportedAt: string;
    version: string;
}, {
    sourceFrameId: string;
    sourceFileId: string;
    exportedAt: string;
    version: string;
}>;
export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;
/**
 * Complete TokenSet schema matching the YAML contract
 */
export declare const tokenSetSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        sourceFrameId: z.ZodString;
        sourceFileId: z.ZodString;
        exportedAt: z.ZodString;
        version: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sourceFrameId: string;
        sourceFileId: string;
        exportedAt: string;
        version: string;
    }, {
        sourceFrameId: string;
        sourceFileId: string;
        exportedAt: string;
        version: string;
    }>;
    colors: z.ZodRecord<z.ZodString, z.ZodString>;
    typography: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        fontFamily: z.ZodString;
        fontSize: z.ZodNumber;
        fontWeight: z.ZodNumber;
        lineHeight: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    }, "strip", z.ZodTypeAny, {
        fontFamily: string;
        fontSize: number;
        fontWeight: number;
        lineHeight?: string | number | undefined;
    }, {
        fontFamily: string;
        fontSize: number;
        fontWeight: number;
        lineHeight?: string | number | undefined;
    }>>>;
    spacing: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    shadows: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    metadata: {
        sourceFrameId: string;
        sourceFileId: string;
        exportedAt: string;
        version: string;
    };
    colors: Record<string, string>;
    typography?: Record<string, {
        fontFamily: string;
        fontSize: number;
        fontWeight: number;
        lineHeight?: string | number | undefined;
    }> | undefined;
    spacing?: Record<string, string> | undefined;
    shadows?: Record<string, string> | undefined;
}, {
    metadata: {
        sourceFrameId: string;
        sourceFileId: string;
        exportedAt: string;
        version: string;
    };
    colors: Record<string, string>;
    typography?: Record<string, {
        fontFamily: string;
        fontSize: number;
        fontWeight: number;
        lineHeight?: string | number | undefined;
    }> | undefined;
    spacing?: Record<string, string> | undefined;
    shadows?: Record<string, string> | undefined;
}>;
export type TokenSet = z.infer<typeof tokenSetSchema>;
/**
 * Figma RGBA color structure (0-1 range)
 */
export interface FigmaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}
/**
 * Figma paint/fill structure
 */
export interface FigmaPaint {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
    color?: FigmaColor;
    opacity?: number;
}
/**
 * Figma text style structure
 */
export interface FigmaTextStyle {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
    lineHeightPercent?: number;
    letterSpacing?: number;
}
/**
 * Figma node/layer structure (simplified)
 */
export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    fills?: FigmaPaint[];
    strokes?: FigmaPaint[];
    style?: FigmaTextStyle;
    absoluteBoundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    children?: FigmaNode[];
}
/**
 * Convert Figma RGBA (0-1 range) to hex color string
 * @example rgbaToHex({ r: 0, g: 0.4, b: 0.8, a: 1 }) => "#0066CC"
 */
export declare function rgbaToHex(color: FigmaColor): string;
/**
 * Extract color tokens from Figma layers
 *
 * Looks for layers with naming pattern: "color.<category>.<name>"
 * Example: "color.rede.primary" => { "color.rede.primary": "#0066CC" }
 *
 * @param layers - Flattened array of Figma nodes
 * @returns Record of color token names to hex values
 */
export declare function extractColorTokens(layers: FigmaNode[]): Record<string, string>;
/**
 * Extract typography tokens from text layers
 *
 * Looks for TEXT nodes with naming pattern: "typography.<category>.<name>"
 * Example: "typography.heading.h1" => { fontFamily: "Inter", fontSize: 32, ... }
 *
 * @param layers - Flattened array of Figma nodes
 * @returns Record of typography token names to style objects
 */
export declare function extractTypographyTokens(layers: FigmaNode[]): Record<string, TypographyToken>;
/**
 * Extract spacing tokens from frame dimensions
 *
 * Looks for FRAME nodes with naming pattern: "spacing.<name>"
 * Uses the frame width as the spacing value
 * Example: "spacing.medium" with width 16px => { "spacing.medium": "16px" }
 *
 * @param layers - Flattened array of Figma nodes
 * @returns Record of spacing token names to px values
 */
export declare function extractSpacingTokens(layers: FigmaNode[]): Record<string, string>;
/**
 * Flatten nested Figma node tree into single-level array
 *
 * Recursively traverses children and collects all nodes
 *
 * @param node - Root Figma node
 * @returns Flattened array of all descendant nodes
 */
export declare function flattenLayers(node: FigmaNode): FigmaNode[];
/**
 * Main mapper function: Convert Figma frame response to TokenSet
 *
 * Orchestrates all extraction steps and validates output against schema
 *
 * @param frameNode - Root frame node from Figma API
 * @param metadata - Source tracking metadata
 * @returns Validated TokenSet ready for export
 * @throws {z.ZodError} if the generated TokenSet doesn't match schema
 */
export declare function mapFigmaFrameToTokenSet(frameNode: FigmaNode, metadata: TokenMetadata): TokenSet;
//# sourceMappingURL=tokenSet.d.ts.map