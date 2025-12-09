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
// ============================================================================
// Core Schemas
// ============================================================================
/**
 * Typography token structure matching contract requirements
 */
export const typographyTokenSchema = z.object({
    fontFamily: z.string(),
    fontSize: z.number().positive(),
    fontWeight: z.number().int().min(100).max(900),
    lineHeight: z.union([
        z.number().positive(),
        z.string().regex(/^[0-9]+%$/, 'lineHeight must be a percentage string like "150%"'),
    ]).optional(),
});
/**
 * Metadata tracking the source and version of exported tokens
 */
export const tokenMetadataSchema = z.object({
    sourceFrameId: z.string(),
    sourceFileId: z.string(),
    exportedAt: z.string().datetime(),
    version: z.string(),
});
/**
 * Complete TokenSet schema matching the YAML contract
 */
export const tokenSetSchema = z.object({
    metadata: tokenMetadataSchema,
    colors: z.record(z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Color must be 6-digit hex')),
    typography: z.record(typographyTokenSchema).optional(),
    spacing: z.record(z.string().regex(/^[0-9]+px$/, 'Spacing must be in px format')).optional(),
    shadows: z.record(z.string()).optional(),
});
// ============================================================================
// Layer-to-Token Mappers
// ============================================================================
/**
 * Convert Figma RGBA (0-1 range) to hex color string
 * @example rgbaToHex({ r: 0, g: 0.4, b: 0.8, a: 1 }) => "#0066CC"
 */
export function rgbaToHex(color) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
/**
 * Extract color tokens from Figma layers
 *
 * Looks for layers with naming pattern: "color.<category>.<name>"
 * Example: "color.rede.primary" => { "color.rede.primary": "#0066CC" }
 *
 * @param layers - Flattened array of Figma nodes
 * @returns Record of color token names to hex values
 */
export function extractColorTokens(layers) {
    const colors = {};
    for (const layer of layers) {
        // Match color token naming pattern
        if (layer.name.startsWith('color.') && layer.fills && layer.fills.length > 0) {
            const fill = layer.fills[0];
            if (fill.type === 'SOLID' && fill.color) {
                colors[layer.name] = rgbaToHex(fill.color);
            }
        }
    }
    return colors;
}
/**
 * Extract typography tokens from text layers
 *
 * Looks for TEXT nodes with naming pattern: "typography.<category>.<name>"
 * Example: "typography.heading.h1" => { fontFamily: "Inter", fontSize: 32, ... }
 *
 * @param layers - Flattened array of Figma nodes
 * @returns Record of typography token names to style objects
 */
export function extractTypographyTokens(layers) {
    const typography = {};
    for (const layer of layers) {
        if (layer.name.startsWith('typography.') && layer.type === 'TEXT' && layer.style) {
            const { fontFamily, fontSize, fontWeight, lineHeightPx, lineHeightPercent } = layer.style;
            if (fontFamily && fontSize && fontWeight) {
                const token = {
                    fontFamily,
                    fontSize,
                    fontWeight,
                };
                // Prefer percentage lineHeight if available, otherwise use px converted to ratio
                if (lineHeightPercent) {
                    token.lineHeight = `${Math.round(lineHeightPercent)}%`;
                }
                else if (lineHeightPx && fontSize) {
                    token.lineHeight = lineHeightPx / fontSize;
                }
                typography[layer.name] = token;
            }
        }
    }
    return typography;
}
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
export function extractSpacingTokens(layers) {
    const spacing = {};
    for (const layer of layers) {
        if (layer.name.startsWith('spacing.') && layer.absoluteBoundingBox) {
            const width = Math.round(layer.absoluteBoundingBox.width);
            spacing[layer.name] = `${width}px`;
        }
    }
    return spacing;
}
/**
 * Flatten nested Figma node tree into single-level array
 *
 * Recursively traverses children and collects all nodes
 *
 * @param node - Root Figma node
 * @returns Flattened array of all descendant nodes
 */
export function flattenLayers(node) {
    const result = [node];
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            result.push(...flattenLayers(child));
        }
    }
    return result;
}
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
export function mapFigmaFrameToTokenSet(frameNode, metadata) {
    const flatLayers = flattenLayers(frameNode);
    const tokenSet = {
        metadata,
        colors: extractColorTokens(flatLayers),
        typography: extractTypographyTokens(flatLayers),
        spacing: extractSpacingTokens(flatLayers),
    };
    // Validate against schema before returning
    return tokenSetSchema.parse(tokenSet);
}
//# sourceMappingURL=tokenSet.js.map