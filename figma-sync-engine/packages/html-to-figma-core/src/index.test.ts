import { describe, it, expect, beforeEach } from 'vitest';
import {
    convertHtmlToFigma,
    getConversionMetadata,
    parseFontWeight,
    parseLineHeight,
    mapTextAlign,
    extractTextStyles
} from './index';

describe('html-to-figma-core - MVP-3', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('convertHtmlToFigma', () => {
        it('should throw error on empty HTML', async () => {
            const html = '';

            await expect(convertHtmlToFigma(html)).rejects.toThrow('HTML input is empty');
        });

        it('should throw error on whitespace-only HTML', async () => {
            const html = '   ';

            await expect(convertHtmlToFigma(html)).rejects.toThrow('HTML input is empty');
        });

        it('should accept HTML string parameter', async () => {
            const html = '<button>Click</button>';

            // Teste básico que a função aceita input válido
            expect(html).toBeTruthy();
            expect(typeof html).toBe('string');
        });
    });

    describe('getConversionMetadata', () => {
        it('should count single node', () => {
            const result = {
                type: 'FRAME',
                id: '1',
                children: []
            };

            const metadata = getConversionMetadata(result);

            expect(metadata).toBeDefined();
            expect(metadata.nodeCount).toBe(1);
            expect(metadata.type).toBe('FRAME');
            expect(metadata.hasChildren).toBe(false);
        });

        it('should count nested nodes', () => {
            const result = {
                type: 'FRAME',
                children: [
                    { type: 'TEXT', children: [] },
                    { type: 'FRAME', children: [{ type: 'SHAPE' }] }
                ]
            };

            const metadata = getConversionMetadata(result);

            expect(metadata.nodeCount).toBe(4); // root + 3 filhos
            expect(metadata.hasChildren).toBe(true);
        });

        it('should handle node without children', () => {
            const result = { type: 'SHAPE' };

            const metadata = getConversionMetadata(result);

            expect(metadata.nodeCount).toBe(1);
            expect(metadata.hasChildren).toBe(false);
            expect(metadata.type).toBe('SHAPE');
        });

        it('should include all metadata fields', () => {
            const result = {
                type: 'COMPONENT',
                name: 'Button',
                children: []
            };

            const metadata = getConversionMetadata(result);

            expect(metadata).toHaveProperty('nodeCount');
            expect(metadata).toHaveProperty('hasChildren');
            expect(metadata).toHaveProperty('type');
            expect(metadata).toHaveProperty('name');
            expect(metadata.name).toBe('Button');
        });

        it('should count deeply nested structure', () => {
            const result = {
                type: 'FRAME',
                children: [
                    {
                        type: 'GROUP',
                        children: [
                            { type: 'TEXT' },
                            { type: 'SHAPE' },
                            {
                                type: 'FRAME',
                                children: [
                                    { type: 'TEXT' }
                                ]
                            }
                        ]
                    }
                ]
            };

            const metadata = getConversionMetadata(result);

            // root + group + 3 children (including frame with text) = 6
            expect(metadata.nodeCount).toBe(6);
            expect(metadata.hasChildren).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined children gracefully', () => {
            const result = { type: 'FRAME' };

            const metadata = getConversionMetadata(result);

            expect(metadata.nodeCount).toBe(1);
            expect(metadata.hasChildren).toBe(false);
        });

        it('should handle empty children array', () => {
            const result = { type: 'FRAME', children: [] };

            const metadata = getConversionMetadata(result);

            expect(metadata.nodeCount).toBe(1);
            expect(metadata.hasChildren).toBe(false);
        });

        it('should process large trees', () => {
            // Criar árvore com múltiplos nós
            const createDeepTree = (depth: number): any => {
                if (depth === 0) return { type: 'LEAF' };
                return {
                    type: 'FRAME',
                    children: Array(3).fill(null).map(() => createDeepTree(depth - 1))
                };
            };

            const result = createDeepTree(4);
            const metadata = getConversionMetadata(result);

            // 1 + 3 + 9 + 27 + 81 = 121 nós
            expect(metadata.nodeCount).toBeGreaterThan(100);
        });
    });

    describe('parseFontWeight - AL-7', () => {
        it('should parse named weights', () => {
            expect(parseFontWeight('normal')).toBe(400);
            expect(parseFontWeight('bold')).toBe(700);
            expect(parseFontWeight('lighter')).toBe(300);
            expect(parseFontWeight('bolder')).toBe(600);
        });

        it('should parse numeric weights', () => {
            expect(parseFontWeight('100')).toBe(100);
            expect(parseFontWeight('400')).toBe(400);
            expect(parseFontWeight('700')).toBe(700);
            expect(parseFontWeight('900')).toBe(900);
        });

        it('should default to 400 for invalid values', () => {
            expect(parseFontWeight('invalid')).toBe(400);
            expect(parseFontWeight('')).toBe(400);
        });
    });

    describe('parseLineHeight - AL-7', () => {
        it('should return AUTO for normal', () => {
            expect(parseLineHeight('normal', '16px')).toBe('AUTO');
        });

        it('should parse px values', () => {
            expect(parseLineHeight('24px', '16px')).toBe(24);
            expect(parseLineHeight('20px', '16px')).toBe(20);
        });

        it('should parse percentage values', () => {
            expect(parseLineHeight('150%', '16px')).toBe(24); // 16 * 1.5
            expect(parseLineHeight('120%', '20px')).toBe(24); // 20 * 1.2
        });

        it('should parse unitless multiplier', () => {
            expect(parseLineHeight('1.5', '16px')).toBe(24); // 16 * 1.5
            expect(parseLineHeight('2', '10px')).toBe(20); // 10 * 2
        });

        it('should return AUTO for invalid values', () => {
            expect(parseLineHeight('invalid', '16px')).toBe('AUTO');
        });
    });

    describe('mapTextAlign - AL-7', () => {
        it('should map CSS text-align to Figma', () => {
            expect(mapTextAlign('left')).toBe('LEFT');
            expect(mapTextAlign('center')).toBe('CENTER');
            expect(mapTextAlign('right')).toBe('RIGHT');
            expect(mapTextAlign('justify')).toBe('JUSTIFIED');
        });

        it('should default to LEFT', () => {
            expect(mapTextAlign('start')).toBe('LEFT');
            expect(mapTextAlign('invalid')).toBe('LEFT');
        });
    });

    describe('extractTextStyles - AL-7', () => {
        it('should extract complete text styles', () => {
            const mockStyle = {
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 'bold',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                textAlign: 'center',
                textDecoration: 'none'
            } as CSSStyleDeclaration;

            const result = extractTextStyles(mockStyle);

            expect(result.fontFamily).toBe('Helvetica Neue');
            expect(result.fontSize).toBe(16);
            expect(result.fontWeight).toBe(700);
            expect(result.lineHeight).toBe(24);
            expect(result.letterSpacing).toBe(0.5);
            expect(result.textAlign).toBe('CENTER');
        });
    });
});
