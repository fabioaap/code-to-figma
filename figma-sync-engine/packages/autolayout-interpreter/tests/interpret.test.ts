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

    // AL-3: Testes para detecção de direção com fallback
    describe('[AL-3] Detecção de direção', () => {
        it('deve usar HORIZONTAL quando flex-direction não está definido', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex' };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('HORIZONTAL');
        });

        it('deve usar HORIZONTAL com flex-direction: row', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', flexDirection: 'row' };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('HORIZONTAL');
        });

        it('deve usar HORIZONTAL com flex-direction: row-reverse', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', flexDirection: 'row-reverse' };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('HORIZONTAL');
        });

        it('deve usar VERTICAL com flex-direction: column', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', flexDirection: 'column' };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('VERTICAL');
        });

        it('deve usar VERTICAL com flex-direction: column-reverse', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', flexDirection: 'column-reverse' };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('VERTICAL');
        });

        it('deve usar fallback HORIZONTAL com valor inválido de flex-direction', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', flexDirection: 'invalid-value' as any };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('HORIZONTAL');
        });

        it('deve lidar com flex-direction em maiúsculas', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', flexDirection: 'COLUMN' as any };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('VERTICAL');
        });

        it('deve lidar com flex-direction em case misto', () => {
            const node = { type: 'FRAME' };
            const css = { display: 'flex', flexDirection: 'Row-Reverse' as any };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('HORIZONTAL');
        });
    });
});
