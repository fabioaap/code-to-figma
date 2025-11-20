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
});
