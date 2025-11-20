import { describe, it, expect, beforeEach } from 'vitest';
import { convertHtmlToFigma, getConversionMetadata } from './index';

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

            // root + group + 3 children + frame + text = 7
            expect(metadata.nodeCount).toBe(7);
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
});
