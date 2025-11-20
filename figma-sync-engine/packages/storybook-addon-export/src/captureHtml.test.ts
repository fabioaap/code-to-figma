import { describe, it, expect, beforeEach } from 'vitest';
import { captureStoryHTML, captureComponentHTML } from './captureHtml';

describe('captureHtml - MVP-2', () => {
    let container: HTMLElement;

    beforeEach(() => {
        // Limpa DOM anterior
        document.body.innerHTML = '';

        // Cria container raiz
        container = document.createElement('div');
        container.id = 'root';
        document.body.appendChild(container);
    });

    describe('captureStoryHTML', () => {
        it('should capture simple HTML structure', async () => {
            container.innerHTML = `
                <div class="button-wrapper">
                    <button style="padding: 12px 16px; background: #2563eb;">
                        Export Me
                    </button>
                </div>
            `;

            const result = await captureStoryHTML('root');

            expect(result.html).toBeDefined();
            expect(result.html).toContain('button-wrapper');
            expect(result.html).toContain('Export Me');
            expect(result.nodeCount).toBeGreaterThan(0);
            expect(result.hasInteractiveElements).toBe(true);
        });

        it('should sanitize script tags', async () => {
            container.innerHTML = `
                <div>
                    <button>Click</button>
                    <script>console.log('malicious')</script>
                </div>
            `;

            const result = await captureStoryHTML('root');

            expect(result.html).not.toContain('script');
            expect(result.html).not.toContain('malicious');
            expect(result.html).toContain('Click');
        });

        it('should sanitize onclick attributes', async () => {
            container.innerHTML = `
                <div>
                    <button onclick="alert('xss')">Safe Button</button>
                </div>
            `;

            const result = await captureStoryHTML('root');

            expect(result.html).not.toContain('onclick');
            expect(result.html).toContain('Safe Button');
        });

        it('should preserve allowed attributes', async () => {
            container.innerHTML = `
                <div id="test-id" class="my-class" data-testid="btn">
                    <button style="color: red;">Test</button>
                </div>
            `;

            const result = await captureStoryHTML('root');

            expect(result.html).toContain('id=');
            expect(result.html).toContain('class=');
            expect(result.html).toContain('data-testid=');
            expect(result.html).toContain('style=');
        });

        it('should remove iframe tags', async () => {
            container.innerHTML = `
                <div>
                    <iframe src="malicious.com"></iframe>
                    <button>Safe</button>
                </div>
            `;

            const result = await captureStoryHTML('root');

            expect(result.html).not.toContain('iframe');
            expect(result.html).toContain('Safe');
        });

        it('should count nodes correctly', async () => {
            container.innerHTML = `
                <div class="root">
                    <div class="row">
                        <span>Item 1</span>
                        <span>Item 2</span>
                    </div>
                </div>
            `;

            const result = await captureStoryHTML('root');

            // root div + inner div + 2 spans = 4 elements
            expect(result.nodeCount).toBe(4);
        });

        it('should detect interactive elements', async () => {
            container.innerHTML = `
                <div>
                    <p>Plain text</p>
                </div>
            `;

            const result = await captureStoryHTML('root');
            expect(result.hasInteractiveElements).toBe(false);
        });

        it('should throw error if container not found', async () => {
            await expect(captureStoryHTML('nonexistent')).rejects.toThrow(
                'Container with ID "nonexistent" not found'
            );
        });

        it('should handle complex nested structure', async () => {
            container.innerHTML = `
                <div class="card">
                    <div class="header">
                        <h3>Title</h3>
                    </div>
                    <div class="body">
                        <p>Description</p>
                        <button>Action</button>
                    </div>
                    <div class="footer">
                        <a href="/link">Link</a>
                    </div>
                </div>
            `;

            const result = await captureStoryHTML('root');

            expect(result.html).toContain('card');
            expect(result.html).toContain('Title');
            expect(result.html).toContain('Description');
            expect(result.html).toContain('Action');
            expect(result.nodeCount).toBeGreaterThan(5);
            expect(result.hasInteractiveElements).toBe(true);
        });

        it('should remove style tags', async () => {
            container.innerHTML = `
                <div>
                    <style>body { color: red; }</style>
                    <button>Safe</button>
                </div>
            `;

            const result = await captureStoryHTML('root');

            expect(result.html).not.toContain('style');
            expect(result.html).toContain('Safe');
        });

        it('should preserve SVG elements', async () => {
            container.innerHTML = `
                <div>
                    <svg width="24" height="24">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                </div>
            `;

            const result = await captureStoryHTML('root');

            expect(result.html).toContain('svg');
            expect(result.html).toContain('circle');
        });
    });

    describe('captureComponentHTML', () => {
        it('should capture component by selector', async () => {
            container.innerHTML = `
                <div class="storybook-wrapper">
                    <div id="component-root" class="my-component">
                        <button>Export</button>
                    </div>
                </div>
            `;

            const result = await captureComponentHTML('#component-root');

            expect(result.html).toContain('my-component');
            expect(result.html).toContain('Export');
            expect(result.hasInteractiveElements).toBe(true);
        });

        it('should throw error if selector not found', async () => {
            container.innerHTML = '<div>Content</div>';

            await expect(captureComponentHTML('.nonexistent')).rejects.toThrow(
                'Element with selector ".nonexistent" not found'
            );
        });

        it('should work with class selector', async () => {
            container.innerHTML = `
                <div class="wrapper">
                    <div class="component">
                        <p>Text</p>
                    </div>
                </div>
            `;

            const result = await captureComponentHTML('.component');

            expect(result.html).toContain('component');
            expect(result.html).toContain('Text');
        });
    });
});
