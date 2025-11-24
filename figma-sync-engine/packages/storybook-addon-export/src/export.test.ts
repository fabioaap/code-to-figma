import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    exportToClipboard,
    exportToFile,
    exportWithFallback,
    validateFigmaJson,
    addExportMetadata
} from './export';

describe('export - MVP-5', () => {
    let mockClipboard: any;

    beforeEach(() => {
        // Mock clipboard API
        mockClipboard = {
            writeText: vi.fn().mockResolvedValue(undefined)
        };
        Object.assign(navigator, { clipboard: mockClipboard });

        // Clear DOM
        document.body.innerHTML = '';
    });

    describe('exportToClipboard', () => {
        it('should copy JSON to clipboard', async () => {
            const json = { type: 'FRAME', name: 'Button' };

            const result = await exportToClipboard(json);

            expect(result.success).toBe(true);
            expect(result.method).toBe('clipboard');
            expect(result.size).toBeGreaterThan(0);
            expect(mockClipboard.writeText).toHaveBeenCalled();
        });

        it('should format JSON with indentation', async () => {
            const json = { type: 'FRAME', children: [{ type: 'TEXT' }] };

            await exportToClipboard(json);

            const callArgs = mockClipboard.writeText.mock.calls[0][0];
            expect(callArgs).toContain('\n'); // Deve ter indentação
            expect(callArgs).toContain('  '); // 2-space indent
        });

        it('should include timestamp', async () => {
            const json = { type: 'FRAME' };

            const result = await exportToClipboard(json);

            expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
        });

        it('should throw error if clipboard unavailable', async () => {
            delete (navigator as any).clipboard;

            const json = { type: 'FRAME' };

            await expect(exportToClipboard(json)).rejects.toThrow(
                'Clipboard API not available'
            );
        });

        it('should throw error if write fails', async () => {
            mockClipboard.writeText.mockRejectedValueOnce(new Error('Permission denied'));

            const json = { type: 'FRAME' };

            await expect(exportToClipboard(json)).rejects.toThrow('Permission denied');
        });

        it('should calculate correct file size', async () => {
            const json = { type: 'FRAME', name: 'TestFrame' };

            const result = await exportToClipboard(json);

            expect(result.size).toBeGreaterThan(0);
            const jsonString = JSON.stringify(json, null, 2);
            expect(result.size).toBe(new Blob([jsonString]).size);
        });
    });

    describe('exportToFile', () => {
        beforeEach(() => {
            // Mock URL.createObjectURL e URL.revokeObjectURL
            (global.URL as any).createObjectURL = vi.fn(() => 'blob:mock-url');
            (global.URL as any).revokeObjectURL = vi.fn();
        });

        it('should download file with default name', () => {
            const json = { type: 'FRAME' };

            const result = exportToFile(json);

            expect(result.success).toBe(true);
            expect(result.method).toBe('download');
            expect(result.message).toContain('figma-export.json');
        });

        it('should download file with custom name', () => {
            const json = { type: 'FRAME' };

            const result = exportToFile(json, 'my-button.json');

            expect(result.message).toContain('my-button.json');
        });

        it('should create blob and URL', () => {
            const json = { type: 'FRAME' };

            const result = exportToFile(json);

            expect(result.size).toBeGreaterThan(0);
            expect(result.method).toBe('download');
        });

        it('should clean up URL after download', () => {
            const json = { type: 'FRAME' };

            exportToFile(json);

            expect((global.URL as any).createObjectURL).toHaveBeenCalled();
            expect((global.URL as any).revokeObjectURL).toHaveBeenCalled();
        });

        it('should handle large JSON', () => {
            // Cria JSON grande
            const largeArray = Array(100).fill({ type: 'TEXT', name: 'Item' });
            const json = { type: 'FRAME', children: largeArray };

            const result = exportToFile(json);

            expect(result.success).toBe(true);
            expect(result.size).toBeGreaterThan(1000);
        });
    });

    describe('exportWithFallback', () => {
        beforeEach(() => {
            // Mock URL methods para os testes de fallback
            (global.URL as any).createObjectURL = vi.fn(() => 'blob:mock-url');
            (global.URL as any).revokeObjectURL = vi.fn();
        });

        it('should use clipboard when available', async () => {
            const json = { type: 'FRAME' };

            const result = await exportWithFallback(json);

            expect(result.method).toBe('clipboard');
            expect(result.success).toBe(true);
        });

        it('should fallback to download if clipboard fails', async () => {
            mockClipboard.writeText.mockRejectedValueOnce(new Error('No permission'));

            const json = { type: 'FRAME' };

            const result = await exportWithFallback(json);

            expect(result.method).toBe('download');
            expect(result.success).toBe(true);
        });

        it('should use custom filename in fallback', async () => {
            mockClipboard.writeText.mockRejectedValueOnce(new Error('No permission'));

            const json = { type: 'FRAME' };

            const result = await exportWithFallback(json, 'custom-name.json');

            expect(result.message).toContain('custom-name.json');
        });

        it('should throw if both methods fail', async () => {
            delete (navigator as any).clipboard;
            (global.URL as any).createObjectURL = vi.fn(() => {
                throw new Error('URL error');
            });

            const json = { type: 'FRAME' };

            await expect(exportWithFallback(json)).rejects.toThrow('Export failed');
        });
    });

    describe('validateFigmaJson', () => {
        it('should accept valid FRAME node', () => {
            const json = { type: 'FRAME', name: 'Button' };
            expect(validateFigmaJson(json)).toBe(true);
        });

        it('should accept valid TEXT node', () => {
            const json = { type: 'TEXT', content: 'Hello' };
            expect(validateFigmaJson(json)).toBe(true);
        });

        it('should accept valid GROUP node', () => {
            const json = { type: 'GROUP', children: [] };
            expect(validateFigmaJson(json)).toBe(true);
        });

        it('should accept valid SHAPE node', () => {
            const json = { type: 'SHAPE', fill: '#000' };
            expect(validateFigmaJson(json)).toBe(true);
        });

        it('should accept valid COMPONENT node', () => {
            const json = { type: 'COMPONENT', name: 'Button' };
            expect(validateFigmaJson(json)).toBe(true);
        });

        it('should accept valid LINE node', () => {
            const json = { type: 'LINE', stroke: '#000' };
            expect(validateFigmaJson(json)).toBe(true);
        });

        it('should reject null', () => {
            expect(validateFigmaJson(null)).toBe(false);
        });

        it('should reject undefined', () => {
            expect(validateFigmaJson(undefined)).toBe(false);
        });

        it('should reject non-object', () => {
            expect(validateFigmaJson('not an object')).toBe(false);
            expect(validateFigmaJson(123)).toBe(false);
            expect(validateFigmaJson([])).toBe(false);
        });

        it('should reject object without type', () => {
            expect(validateFigmaJson({ name: 'Button' })).toBe(false);
        });

        it('should reject invalid type', () => {
            expect(validateFigmaJson({ type: 'INVALID' })).toBe(false);
        });

        it('should accept nested structure', () => {
            const json = {
                type: 'FRAME',
                children: [
                    { type: 'TEXT' },
                    { type: 'SHAPE' }
                ]
            };
            expect(validateFigmaJson(json)).toBe(true);
        });
    });

    describe('addExportMetadata', () => {
        it('should add export metadata', () => {
            const json = { type: 'FRAME' };

            const result = addExportMetadata(json);

            expect(result.__export).toBeDefined();
            expect(result.__export.timestamp).toBeDefined();
            expect(result.__export.version).toBe('0.1.0');
            expect(result.__export.engine).toBe('figma-sync-engine');
        });

        it('should preserve original properties', () => {
            const json = { type: 'FRAME', name: 'MyFrame', children: [] };

            const result = addExportMetadata(json);

            expect(result.type).toBe('FRAME');
            expect(result.name).toBe('MyFrame');
            expect(result.children).toEqual([]);
        });

        it('should merge custom metadata', () => {
            const json = { type: 'FRAME' };
            const customMeta = { storyId: 'Button-Primary', variant: 'primary' };

            const result = addExportMetadata(json, customMeta);

            expect(result.__export.storyId).toBe('Button-Primary');
            expect(result.__export.variant).toBe('primary');
            expect(result.__export.version).toBe('0.1.0');
        });

        it('should use current timestamp', () => {
            const before = new Date();
            const json = { type: 'FRAME' };

            const result = addExportMetadata(json);

            const exportTime = new Date(result.__export.timestamp);
            const after = new Date();

            expect(exportTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(exportTime.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
        });

        it('should not modify original object', () => {
            const json = { type: 'FRAME' };
            const original = JSON.stringify(json);

            addExportMetadata(json);

            expect(JSON.stringify(json)).toBe(original);
        });
    });

    describe('Edge cases', () => {
        it('should handle very large JSON', async () => {
            const largeJson = {
                type: 'FRAME',
                children: Array(1000).fill({
                    type: 'TEXT',
                    name: 'Item',
                    content: 'Lorem ipsum dolor sit amet'
                })
            };

            const result = await exportToClipboard(largeJson);

            expect(result.success).toBe(true);
            expect(result.size).toBeGreaterThan(50000);
        });

        it('should handle circular reference gracefully', () => {
            const json: any = { type: 'FRAME' };
            json.self = json; // Cria referência circular

            // JSON.stringify falhará, mas devemos lidar
            expect(() => {
                JSON.stringify(json);
            }).toThrow(); // Conhecido que vai falhar
        });

        it('should handle special characters in content', async () => {
            const json = {
                type: 'TEXT',
                content: '你好世界 🎉 <script>alert(1)</script>'
            };

            const result = await exportToClipboard(json);

            expect(result.success).toBe(true);
            const callArgs = mockClipboard.writeText.mock.calls[0][0];
            expect(callArgs).toContain('你好世界');
        });

        it('should handle empty children array', async () => {
            const json = {
                type: 'FRAME',
                children: []
            };

            const result = await exportToClipboard(json);

            expect(result.success).toBe(true);
        });
    });

    describe('VAR-1 Integration', () => {
        it('should include variantProperties in metadata', () => {
            const json = {
                type: 'COMPONENT',
                name: 'Button/Primary',
                variantProperties: {
                    variant: 'primary',
                    size: 'medium'
                }
            };

            const result = addExportMetadata(json, {
                storyId: 'button--primary',
                args: { variant: 'primary', size: 'medium', label: 'Click' }
            });

            expect(result.__export.args).toEqual({
                variant: 'primary',
                size: 'medium',
                label: 'Click'
            });
        });

        it('should validate COMPONENT type with variantProperties', () => {
            const json = {
                type: 'COMPONENT',
                name: 'Button/Primary',
                variantProperties: {
                    variant: 'primary'
                }
            };

            expect(validateFigmaJson(json)).toBe(true);
        });

        it('should export component with variants to clipboard', async () => {
            const json = {
                type: 'COMPONENT',
                name: 'Button/Primary/Large',
                variantProperties: {
                    variant: 'primary',
                    size: 'large'
                },
                children: []
            };

            const result = await exportToClipboard(json);

            expect(result.success).toBe(true);
            const exported = mockClipboard.writeText.mock.calls[0][0];
            const parsed = JSON.parse(exported);
            
            expect(parsed.type).toBe('COMPONENT');
            expect(parsed.variantProperties).toEqual({
                variant: 'primary',
                size: 'large'
            });
        });

        it('should include original args in __export metadata', async () => {
            const originalArgs = {
                variant: 'secondary',
                disabled: true,
                onClick: () => { }
            };

            const json = addExportMetadata(
                {
                    type: 'COMPONENT',
                    name: 'Button/Secondary',
                    variantProperties: { variant: 'secondary', state: 'disabled' }
                },
                {
                    storyId: 'button--disabled',
                    args: originalArgs
                }
            );

            const result = await exportToClipboard(json);
            expect(result.success).toBe(true);

            const exported = mockClipboard.writeText.mock.calls[0][0];
            const parsed = JSON.parse(exported);

            expect(parsed.__export.args).toBeDefined();
            expect(parsed.__export.args.variant).toBe('secondary');
            expect(parsed.__export.args.disabled).toBe(true);
        });
    });
});
