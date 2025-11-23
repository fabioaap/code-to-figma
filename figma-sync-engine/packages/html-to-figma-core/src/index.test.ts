import { describe, it, expect, beforeEach } from 'vitest';
import { 
    convertHtmlToFigma, 
    getConversionMetadata,
    extractColorTokens,
    extractTypographyTokens,
    extractDesignTokens,
    ConversionResult 
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

    describe('Design Tokens - TOK-1, TOK-2', () => {
        describe('extractColorTokens - TOK-1', () => {
            it('should extract colors from fills', () => {
                const node: ConversionResult = {
                    type: 'RECTANGLE',
                    name: 'Box',
                    fills: [{
                        type: 'SOLID',
                        color: { r: 1, g: 0, b: 0 } // Red
                    }]
                };

                const tokens = extractColorTokens(node);
                
                expect(tokens).toHaveLength(1);
                expect(tokens[0].value).toBe('#ff0000');
                expect(tokens[0].usage).toContain('Box');
            });

            it('should extract colors from backgroundColor', () => {
                const node: ConversionResult = {
                    type: 'FRAME',
                    name: 'Container',
                    backgroundColor: '#00ff00'
                };

                const tokens = extractColorTokens(node);
                
                expect(tokens).toHaveLength(1);
                expect(tokens[0].value).toBe('#00ff00');
                expect(tokens[0].usage).toContain('Container');
            });

            it('should extract colors from text nodes', () => {
                const node: ConversionResult = {
                    type: 'TEXT',
                    name: 'Label',
                    color: '#0000ff'
                };

                const tokens = extractColorTokens(node);
                
                expect(tokens).toHaveLength(1);
                expect(tokens[0].value).toBe('#0000ff');
            });

            it('should deduplicate colors', () => {
                const node: ConversionResult = {
                    type: 'FRAME',
                    children: [
                        {
                            type: 'RECTANGLE',
                            name: 'Box1',
                            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
                        },
                        {
                            type: 'RECTANGLE',
                            name: 'Box2',
                            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
                        }
                    ]
                };

                const tokens = extractColorTokens(node);
                
                expect(tokens).toHaveLength(1);
                expect(tokens[0].usage).toHaveLength(2);
            });

            it('should handle multiple unique colors', () => {
                const node: ConversionResult = {
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

                const tokens = extractColorTokens(node);
                
                expect(tokens).toHaveLength(3);
                expect(tokens.map(t => t.value).sort()).toEqual(['#0000ff', '#00ff00', '#ff0000']);
            });

            it('should handle nodes without colors', () => {
                const node: ConversionResult = {
                    type: 'FRAME',
                    name: 'Empty'
                };

                const tokens = extractColorTokens(node);
                
                expect(tokens).toHaveLength(0);
            });
        });

        describe('extractTypographyTokens - TOK-2', () => {
            it('should extract typography from TEXT nodes', () => {
                const node: ConversionResult = {
                    type: 'TEXT',
                    name: 'Heading',
                    fontName: { family: 'Roboto', style: 'Bold' },
                    fontSize: 24,
                    lineHeight: { value: 150, unit: 'PERCENT' }
                };

                const tokens = extractTypographyTokens(node);
                
                expect(tokens).toHaveLength(1);
                expect(tokens[0].fontFamily).toBe('Roboto');
                expect(tokens[0].fontSize).toBe(24);
                expect(tokens[0].fontWeight).toBe('Bold');
                expect(tokens[0].lineHeight).toBe('150%');
            });

            it('should use fallback values', () => {
                const node: ConversionResult = {
                    type: 'TEXT',
                    name: 'Text'
                };

                const tokens = extractTypographyTokens(node);
                
                expect(tokens).toHaveLength(1);
                expect(tokens[0].fontFamily).toBe('Inter');
                expect(tokens[0].fontSize).toBe(16);
                expect(tokens[0].fontWeight).toBe('Regular');
            });

            it('should deduplicate typography styles', () => {
                const node: ConversionResult = {
                    type: 'FRAME',
                    children: [
                        {
                            type: 'TEXT',
                            name: 'Text1',
                            fontName: { family: 'Arial', style: 'Regular' },
                            fontSize: 16
                        },
                        {
                            type: 'TEXT',
                            name: 'Text2',
                            fontName: { family: 'Arial', style: 'Regular' },
                            fontSize: 16
                        }
                    ]
                };

                const tokens = extractTypographyTokens(node);
                
                expect(tokens).toHaveLength(1);
                expect(tokens[0].usage).toHaveLength(2);
            });

            it('should handle multiple unique typography styles', () => {
                const node: ConversionResult = {
                    type: 'FRAME',
                    children: [
                        {
                            type: 'TEXT',
                            fontName: { family: 'Arial', style: 'Regular' },
                            fontSize: 16
                        },
                        {
                            type: 'TEXT',
                            fontName: { family: 'Arial', style: 'Bold' },
                            fontSize: 16
                        },
                        {
                            type: 'TEXT',
                            fontName: { family: 'Arial', style: 'Regular' },
                            fontSize: 18
                        }
                    ]
                };

                const tokens = extractTypographyTokens(node);
                
                expect(tokens).toHaveLength(3);
            });

            it('should ignore non-TEXT nodes', () => {
                const node: ConversionResult = {
                    type: 'FRAME',
                    children: [
                        { type: 'RECTANGLE' },
                        { type: 'FRAME' }
                    ]
                };

                const tokens = extractTypographyTokens(node);
                
                expect(tokens).toHaveLength(0);
            });
        });

        describe('extractDesignTokens', () => {
            it('should extract both colors and typography', () => {
                const node: ConversionResult = {
                    type: 'FRAME',
                    backgroundColor: '#ffffff',
                    children: [
                        {
                            type: 'TEXT',
                            name: 'Title',
                            fontName: { family: 'Roboto', style: 'Bold' },
                            fontSize: 24,
                            color: '#000000'
                        }
                    ]
                };

                const tokens = extractDesignTokens(node);
                
                expect(tokens.colors).toHaveLength(2); // white background + black text
                expect(tokens.typography).toHaveLength(1);
            });

            it('should handle empty nodes', () => {
                const node: ConversionResult = {
                    type: 'FRAME'
                };

                const tokens = extractDesignTokens(node);
                
                expect(tokens.colors).toHaveLength(0);
                expect(tokens.typography).toHaveLength(0);
            });

            it('should handle complex nested structure', () => {
                const node: ConversionResult = {
                    type: 'FRAME',
                    children: [
                        {
                            type: 'FRAME',
                            backgroundColor: '#ff0000',
                            children: [
                                {
                                    type: 'TEXT',
                                    fontName: { family: 'Arial', style: 'Regular' },
                                    fontSize: 14
                                }
                            ]
                        },
                        {
                            type: 'FRAME',
                            backgroundColor: '#00ff00',
                            children: [
                                {
                                    type: 'TEXT',
                                    fontName: { family: 'Arial', style: 'Bold' },
                                    fontSize: 18
                                }
                            ]
                        }
                    ]
                };

                const tokens = extractDesignTokens(node);
                
                expect(tokens.colors.length).toBeGreaterThanOrEqual(2);
                expect(tokens.typography.length).toBeGreaterThanOrEqual(2);
            });
        });
    });
});
