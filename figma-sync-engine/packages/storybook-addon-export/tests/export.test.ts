import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { 
    captureStoryHtml, 
    convertToFigmaJson, 
    applyAutoLayoutToJson,
    executeExportPipeline
} from '../src/export';

describe('export', () => {
    beforeEach(() => {
        // Setup DOM environment
        const dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div id="storybook-root">
                        <div class="button" style="display: flex; gap: 8px; padding: 12px;">
                            <span>Click me</span>
                        </div>
                    </div>
                </body>
            </html>
        `);
        
        global.document = dom.window.document as any;
        global.window = dom.window as any;
        global.DOMParser = dom.window.DOMParser as any;
        global.Node = dom.window.Node as any;
    });

    describe('captureStoryHtml', () => {
        it('captura HTML do elemento #storybook-root', () => {
            const html = captureStoryHtml();
            
            expect(html).toContain('class="button"');
            expect(html).toContain('Click me');
        });

        it('lança erro se #storybook-root não existir', () => {
            const root = document.querySelector('#storybook-root');
            if (root) {
                root.remove();
            }

            expect(() => captureStoryHtml()).toThrow(
                'Elemento raiz da história não encontrado'
            );
        });
    });

    describe('convertToFigmaJson', () => {
        it('converte HTML simples para estrutura Figma', () => {
            const html = '<div class="container">Hello</div>';
            const result = convertToFigmaJson(html, 'test-story');

            expect(result.version).toBe(1);
            expect(result.root.type).toBe('FRAME');
            expect(result.metadata?.storyId).toBe('test-story');
        });

        it('inclui metadata com timestamp', () => {
            const html = '<div>Test</div>';
            const result = convertToFigmaJson(html, 'story-1');

            expect(result.metadata).toBeDefined();
            expect(result.metadata?.timestamp).toBeDefined();
            expect(result.metadata?.storyId).toBe('story-1');
        });

        it('lança erro se HTML estiver vazio', () => {
            const html = '';
            
            expect(() => convertToFigmaJson(html, 'test')).toThrow();
        });

        it('converte elementos aninhados corretamente', () => {
            const html = `
                <div class="parent">
                    <div class="child1">Text 1</div>
                    <div class="child2">Text 2</div>
                </div>
            `;
            
            const result = convertToFigmaJson(html, 'nested-test');
            
            expect(result.root.children).toBeDefined();
            expect(result.root.children?.length).toBeGreaterThan(0);
        });
    });

    describe('applyAutoLayoutToJson', () => {
        it('preserva a estrutura base do JSON', () => {
            const input = {
                version: 1,
                root: {
                    type: 'FRAME',
                    name: 'Test',
                    layoutMode: 'HORIZONTAL' as const,
                    itemSpacing: 8
                }
            };

            const result = applyAutoLayoutToJson(input);

            expect(result.version).toBe(1);
            expect(result.root.type).toBe('FRAME');
            expect(result.root.layoutMode).toBe('HORIZONTAL');
        });

        it('aplica auto layout a nodes com layoutMode', () => {
            const input = {
                version: 1,
                root: {
                    type: 'FRAME',
                    name: 'Container',
                    layoutMode: 'VERTICAL' as const,
                    itemSpacing: 12,
                    paddingTop: 16,
                    paddingRight: 16,
                    paddingBottom: 16,
                    paddingLeft: 16
                }
            };

            const result = applyAutoLayoutToJson(input);

            expect(result.root.layoutMode).toBeDefined();
            expect(result.root.itemSpacing).toBeDefined();
        });

        it('processa children recursivamente', () => {
            const input = {
                version: 1,
                root: {
                    type: 'FRAME',
                    name: 'Parent',
                    layoutMode: 'HORIZONTAL' as const,
                    children: [
                        {
                            type: 'FRAME',
                            name: 'Child',
                            layoutMode: 'VERTICAL' as const,
                            itemSpacing: 4
                        }
                    ]
                }
            };

            const result = applyAutoLayoutToJson(input);

            expect(result.root.children).toBeDefined();
            expect(result.root.children?.[0].layoutMode).toBe('VERTICAL');
        });
    });

    describe('executeExportPipeline', () => {
        it('executa pipeline completo com sucesso', async () => {
            const result = await executeExportPipeline('test-story');

            expect(result).toBeDefined();
            expect(result.version).toBe(1);
            expect(result.root).toBeDefined();
            expect(result.metadata?.storyId).toBe('test-story');
        });

        it('captura e converte HTML do DOM atual', async () => {
            const result = await executeExportPipeline('button-story');

            expect(result.root.type).toBe('FRAME');
            expect(result.metadata?.htmlSource).toBeDefined();
        });
    });
});
