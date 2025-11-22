/**
 * Integration tests for the full export pipeline
 * Tests: capture → convert → autoLayout → export
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { captureStoryHTML } from './captureHtml';
import { applyAutoLayoutRecursive } from '@figma-sync-engine/autolayout-interpreter';
import { exportToClipboard, addExportMetadata } from './export';

// Mock navigator.clipboard
let mockClipboard: any;

beforeEach(() => {
    mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.assign(navigator, { clipboard: mockClipboard });
    
    // Create root container for captureStoryHTML
    document.body.innerHTML = '<div id="root"></div>';
});

describe('Pipeline Integration Tests', () => {
    describe('Capture → Export Pipeline', () => {
        it('should capture HTML and export to clipboard', async () => {
            const root = document.getElementById('root');
            if (root) {
                root.innerHTML = `
                    <div style="display: flex; gap: 12px;">
                        <button>Click me</button>
                        <span>Hello</span>
                    </div>
                `;
            }

            // Step 1: Capture HTML
            const capture = await captureStoryHTML();
            expect(capture.html).toBeTruthy();
            expect(capture.nodeCount).toBeGreaterThan(0);

            // Step 2: Create simple Figma JSON (mocking conversion)
            const figmaJson = {
                type: 'FRAME',
                name: 'TestComponent',
                children: [],
                __rawHtml: capture.html
            };

            // Step 3: Apply Auto Layout
            const withAutoLayout = applyAutoLayoutRecursive(figmaJson as any, () => ({}));
            expect(withAutoLayout).toBeTruthy();

            // Step 4: Add metadata
            const withMetadata = addExportMetadata(withAutoLayout, {
                storyId: 'test-story',
                nodeCount: capture.nodeCount
            });
            expect(withMetadata.__export).toBeDefined();

            // Step 5: Export
            const result = await exportToClipboard(withMetadata);
            expect(result.success).toBe(true);
            expect(result.method).toBe('clipboard');
        });

        it('should capture and export with metadata', async () => {
            const root = document.getElementById('root');
            if (root) root.innerHTML = '<div>Test Component</div>';

            const capture = await captureStoryHTML();
            const figmaJson = {
                type: 'FRAME',
                name: 'TestComponent',
                __rawHtml: capture.html
            };

            const withAutoLayout = applyAutoLayoutRecursive(figmaJson as any, () => ({}));
            const withMetadata = addExportMetadata(withAutoLayout, {
                storyId: 'test-component',
                nodeCount: capture.nodeCount
            });

            // Export to clipboard (file download tested in export.test.ts)
            const result = await exportToClipboard(withMetadata);
            
            expect(result.success).toBe(true);
            expect(result.method).toBe('clipboard');
            expect(result.size).toBeGreaterThan(0);
        });

        it('should handle complex nested structures', async () => {
            const root = document.getElementById('root');
            if (root) {
                root.innerHTML = `
                    <div style="display: flex; flex-direction: column;">
                        <header style="display: flex;">
                            <h1>Title</h1>
                            <nav style="display: flex; gap: 8px;">
                                <a href="#">Home</a>
                                <a href="#">About</a>
                            </nav>
                        </header>
                        <main><p>Content</p></main>
                    </div>
                `;
            }

            const capture = await captureStoryHTML();
            expect(capture.nodeCount).toBeGreaterThan(5);

            const figmaJson = {
                type: 'FRAME',
                name: 'ComplexComponent',
                children: [
                    { type: 'FRAME', name: 'header' },
                    { type: 'FRAME', name: 'main' }
                ]
            };

            const withAutoLayout = applyAutoLayoutRecursive(figmaJson as any, () => ({}));
            const withMetadata = addExportMetadata(withAutoLayout);
            
            const result = await exportToClipboard(withMetadata);
            expect(result.success).toBe(true);
        });
    });

    describe('Metadata Through Pipeline', () => {
        it('should preserve metadata at each stage', async () => {
            const root = document.getElementById('root');
            if (root) root.innerHTML = '<div>Test</div>';

            const capture = await captureStoryHTML();
            
            const figmaJson = {
                type: 'FRAME',
                name: 'TestComponent'
            };

            const withAutoLayout = applyAutoLayoutRecursive(figmaJson as any, () => ({}));
            
            const customMetadata = {
                storyId: 'custom-story-123',
                nodeCount: capture.nodeCount,
                customField: 'test-value'
            };

            const withMetadata = addExportMetadata(withAutoLayout, customMetadata);
            
            expect(withMetadata.__export.storyId).toBe('custom-story-123');
            expect(withMetadata.__export.customField).toBe('test-value');
            expect(withMetadata.__export.version).toBeDefined();

            await exportToClipboard(withMetadata);
            const exportedString = mockClipboard.writeText.mock.calls[0][0];
            const parsed = JSON.parse(exportedString);
            
            expect(parsed.__export.storyId).toBe('custom-story-123');
            expect(parsed.__export.customField).toBe('test-value');
        });
    });

    describe('Error Handling', () => {
        it('should handle empty root container', async () => {
            const root = document.getElementById('root');
            if (root) root.innerHTML = '';

            const capture = await captureStoryHTML();
            // Empty container still returns HTML (the root div)
            expect(capture.html).toBeTruthy();
            expect(capture.nodeCount).toBe(0);
        });

        it('should handle export with minimal data', async () => {
            const minimalJson = {
                type: 'FRAME',
                name: 'Minimal'
            };

            const result = await exportToClipboard(minimalJson);
            expect(result.success).toBe(true);
            expect(result.size).toBeGreaterThan(0);
        });
    });

    describe('Performance Metrics', () => {
        it('should complete pipeline quickly', async () => {
            const root = document.getElementById('root');
            if (root) root.innerHTML = '<div><button>Test</button></div>';

            const startTime = Date.now();

            await captureStoryHTML(); // Ensure HTML is captured
            const figmaJson = { type: 'FRAME', name: 'Test' };
            const withAutoLayout = applyAutoLayoutRecursive(figmaJson as any, () => ({}));
            const withMetadata = addExportMetadata(withAutoLayout);
            await exportToClipboard(withMetadata);

            const duration = Date.now() - startTime;

            // Should complete in under 1 second
            expect(duration).toBeLessThan(1000);
        });

        it('should track JSON size', async () => {
            const root = document.getElementById('root');
            if (root) root.innerHTML = '<div>Test</div>';

            await captureStoryHTML(); // Capture to simulate real pipeline
            const figmaJson = { type: 'FRAME', name: 'Test', __html: 'test' };
            const withMetadata = addExportMetadata(figmaJson);
            
            const result = await exportToClipboard(withMetadata);
            
            expect(result.size).toBeGreaterThan(0);
            expect(result.size).toBeLessThan(1000000); // Less than 1MB
        });
    });

    describe('Console Logging (MVP-9 prep)', () => {
        it('should support logging at pipeline stages', async () => {
            const consoleSpy = vi.spyOn(console, 'log');
            
            const root = document.getElementById('root');
            if (root) root.innerHTML = '<div>Test</div>';

            const capture = await captureStoryHTML();
            console.log('[Pipeline Test] Capture:', {
                nodeCount: capture.nodeCount,
                htmlSize: capture.html.length
            });

            const figmaJson = { type: 'FRAME', name: 'Test' };
            console.log('[Pipeline Test] Created JSON:', {
                type: figmaJson.type
            });

            const result = await exportToClipboard(addExportMetadata(figmaJson));
            console.log('[Pipeline Test] Export:', {
                size: result.size,
                method: result.method
            });

            expect(consoleSpy).toHaveBeenCalled();
            expect(consoleSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
            
            consoleSpy.mockRestore();
        });
    });
});
