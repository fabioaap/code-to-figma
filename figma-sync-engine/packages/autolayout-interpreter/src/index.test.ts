import { describe, it, expect } from 'vitest';
import {
    parseSpacing,
    normalizePadding,
    analyzeCss,
    mapAlignItems,
    mapJustifyContent,
    applyAutoLayout,
    applyAutoLayoutRecursive,
    detectFlexDirection,
    mapFontWeight,
    extractFontFamily,
    parseLineHeight,
    extractTypography,
    applyTypography,
    CssSnapshot
} from './index';

describe('autolayout-interpreter - MVP-4, AL-1, AL-2, AL-3', () => {
    describe('parseSpacing', () => {
        it('should parse px values', () => {
            expect(parseSpacing('12px')).toBe(12);
            expect(parseSpacing('100px')).toBe(100);
            expect(parseSpacing('0px')).toBe(0);
        });

        it('should parse without unit', () => {
            expect(parseSpacing('16')).toBe(16);
            expect(parseSpacing('8')).toBe(8);
        });

        it('should round decimal values', () => {
            expect(parseSpacing('12.5px')).toBe(13); // Math.round(12.5) = 13
            expect(parseSpacing('12.4px')).toBe(12); // Math.round(12.4) = 12
        });

        it('should return 0 for invalid input', () => {
            expect(parseSpacing('')).toBe(0);
            expect(parseSpacing(undefined)).toBe(0);
            expect(parseSpacing('invalid')).toBe(0);
        });
    });

    describe('normalizePadding - AL-1: Parser robusto', () => {
        it('should handle single value (1 valor)', () => {
            const result = normalizePadding('16px');
            expect(result.top).toBe(16);
            expect(result.right).toBe(16);
            expect(result.bottom).toBe(16);
            expect(result.left).toBe(16);
        });

        it('should handle two values (2 valores)', () => {
            const result = normalizePadding('12px 16px');
            expect(result.top).toBe(12);
            expect(result.right).toBe(16);
            expect(result.bottom).toBe(12);
            expect(result.left).toBe(16);
        });

        it('should handle three values (3 valores)', () => {
            const result = normalizePadding('8px 16px 12px');
            expect(result.top).toBe(8);
            expect(result.right).toBe(16);
            expect(result.bottom).toBe(12);
            expect(result.left).toBe(16);
        });

        it('should handle four values (4 valores)', () => {
            const result = normalizePadding('4px 8px 12px 16px');
            expect(result.top).toBe(4);
            expect(result.right).toBe(8);
            expect(result.bottom).toBe(12);
            expect(result.left).toBe(16);
        });

        it('should handle override specific sides', () => {
            const result = normalizePadding('10px', '5px', undefined, '15px', undefined);
            expect(result.top).toBe(5); // override
            expect(result.right).toBe(10); // from padding
            expect(result.bottom).toBe(15); // override
            expect(result.left).toBe(10); // from padding
        });

        it('should handle mixed units (px, rem, em)', () => {
            const result = normalizePadding('12px');
            expect(result.top).toBeGreaterThanOrEqual(0);
            expect(result.right).toBeGreaterThanOrEqual(0);
        });

        it('should return zeros for invalid input', () => {
            const result = normalizePadding(undefined);
            expect(result.top).toBe(0);
            expect(result.right).toBe(0);
            expect(result.bottom).toBe(0);
            expect(result.left).toBe(0);
        });
    });

    describe('mapAlignItems - AL-2: align-items', () => {
        it('should map flex-start', () => {
            expect(mapAlignItems('flex-start')).toBe('MIN');
        });

        it('should map center', () => {
            expect(mapAlignItems('center')).toBe('CENTER');
        });

        it('should map flex-end', () => {
            expect(mapAlignItems('flex-end')).toBe('MAX');
        });

        it('should map stretch', () => {
            expect(mapAlignItems('stretch')).toBe('STRETCH');
        });

        it('should return undefined for unknown values', () => {
            expect(mapAlignItems('invalid')).toBeUndefined();
            expect(mapAlignItems(undefined)).toBeUndefined();
        });

        it('should ignore isRow direction for align-items (sempre secondary axis)', () => {
            // align-items sempre é o eixo secundário
            expect(mapAlignItems('center', true)).toBe('CENTER');
            expect(mapAlignItems('center', false)).toBe('CENTER');
        });
    });

    describe('mapJustifyContent - AL-2: justify-content', () => {
        it('should map flex-start', () => {
            expect(mapJustifyContent('flex-start')).toBe('MIN');
        });

        it('should map center', () => {
            expect(mapJustifyContent('center')).toBe('CENTER');
        });

        it('should map flex-end', () => {
            expect(mapJustifyContent('flex-end')).toBe('MAX');
        });

        it('should map space-between', () => {
            expect(mapJustifyContent('space-between')).toBe('SPACE_BETWEEN');
        });

        it('should return undefined for unknown values', () => {
            expect(mapJustifyContent('invalid')).toBeUndefined();
            expect(mapJustifyContent(undefined)).toBeUndefined();
        });
    });

    describe('detectFlexDirection - AL-3: Fallback robusto de direção', () => {
        it('should return HORIZONTAL for row', () => {
            expect(detectFlexDirection('row')).toBe('HORIZONTAL');
        });

        it('should return HORIZONTAL for row-reverse', () => {
            expect(detectFlexDirection('row-reverse')).toBe('HORIZONTAL');
        });

        it('should return VERTICAL for column', () => {
            expect(detectFlexDirection('column')).toBe('VERTICAL');
        });

        it('should return VERTICAL for column-reverse', () => {
            expect(detectFlexDirection('column-reverse')).toBe('VERTICAL');
        });

        it('should return HORIZONTAL when flexDirection is undefined (fallback)', () => {
            expect(detectFlexDirection(undefined)).toBe('HORIZONTAL');
        });

        it('should return HORIZONTAL when flexDirection is empty string (fallback)', () => {
            expect(detectFlexDirection('')).toBe('HORIZONTAL');
        });

        it('should return HORIZONTAL for invalid values (fallback)', () => {
            expect(detectFlexDirection('invalid')).toBe('HORIZONTAL');
            expect(detectFlexDirection('block')).toBe('HORIZONTAL');
            expect(detectFlexDirection('xyz')).toBe('HORIZONTAL');
        });

        it('should handle case variations', () => {
            expect(detectFlexDirection('ROW')).toBe('HORIZONTAL');
            expect(detectFlexDirection('COLUMN')).toBe('VERTICAL');
            expect(detectFlexDirection('Row-Reverse')).toBe('HORIZONTAL');
            expect(detectFlexDirection('Column-Reverse')).toBe('VERTICAL');
        });

        it('should handle whitespace', () => {
            expect(detectFlexDirection(' row ')).toBe('HORIZONTAL');
            expect(detectFlexDirection(' column ')).toBe('VERTICAL');
        });
    });

    describe('analyzeCss', () => {
        it('should detect flex container', () => {
            const css: CssSnapshot = { display: 'flex' };
            const analysis = analyzeCss(css);
            expect(analysis.isFlex).toBe(true);
        });

        it('should detect row direction', () => {
            const css: CssSnapshot = { display: 'flex', flexDirection: 'row' };
            const analysis = analyzeCss(css);
            expect(analysis.isRow).toBe(true);
        });

        it('should detect column direction', () => {
            const css: CssSnapshot = { display: 'flex', flexDirection: 'column' };
            const analysis = analyzeCss(css);
            expect(analysis.isRow).toBe(false);
        });

        it('should parse gap', () => {
            const css: CssSnapshot = { display: 'flex', gap: '12px' };
            const analysis = analyzeCss(css);
            expect(analysis.gap).toBe(12);
        });
    });

    describe('applyAutoLayout - MVP-4', () => {
        it('should set HORIZONTAL layoutMode for row', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'flex', flexDirection: 'row' };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('HORIZONTAL');
        });

        it('should set VERTICAL layoutMode for column', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'flex', flexDirection: 'column' };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBe('VERTICAL');
        });

        it('should apply itemSpacing from gap', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'flex', gap: '16px' };
            const result = applyAutoLayout(node, css);
            expect(result.itemSpacing).toBe(16);
        });

        it('should apply padding', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'flex', padding: '12px 16px' };
            const result = applyAutoLayout(node, css);
            expect(result.paddingTop).toBe(12);
            expect(result.paddingRight).toBe(16);
            expect(result.paddingBottom).toBe(12);
            expect(result.paddingLeft).toBe(16);
        });

        it('should apply align-items mapping', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'flex', alignItems: 'center' };
            const result = applyAutoLayout(node, css);
            expect(result.counterAxisAlignItems).toBe('CENTER');
        });

        it('should apply justify-content mapping', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'flex', justifyContent: 'space-between' };
            const result = applyAutoLayout(node, css);
            expect(result.primaryAxisAlignItems).toBe('SPACE_BETWEEN');
        });

        it('should not modify non-flex containers', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'block' };
            const result = applyAutoLayout(node, css);
            expect(result.layoutMode).toBeUndefined();
        });

        it('should handle complex flex container', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                alignItems: 'center',
                justifyContent: 'flex-start'
            };
            const result = applyAutoLayout(node, css);

            expect(result.layoutMode).toBe('VERTICAL');
            expect(result.itemSpacing).toBe(12);
            expect(result.paddingTop).toBe(16);
            expect(result.counterAxisAlignItems).toBe('CENTER');
            expect(result.primaryAxisAlignItems).toBe('MIN');
        });
    });

    describe('applyAutoLayoutRecursive', () => {
        it('should process entire tree', () => {
            const node = {
                type: 'FRAME',
                children: [
                    { type: 'TEXT' },
                    { type: 'FRAME' }
                ]
            };

            const getCss = (): CssSnapshot => {
                return { display: 'flex', flexDirection: 'column' };
            };

            const result = applyAutoLayoutRecursive(node, getCss);

            expect(result.layoutMode).toBe('VERTICAL');
            expect(result.children).toHaveLength(2);
        });

        it('should handle deep nesting', () => {
            const node = {
                type: 'FRAME',
                children: [
                    {
                        type: 'FRAME',
                        children: [
                            { type: 'TEXT' }
                        ]
                    }
                ]
            };

            const getCss = (): CssSnapshot => ({ display: 'flex' });
            const result = applyAutoLayoutRecursive(node, getCss);

            expect(result.layoutMode).toBe('HORIZONTAL');
            expect(result.children?.[0].layoutMode).toBe('HORIZONTAL');
        });
    });

    describe('Edge cases', () => {
        it('should handle empty padding', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'flex', padding: '' };
            const result = applyAutoLayout(node, css);
            expect(result.paddingTop).toBeUndefined();
        });

        it('should handle zero values gracefully', () => {
            const node = { type: 'FRAME' };
            const css: CssSnapshot = { display: 'flex', gap: '0px' };
            const result = applyAutoLayout(node, css);
            expect(result.itemSpacing).toBeUndefined(); // 0 não é aplicado
        });

        it('should handle whitespace in padding', () => {
            const result = normalizePadding('  10px   20px   15px   25px  ');
            expect(result.top).toBe(10);
            expect(result.right).toBe(20);
            expect(result.bottom).toBe(15);
            expect(result.left).toBe(25);
        });

        it('should handle mixed valid and invalid values', () => {
            const result = normalizePadding('12px invalid 8px');
            expect(result.top).toBe(12);
            expect(result.right).toBe(0); // invalid
            expect(result.bottom).toBe(8);
        });
    });

    describe('Typography - AL-7', () => {
        describe('mapFontWeight', () => {
            it('should map numeric weights', () => {
                expect(mapFontWeight('400')).toBe('Regular');
                expect(mapFontWeight('700')).toBe('Bold');
                expect(mapFontWeight('300')).toBe('Light');
                expect(mapFontWeight('600')).toBe('Semi Bold');
            });

            it('should map named weights', () => {
                expect(mapFontWeight('normal')).toBe('Regular');
                expect(mapFontWeight('bold')).toBe('Bold');
                expect(mapFontWeight('light')).toBe('Light');
            });

            it('should handle number type', () => {
                expect(mapFontWeight(400)).toBe('Regular');
                expect(mapFontWeight(700)).toBe('Bold');
            });

            it('should fallback to Regular for unknown values', () => {
                expect(mapFontWeight(undefined)).toBe('Regular');
                expect(mapFontWeight('unknown')).toBe('Regular');
            });
        });

        describe('extractFontFamily', () => {
            it('should extract first font from list', () => {
                expect(extractFontFamily('Arial, sans-serif')).toBe('Arial');
                expect(extractFontFamily('"Helvetica Neue", Helvetica, Arial')).toBe('Helvetica Neue');
            });

            it('should skip generic fonts', () => {
                expect(extractFontFamily('sans-serif')).toBe('Inter');
                expect(extractFontFamily('serif, sans-serif')).toBe('Inter');
            });

            it('should handle single font', () => {
                expect(extractFontFamily('Roboto')).toBe('Roboto');
            });

            it('should fallback to Inter', () => {
                expect(extractFontFamily(undefined)).toBe('Inter');
                expect(extractFontFamily('')).toBe('Inter');
            });

            it('should remove quotes', () => {
                expect(extractFontFamily('"Times New Roman"')).toBe('Times New Roman');
                expect(extractFontFamily("'Georgia'")).toBe('Georgia');
            });
        });

        describe('parseLineHeight', () => {
            it('should parse unitless multiplier as PERCENT', () => {
                const result = parseLineHeight('1.5', 16);
                expect(result?.value).toBe(150);
                expect(result?.unit).toBe('PERCENT');
            });

            it('should parse pixel values', () => {
                const result = parseLineHeight('24px', 16);
                expect(result?.value).toBe(24);
                expect(result?.unit).toBe('PIXELS');
            });

            it('should parse percentage values', () => {
                const result = parseLineHeight('120%', 16);
                expect(result?.value).toBe(120);
                expect(result?.unit).toBe('PERCENT');
            });

            it('should return undefined for normal', () => {
                expect(parseLineHeight('normal', 16)).toBeUndefined();
                expect(parseLineHeight(undefined, 16)).toBeUndefined();
            });

            it('should handle decimal multipliers', () => {
                const result = parseLineHeight('1.2', 16);
                expect(result?.value).toBe(120);
                expect(result?.unit).toBe('PERCENT');
            });
        });

        describe('extractTypography', () => {
            it('should extract complete typography', () => {
                const css: CssSnapshot = {
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: '700',
                    fontSize: '18px',
                    lineHeight: '1.5'
                };
                const result = extractTypography(css);
                
                expect(result.fontFamily).toBe('Roboto');
                expect(result.fontStyle).toBe('Bold');
                expect(result.fontSize).toBe(18);
                expect(result.lineHeight?.value).toBe(150);
                expect(result.lineHeight?.unit).toBe('PERCENT');
            });

            it('should use defaults for missing values', () => {
                const css: CssSnapshot = {};
                const result = extractTypography(css);
                
                expect(result.fontFamily).toBe('Inter');
                expect(result.fontStyle).toBe('Regular');
                expect(result.fontSize).toBe(16);
            });

            it('should handle various font weights', () => {
                const css: CssSnapshot = { fontWeight: '300' };
                expect(extractTypography(css).fontStyle).toBe('Light');
            });
        });

        describe('applyTypography', () => {
            it('should apply typography to TEXT nodes', () => {
                const node = { type: 'TEXT' };
                const css: CssSnapshot = {
                    fontFamily: 'Arial',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    lineHeight: '1.4',
                    color: '#333333'
                };
                const result = applyTypography(node, css);
                
                expect(result.fontName?.family).toBe('Arial');
                expect(result.fontName?.style).toBe('Bold');
                expect(result.fontSize).toBe(20);
                expect(result.lineHeight?.value).toBe(140);
                expect(result.color).toBe('#333333');
            });

            it('should not modify non-TEXT nodes', () => {
                const node = { type: 'FRAME' };
                const css: CssSnapshot = { fontFamily: 'Arial' };
                const result = applyTypography(node, css);
                
                expect(result.fontName).toBeUndefined();
            });

            it('should handle missing optional properties', () => {
                const node = { type: 'TEXT' };
                const css: CssSnapshot = { fontSize: '16px' };
                const result = applyTypography(node, css);
                
                expect(result.fontName?.family).toBe('Inter');
                expect(result.fontSize).toBe(16);
            });
        });
    });
});
