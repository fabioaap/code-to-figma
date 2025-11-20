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

    it('mapeia justify-content flex-start para MIN', () => {
        const node = { type: 'FRAME' };
        const css = { display: 'flex', justifyContent: 'flex-start' };
        const result = applyAutoLayout(node, css);
        expect(result.primaryAxisAlignItems).toBe('MIN');
    });

    it('mapeia justify-content center para CENTER', () => {
        const node = { type: 'FRAME' };
        const css = { display: 'flex', justifyContent: 'center' };
        const result = applyAutoLayout(node, css);
        expect(result.primaryAxisAlignItems).toBe('CENTER');
    });

    it('mapeia justify-content flex-end para MAX', () => {
        const node = { type: 'FRAME' };
        const css = { display: 'flex', justifyContent: 'flex-end' };
        const result = applyAutoLayout(node, css);
        expect(result.primaryAxisAlignItems).toBe('MAX');
    });

    it('mapeia justify-content space-between para SPACE_BETWEEN', () => {
        const node = { type: 'FRAME' };
        const css = { display: 'flex', justifyContent: 'space-between' };
        const result = applyAutoLayout(node, css);
        expect(result.primaryAxisAlignItems).toBe('SPACE_BETWEEN');
    });

    it('mapeia align-items flex-start para MIN', () => {
        const node = { type: 'FRAME' };
        const css = { display: 'flex', alignItems: 'flex-start' };
        const result = applyAutoLayout(node, css);
        expect(result.counterAxisAlignItems).toBe('MIN');
    });

    it('mapeia align-items center para CENTER', () => {
        const node = { type: 'FRAME' };
        const css = { display: 'flex', alignItems: 'center' };
        const result = applyAutoLayout(node, css);
        expect(result.counterAxisAlignItems).toBe('CENTER');
    });

    it('mapeia align-items flex-end para MAX', () => {
        const node = { type: 'FRAME' };
        const css = { display: 'flex', alignItems: 'flex-end' };
        const result = applyAutoLayout(node, css);
        expect(result.counterAxisAlignItems).toBe('MAX');
    });

    it('aplica layout vertical com alinhamentos completos', () => {
        const node = { type: 'FRAME', children: [] };
        const css = {
            display: 'flex',
            flexDirection: 'column',
            gap: '16',
            padding: '20',
            alignItems: 'center',
            justifyContent: 'space-between'
        };
        const result = applyAutoLayout(node, css);
        expect(result.layoutMode).toBe('VERTICAL');
        expect(result.itemSpacing).toBe(16);
        expect(result.paddingTop).toBe(20);
        expect(result.primaryAxisAlignItems).toBe('SPACE_BETWEEN');
        expect(result.counterAxisAlignItems).toBe('CENTER');
    });
});
