import { describe, it, expect } from 'vitest';
import { applyAutoLayout } from '../src/index';

describe('applyAutoLayout', () => {
    it('aplica layout horizontal com gap e padding', () => {
        const node = { type: 'FRAME', children: [] };
        const css = { display: 'flex', flexDirection: 'row', gap: '8', padding: '12' };
        const result = applyAutoLayout(node, css);
        expect(result.layoutMode).toBe('HORIZONTAL');
        expect(result.itemSpacing).toBe(8);
        expect(result.paddingTop).toBe(12);
        expect(result.paddingLeft).toBe(12);
    });

    it('normaliza padding com 4 valores', () => {
        const node = { type: 'FRAME' };
        const css = { display: 'flex', flexDirection: 'column', gap: '4', padding: '10 20 30 40' };
        const result = applyAutoLayout(node, css);
        expect(result.paddingRight).toBe(20);
        expect(result.paddingBottom).toBe(30);
        expect(result.paddingLeft).toBe(40);
        expect(result.layoutMode).toBe('VERTICAL');
    });

    describe('justify-content mapping (primary axis)', () => {
        it('mapeia flex-start para MIN', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', justifyContent: 'flex-start' };
            const result = applyAutoLayout(node, css);
            expect(result.primaryAxisAlignItems).toBe('MIN');
        });

        it('mapeia center para CENTER', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', justifyContent: 'center' };
            const result = applyAutoLayout(node, css);
            expect(result.primaryAxisAlignItems).toBe('CENTER');
        });

        it('mapeia flex-end para MAX', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', justifyContent: 'flex-end' };
            const result = applyAutoLayout(node, css);
            expect(result.primaryAxisAlignItems).toBe('MAX');
        });

        it('mapeia space-between para SPACE_BETWEEN', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', justifyContent: 'space-between' };
            const result = applyAutoLayout(node, css);
            expect(result.primaryAxisAlignItems).toBe('SPACE_BETWEEN');
        });
    });

    describe('align-items mapping (counter axis)', () => {
        it('mapeia flex-start para MIN', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', alignItems: 'flex-start' };
            const result = applyAutoLayout(node, css);
            expect(result.counterAxisAlignItems).toBe('MIN');
        });

        it('mapeia center para CENTER', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', alignItems: 'center' };
            const result = applyAutoLayout(node, css);
            expect(result.counterAxisAlignItems).toBe('CENTER');
        });

        it('mapeia flex-end para MAX', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', alignItems: 'flex-end' };
            const result = applyAutoLayout(node, css);
            expect(result.counterAxisAlignItems).toBe('MAX');
        });

        it('mapeia baseline para BASELINE', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', alignItems: 'baseline' };
            const result = applyAutoLayout(node, css);
            expect(result.counterAxisAlignItems).toBe('BASELINE');
        });
    });

    describe('combined alignment properties', () => {
        it('aplica ambos justify-content e align-items', () => {
            const node = { type: 'FRAME' };
            const css = {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16',
                padding: '8'
            };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('HORIZONTAL');
            expect(result.primaryAxisAlignItems).toBe('CENTER');
            expect(result.counterAxisAlignItems).toBe('CENTER');
            expect(result.itemSpacing).toBe(16);
            expect(result.paddingTop).toBe(8);
        });

        it('aplica alinhamento em layout vertical', () => {
            const node = { type: 'FRAME' };
            const css = {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('VERTICAL');
            expect(result.primaryAxisAlignItems).toBe('SPACE_BETWEEN');
            expect(result.counterAxisAlignItems).toBe('MAX');
        });
    });
});
