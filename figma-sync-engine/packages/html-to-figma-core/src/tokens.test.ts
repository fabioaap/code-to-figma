import { describe, it, expect } from 'vitest';
import { extractColorTokens, rgbToHex, type FigmaNode, type RGB } from './tokens';

describe('tokens - TOK-1: Color extraction', () => {
    describe('rgbToHex', () => {
        it('should convert RGB (0-1) to HEX', () => {
            expect(rgbToHex({ r: 1, g: 0, b: 0 })).toBe('#FF0000');
            expect(rgbToHex({ r: 0, g: 1, b: 0 })).toBe('#00FF00');
            expect(rgbToHex({ r: 0, g: 0, b: 1 })).toBe('#0000FF');
        });

        it('should handle intermediate values', () => {
            expect(rgbToHex({ r: 0.5, g: 0.5, b: 0.5 })).toBe('#808080');
            expect(rgbToHex({ r: 1, g: 1, b: 1 })).toBe('#FFFFFF');
            expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
        });

        it('should round values correctly', () => {
            expect(rgbToHex({ r: 0.996, g: 0.004, b: 0.502 })).toBe('#FE0180');
        });
    });

    describe('extractColorTokens', () => {
        it('should extract colors from fills', () => {
            const tree: FigmaNode = {
                type: 'FRAME',
                fills: [
                    { type: 'SOLID', color: { r: 1, g: 0, b: 0 } }
                ]
            };

            const tokens = extractColorTokens(tree);

            expect(tokens).toHaveLength(1);
            expect(tokens[0].value).toBe('#FF0000');
            expect(tokens[0].usageCount).toBe(1);
        });

        it('should extract colors from strokes', () => {
            const tree: FigmaNode = {
                type: 'RECTANGLE',
                strokes: [
                    { type: 'SOLID', color: { r: 0, g: 1, b: 0 } }
                ]
            };

            const tokens = extractColorTokens(tree);

            expect(tokens).toHaveLength(1);
            expect(tokens[0].value).toBe('#00FF00');
        });

        it('should count duplicate colors', () => {
            const tree: FigmaNode = {
                type: 'FRAME',
                children: [
                    {
                        type: 'RECTANGLE',
                        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
                    },
                    {
                        type: 'RECTANGLE',
                        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
                    },
                    {
                        type: 'RECTANGLE',
                        fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }]
                    }
                ]
            };

            const tokens = extractColorTokens(tree);

            expect(tokens).toHaveLength(2);
            expect(tokens[0].value).toBe('#FF0000');
            expect(tokens[0].usageCount).toBe(2);
            expect(tokens[1].value).toBe('#0000FF');
            expect(tokens[1].usageCount).toBe(1);
        });

        it('should sort by usage count (most used first)', () => {
            const tree: FigmaNode = {
                type: 'FRAME',
                children: [
                    { type: 'RECT', fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] },
                    { type: 'RECT', fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }] },
                    { type: 'RECT', fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }] },
                    { type: 'RECT', fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }] }
                ]
            };

            const tokens = extractColorTokens(tree);

            expect(tokens[0].value).toBe('#00FF00');
            expect(tokens[0].usageCount).toBe(3);
            expect(tokens[1].value).toBe('#FF0000');
            expect(tokens[1].usageCount).toBe(1);
        });

        it('should handle nodes without fills or strokes', () => {
            const tree: FigmaNode = {
                type: 'FRAME',
                children: [
                    { type: 'TEXT' }
                ]
            };

            const tokens = extractColorTokens(tree);

            expect(tokens).toHaveLength(0);
        });

        it('should handle deeply nested structures', () => {
            const tree: FigmaNode = {
                type: 'FRAME',
                children: [
                    {
                        type: 'FRAME',
                        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
                        children: [
                            {
                                type: 'FRAME',
                                fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }],
                                children: [
                                    {
                                        type: 'RECT',
                                        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const tokens = extractColorTokens(tree);

            expect(tokens).toHaveLength(2);
            expect(tokens[0].value).toBe('#FFFFFF');
            expect(tokens[0].usageCount).toBe(2);
            expect(tokens[1].value).toBe('#000000');
            expect(tokens[1].usageCount).toBe(1);
        });

        it('should ignore non-SOLID fills', () => {
            const tree: FigmaNode = {
                type: 'FRAME',
                fills: [
                    { type: 'GRADIENT' },
                    { type: 'IMAGE' }
                ]
            };

            const tokens = extractColorTokens(tree);

            expect(tokens).toHaveLength(0);
        });

        it('should generate unique names for colors', () => {
            const tree: FigmaNode = {
                type: 'FRAME',
                children: [
                    { type: 'RECT', fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] },
                    { type: 'RECT', fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }] },
                    { type: 'RECT', fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }] }
                ]
            };

            const tokens = extractColorTokens(tree);

            const names = tokens.map(t => t.name);
            const uniqueNames = new Set(names);

            expect(names.length).toBe(uniqueNames.size);
        });
    });
});
