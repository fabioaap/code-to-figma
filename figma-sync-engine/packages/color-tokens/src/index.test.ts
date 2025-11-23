import { describe, it, expect } from 'vitest';
import {
    rgbToHex,
    hexToRgb,
    generateColorName,
    extractColorTokens,
    serializeColorTokens,
    deserializeColorTokens,
    FigmaColor,
    ColorToken
} from './index';

describe('color-tokens - TOK-1', () => {
    describe('rgbToHex', () => {
        it('should convert red to hex', () => {
            const color: FigmaColor = { r: 1, g: 0, b: 0 };
            expect(rgbToHex(color)).toBe('#ff0000');
        });

        it('should convert green to hex', () => {
            const color: FigmaColor = { r: 0, g: 1, b: 0 };
            expect(rgbToHex(color)).toBe('#00ff00');
        });

        it('should convert blue to hex', () => {
            const color: FigmaColor = { r: 0, g: 0, b: 1 };
            expect(rgbToHex(color)).toBe('#0000ff');
        });

        it('should convert white to hex', () => {
            const color: FigmaColor = { r: 1, g: 1, b: 1 };
            expect(rgbToHex(color)).toBe('#ffffff');
        });

        it('should convert black to hex', () => {
            const color: FigmaColor = { r: 0, g: 0, b: 0 };
            expect(rgbToHex(color)).toBe('#000000');
        });

        it('should convert gray to hex', () => {
            const color: FigmaColor = { r: 0.5, g: 0.5, b: 0.5 };
            expect(rgbToHex(color)).toBe('#808080');
        });

        it('should handle decimal values', () => {
            const color: FigmaColor = { r: 0.149, g: 0.388, b: 0.922 };
            // 0.149 * 255 = 37.995 -> 38 -> 0x26
            // 0.388 * 255 = 98.94 -> 99 -> 0x63
            // 0.922 * 255 = 235.11 -> 235 -> 0xeb
            expect(rgbToHex(color)).toBe('#2663eb');
        });

        it('should pad single digit hex values', () => {
            const color: FigmaColor = { r: 0.01, g: 0.02, b: 0.03 };
            // Todos devem ter 2 dígitos
            const hex = rgbToHex(color);
            expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        });
    });

    describe('hexToRgb', () => {
        it('should convert hex red to RGB', () => {
            const result = hexToRgb('#ff0000');
            expect(result).toEqual({ r: 1, g: 0, b: 0 });
        });

        it('should convert hex green to RGB', () => {
            const result = hexToRgb('#00ff00');
            expect(result).toEqual({ r: 0, g: 1, b: 0 });
        });

        it('should convert hex blue to RGB', () => {
            const result = hexToRgb('#0000ff');
            expect(result).toEqual({ r: 0, g: 0, b: 1 });
        });

        it('should handle short format #RGB', () => {
            const result = hexToRgb('#abc');
            // #abc -> #aabbcc -> (aa=170, bb=187, cc=204)
            expect(result?.r).toBeCloseTo(170 / 255, 2);
            expect(result?.g).toBeCloseTo(187 / 255, 2);
            expect(result?.b).toBeCloseTo(204 / 255, 2);
        });

        it('should handle hex without # prefix', () => {
            const result = hexToRgb('ff0000');
            expect(result).toEqual({ r: 1, g: 0, b: 0 });
        });

        it('should return null for invalid hex', () => {
            expect(hexToRgb('invalid')).toBeNull();
            expect(hexToRgb('#zz0000')).toBeNull();
            expect(hexToRgb('#12')).toBeNull();
            expect(hexToRgb('')).toBeNull();
        });

        it('should be reversible with rgbToHex', () => {
            const original = '#2563eb';
            const rgb = hexToRgb(original);
            expect(rgb).not.toBeNull();
            const converted = rgbToHex(rgb!);
            expect(converted).toBe(original);
        });
    });

    describe('generateColorName', () => {
        it('should recognize white', () => {
            expect(generateColorName('#ffffff', 0)).toBe('white');
        });

        it('should recognize black', () => {
            expect(generateColorName('#000000', 0)).toBe('black');
        });

        it('should recognize primary colors', () => {
            expect(generateColorName('#ff0000', 0)).toBe('red');
            expect(generateColorName('#00ff00', 0)).toBe('green');
            expect(generateColorName('#0000ff', 0)).toBe('blue');
        });

        it('should handle case insensitive', () => {
            expect(generateColorName('#FFFFFF', 0)).toBe('white');
            expect(generateColorName('#FF0000', 0)).toBe('red');
        });

        it('should generate generic names for unknown colors', () => {
            expect(generateColorName('#2563eb', 0)).toBe('color-1');
            expect(generateColorName('#123456', 5)).toBe('color-6');
        });

        it('should increment index correctly', () => {
            expect(generateColorName('#aabbcc', 0)).toBe('color-1');
            expect(generateColorName('#ddeeff', 1)).toBe('color-2');
            expect(generateColorName('#112233', 9)).toBe('color-10');
        });
    });

    describe('extractColorTokens', () => {
        it('should extract single color from fills', () => {
            const figmaJson = {
                type: 'FRAME',
                fills: [
                    {
                        type: 'SOLID',
                        color: { r: 1, g: 0, b: 0 }
                    }
                ]
            };

            const result = extractColorTokens(figmaJson);

            expect(Object.keys(result.tokens)).toHaveLength(1);
            expect(result.tokens['red']).toBeDefined();
            expect(result.tokens['red'].value).toBe('#ff0000');
            expect(result.tokens['red'].usage).toBe(1);
        });

        it('should extract multiple different colors', () => {
            const figmaJson = {
                type: 'FRAME',
                children: [
                    {
                        type: 'RECTANGLE',
                        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
                    },
                    {
                        type: 'RECTANGLE',
                        fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }]
                    },
                    {
                        type: 'RECTANGLE',
                        fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }]
                    }
                ]
            };

            const result = extractColorTokens(figmaJson);

            expect(Object.keys(result.tokens)).toHaveLength(3);
            expect(result.tokens['red']).toBeDefined();
            expect(result.tokens['green']).toBeDefined();
            expect(result.tokens['blue']).toBeDefined();
        });

        it('should count usage of repeated colors', () => {
            const figmaJson = {
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
                        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
                    }
                ]
            };

            const result = extractColorTokens(figmaJson);

            expect(Object.keys(result.tokens)).toHaveLength(1);
            expect(result.tokens['red'].usage).toBe(3);
        });

        it('should extract from backgroundColor property', () => {
            const figmaJson = {
                type: 'FRAME',
                backgroundColor: '#ff0000'
            };

            const result = extractColorTokens(figmaJson);

            expect(result.tokens['red']).toBeDefined();
            expect(result.tokens['red'].value).toBe('#ff0000');
        });

        it('should extract from color property (text)', () => {
            const figmaJson = {
                type: 'TEXT',
                color: '#0000ff'
            };

            const result = extractColorTokens(figmaJson);

            expect(result.tokens['blue']).toBeDefined();
            expect(result.tokens['blue'].value).toBe('#0000ff');
        });

        it('should handle nested structures', () => {
            const figmaJson = {
                type: 'FRAME',
                fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
                children: [
                    {
                        type: 'FRAME',
                        fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }],
                        children: [
                            {
                                type: 'TEXT',
                                color: '#ff0000'
                            }
                        ]
                    }
                ]
            };

            const result = extractColorTokens(figmaJson);

            expect(Object.keys(result.tokens)).toHaveLength(3);
            expect(result.tokens['white']).toBeDefined();
            expect(result.tokens['black']).toBeDefined();
            expect(result.tokens['red']).toBeDefined();
        });

        it('should add colorToken reference to fills', () => {
            const figmaJson = {
                type: 'FRAME',
                fills: [
                    {
                        type: 'SOLID',
                        color: { r: 1, g: 0, b: 0 }
                    }
                ]
            };

            const result = extractColorTokens(figmaJson);

            expect(result.figmaJson.fills[0].colorToken).toBe('red');
            expect(result.figmaJson.fills[0].color).toEqual({ r: 1, g: 0, b: 0 });
        });

        it('should add backgroundColorToken reference', () => {
            const figmaJson = {
                type: 'FRAME',
                backgroundColor: '#ffffff'
            };

            const result = extractColorTokens(figmaJson);

            expect(result.figmaJson.backgroundColorToken).toBe('white');
            expect(result.figmaJson.backgroundColor).toBe('#ffffff');
        });

        it('should add colorToken reference for text', () => {
            const figmaJson = {
                type: 'TEXT',
                color: '#000000'
            };

            const result = extractColorTokens(figmaJson);

            expect(result.figmaJson.colorToken).toBe('black');
            expect(result.figmaJson.color).toBe('#000000');
        });

        it('should handle empty JSON', () => {
            const result = extractColorTokens({});
            expect(Object.keys(result.tokens)).toHaveLength(0);
        });

        it('should ignore non-SOLID fills', () => {
            const figmaJson = {
                type: 'FRAME',
                fills: [
                    { type: 'GRADIENT', stops: [] },
                    { type: 'IMAGE', imageRef: 'abc' }
                ]
            };

            const result = extractColorTokens(figmaJson);

            expect(Object.keys(result.tokens)).toHaveLength(0);
        });

        it('should order tokens by usage (most used first)', () => {
            const figmaJson = {
                type: 'FRAME',
                children: [
                    { fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] }, // red x1
                    { fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }] }, // green x1
                    { fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }] }, // green x2
                    { fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }] }  // green x3
                ]
            };

            const result = extractColorTokens(figmaJson);

            expect(result.tokens['green'].usage).toBe(3);
            expect(result.tokens['red'].usage).toBe(1);
        });
    });

    describe('serializeColorTokens', () => {
        it('should serialize tokens to JSON', () => {
            const tokens: Record<string, ColorToken> = {
                'red': { name: 'red', value: '#ff0000', usage: 1 },
                'blue': { name: 'blue', value: '#0000ff', usage: 2 }
            };

            const json = serializeColorTokens(tokens);

            expect(json).toContain('"red"');
            expect(json).toContain('#ff0000');
            expect(json).toContain('#0000ff');
            
            // Deve ser JSON válido
            expect(() => JSON.parse(json)).not.toThrow();
        });

        it('should format with indentation', () => {
            const tokens: Record<string, ColorToken> = {
                'red': { name: 'red', value: '#ff0000', usage: 1 }
            };

            const json = serializeColorTokens(tokens);

            // Verifica que tem indentação (múltiplas linhas)
            expect(json.split('\n').length).toBeGreaterThan(1);
        });

        it('should handle empty tokens', () => {
            const json = serializeColorTokens({});
            expect(json).toBe('{}');
        });
    });

    describe('deserializeColorTokens', () => {
        it('should deserialize JSON to tokens', () => {
            const json = JSON.stringify({
                'red': { name: 'red', value: '#ff0000', usage: 1 }
            });

            const tokens = deserializeColorTokens(json);

            expect(tokens['red']).toBeDefined();
            expect(tokens['red'].value).toBe('#ff0000');
            expect(tokens['red'].usage).toBe(1);
        });

        it('should handle multiple tokens', () => {
            const json = JSON.stringify({
                'red': { name: 'red', value: '#ff0000', usage: 1 },
                'blue': { name: 'blue', value: '#0000ff', usage: 2 }
            });

            const tokens = deserializeColorTokens(json);

            expect(Object.keys(tokens)).toHaveLength(2);
            expect(tokens['red']).toBeDefined();
            expect(tokens['blue']).toBeDefined();
        });

        it('should throw on invalid JSON', () => {
            expect(() => deserializeColorTokens('invalid json')).toThrow();
        });

        it('should be reversible with serializeColorTokens', () => {
            const original: Record<string, ColorToken> = {
                'red': { name: 'red', value: '#ff0000', usage: 1 },
                'blue': { name: 'blue', value: '#0000ff', usage: 2 }
            };

            const json = serializeColorTokens(original);
            const deserialized = deserializeColorTokens(json);

            expect(deserialized).toEqual(original);
        });
    });

    describe('Integration scenarios', () => {
        it('should handle complex component with multiple colors', () => {
            const buttonJson = {
                type: 'FRAME',
                name: 'Button',
                fills: [{ type: 'SOLID', color: { r: 0.149, g: 0.388, b: 0.922 } }], // #2563eb
                children: [
                    {
                        type: 'TEXT',
                        characters: 'Click me',
                        color: '#ffffff'
                    }
                ]
            };

            const result = extractColorTokens(buttonJson);

            expect(Object.keys(result.tokens)).toHaveLength(2);
            expect(result.tokens['white']).toBeDefined();
            expect(result.figmaJson.fills[0].colorToken).toBeDefined();
            expect(result.figmaJson.children[0].colorToken).toBe('white');
        });

        it('should export and reimport tokens', () => {
            const figmaJson = {
                type: 'FRAME',
                fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
            };

            // Extrair
            const extracted = extractColorTokens(figmaJson);
            
            // Serializar
            const serialized = serializeColorTokens(extracted.tokens);
            
            // Deserializar
            const reloaded = deserializeColorTokens(serialized);

            expect(reloaded).toEqual(extracted.tokens);
        });

        it('should handle empty fills array', () => {
            const figmaJson = {
                type: 'FRAME',
                fills: []
            };

            const result = extractColorTokens(figmaJson);
            expect(Object.keys(result.tokens)).toHaveLength(0);
        });

        it('should preserve other node properties', () => {
            const figmaJson = {
                type: 'FRAME',
                name: 'MyFrame',
                width: 100,
                height: 200,
                fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
                customProp: 'test'
            };

            const result = extractColorTokens(figmaJson);

            expect(result.figmaJson.name).toBe('MyFrame');
            expect(result.figmaJson.width).toBe(100);
            expect(result.figmaJson.height).toBe(200);
            expect(result.figmaJson.customProp).toBe('test');
        });
    });
});
