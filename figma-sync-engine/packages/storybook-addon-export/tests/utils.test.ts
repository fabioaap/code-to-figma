import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    copyToClipboard, 
    downloadJson, 
    formatJsonSize 
} from '../src/utils';
import type { FigmaExportData } from '../src/shared';

describe('utils', () => {
    describe('formatJsonSize', () => {
        it('formata tamanho em bytes corretamente', () => {
            const smallData: FigmaExportData = {
                version: 1,
                root: { type: 'FRAME', name: 'Test' }
            };
            
            const size = formatJsonSize(smallData);
            expect(size).toMatch(/\d+(\.\d+)?\s*(B|KB|MB)/);
        });

        it('formata tamanho em KB para dados maiores', () => {
            const largeData: FigmaExportData = {
                version: 1,
                root: {
                    type: 'FRAME',
                    name: 'Test',
                    children: Array(100).fill({
                        type: 'TEXT',
                        name: 'Item',
                        characters: 'Lorem ipsum dolor sit amet'
                    })
                }
            };
            
            const size = formatJsonSize(largeData);
            expect(size).toContain('KB');
        });
    });

    describe('copyToClipboard', () => {
        beforeEach(() => {
            // Mock do clipboard API
            Object.assign(navigator, {
                clipboard: {
                    writeText: vi.fn().mockResolvedValue(undefined)
                }
            });
        });

        it('copia JSON para clipboard', async () => {
            const data: FigmaExportData = {
                version: 1,
                root: { type: 'FRAME', name: 'Test' }
            };

            await copyToClipboard(data);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('"version": 1')
            );
        });

        it('lança erro se clipboard não estiver disponível', async () => {
            Object.assign(navigator, {
                clipboard: undefined
            });

            const data: FigmaExportData = {
                version: 1,
                root: { type: 'FRAME', name: 'Test' }
            };

            await expect(copyToClipboard(data)).rejects.toThrow(
                'Clipboard API não disponível'
            );
        });
    });

    describe('downloadJson', () => {
        beforeEach(() => {
            // Mock DOM methods
            global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
            global.URL.revokeObjectURL = vi.fn();
            document.body.appendChild = vi.fn();
            document.body.removeChild = vi.fn();
        });

        it('cria download com nome sanitizado', () => {
            const data: FigmaExportData = {
                version: 1,
                root: { type: 'FRAME', name: 'Test' }
            };

            const createElementSpy = vi.spyOn(document, 'createElement');
            
            downloadJson(data, 'my-story--variant');

            expect(createElementSpy).toHaveBeenCalledWith('a');
            const calls = createElementSpy.mock.results;
            if (calls.length > 0) {
                const link = calls[0].value as HTMLAnchorElement;
                expect(link.download).toBe('my-story--variant.figma.json');
            }
        });
    });
});
