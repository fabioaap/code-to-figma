/**
 * AL-7: Testes do módulo de tipografia
 */

import { describe, it, expect } from 'vitest';
import {
    mapFontWeightToStyle,
    buildFigmaFontName,
    parseFontSize,
    parseLineHeight,
    extractTypographyFromCss,
    convertTypographyToFigma,
    buildFontFallbackList,
    FONT_FALLBACK_LIST,
    type TypographyProperties,
    type FigmaFontName
} from './typography';

describe('typography - AL-7: Mapeamento completo de tipografia', () => {
    describe('mapFontWeightToStyle', () => {
        it('deve mapear valores numéricos padrão (100-900)', () => {
            expect(mapFontWeightToStyle(100)).toBe('Thin');
            expect(mapFontWeightToStyle(200)).toBe('ExtraLight');
            expect(mapFontWeightToStyle(300)).toBe('Light');
            expect(mapFontWeightToStyle(400)).toBe('Regular');
            expect(mapFontWeightToStyle(500)).toBe('Medium');
            expect(mapFontWeightToStyle(600)).toBe('SemiBold');
            expect(mapFontWeightToStyle(700)).toBe('Bold');
            expect(mapFontWeightToStyle(800)).toBe('ExtraBold');
            expect(mapFontWeightToStyle(900)).toBe('Black');
        });

        it('deve arredondar valores intermediários para múltiplo de 100', () => {
            expect(mapFontWeightToStyle(450)).toBe('Medium'); // arredonda para 500
            expect(mapFontWeightToStyle(550)).toBe('SemiBold'); // arredonda para 600
            expect(mapFontWeightToStyle(650)).toBe('Bold'); // arredonda para 700
            expect(mapFontWeightToStyle(749)).toBe('Bold'); // arredonda para 700
        });

        it('deve limitar valores fora do range 100-900', () => {
            expect(mapFontWeightToStyle(50)).toBe('Thin'); // arredonda para 100
            expect(mapFontWeightToStyle(0)).toBe('Regular'); // valores <= 0 retornam Regular
            expect(mapFontWeightToStyle(1000)).toBe('Black'); // clamp para 900
            expect(mapFontWeightToStyle(1500)).toBe('Black'); // clamp para 900
        });

        it('deve mapear palavras-chave CSS (strings)', () => {
            expect(mapFontWeightToStyle('normal')).toBe('Regular');
            expect(mapFontWeightToStyle('bold')).toBe('Bold');
            expect(mapFontWeightToStyle('light')).toBe('Light');
            expect(mapFontWeightToStyle('medium')).toBe('Medium');
            expect(mapFontWeightToStyle('semibold')).toBe('SemiBold');
        });

        it('deve mapear strings numéricas', () => {
            expect(mapFontWeightToStyle('400')).toBe('Regular');
            expect(mapFontWeightToStyle('700')).toBe('Bold');
            expect(mapFontWeightToStyle('300')).toBe('Light');
        });

        it('deve ser case-insensitive para palavras-chave', () => {
            expect(mapFontWeightToStyle('BOLD')).toBe('Bold');
            expect(mapFontWeightToStyle('Normal')).toBe('Regular');
            expect(mapFontWeightToStyle('SemiBold')).toBe('SemiBold');
        });

        it('deve retornar Regular para valores inválidos', () => {
            expect(mapFontWeightToStyle(undefined)).toBe('Regular');
            expect(mapFontWeightToStyle('invalid')).toBe('Regular');
            expect(mapFontWeightToStyle('')).toBe('Regular');
        });

        it('deve lidar com whitespace em strings', () => {
            expect(mapFontWeightToStyle('  bold  ')).toBe('Bold');
            expect(mapFontWeightToStyle(' 700 ')).toBe('Bold');
        });
    });

    describe('buildFigmaFontName', () => {
        it('deve construir fontName com family e style', () => {
            const result = buildFigmaFontName('Inter', 700);
            expect(result.family).toBe('Inter');
            expect(result.style).toBe('Bold');
        });

        it('deve usar primeira fonte da lista font-family CSS', () => {
            const result = buildFigmaFontName('Inter, Arial, sans-serif', 400);
            expect(result.family).toBe('Inter');
            expect(result.style).toBe('Regular');
        });

        it('deve remover aspas da font-family', () => {
            const result1 = buildFigmaFontName('"Roboto"', 400);
            expect(result1.family).toBe('Roboto');

            const result2 = buildFigmaFontName("'Open Sans'", 600);
            expect(result2.family).toBe('Open Sans');
        });

        it('deve usar Inter como fallback se family não fornecida', () => {
            const result = buildFigmaFontName(undefined, 700);
            expect(result.family).toBe('Inter');
            expect(result.style).toBe('Bold');
        });

        it('deve usar Regular como style padrão', () => {
            const result = buildFigmaFontName('Arial');
            expect(result.family).toBe('Arial');
            expect(result.style).toBe('Regular');
        });

        it('deve aceitar font-weight como string', () => {
            const result = buildFigmaFontName('Roboto', 'bold');
            expect(result.family).toBe('Roboto');
            expect(result.style).toBe('Bold');
        });
    });

    describe('parseFontSize', () => {
        it('deve extrair tamanho em pixels', () => {
            expect(parseFontSize('16px')).toBe(16);
            expect(parseFontSize('24px')).toBe(24);
            expect(parseFontSize('14px')).toBe(14);
        });

        it('deve converter rem para pixels (assumindo 16px base)', () => {
            expect(parseFontSize('1rem')).toBe(16);
            expect(parseFontSize('1.5rem')).toBe(24);
            expect(parseFontSize('0.875rem')).toBe(14);
        });

        it('deve converter em para pixels (assumindo 16px base)', () => {
            expect(parseFontSize('1em')).toBe(16);
            expect(parseFontSize('2em')).toBe(32);
        });

        it('deve retornar undefined para valores inválidos', () => {
            expect(parseFontSize(undefined)).toBeUndefined();
            expect(parseFontSize('')).toBeUndefined();
            expect(parseFontSize('invalid')).toBeUndefined();
        });

        it('deve lidar com valores decimais', () => {
            expect(parseFontSize('16.5px')).toBe(16.5);
            expect(parseFontSize('1.25rem')).toBe(20);
        });

        it('deve extrair apenas número no início', () => {
            expect(parseFontSize('16')).toBe(16);
            expect(parseFontSize('24 px')).toBe(24); // espaço não importa
        });
    });

    describe('parseLineHeight', () => {
        it('deve converter auto/normal para AUTO', () => {
            expect(parseLineHeight('auto')).toEqual({ value: 0, unit: 'AUTO' });
            expect(parseLineHeight('normal')).toEqual({ value: 0, unit: 'AUTO' });
        });

        it('deve converter valores em pixels para PIXELS', () => {
            expect(parseLineHeight('24px')).toEqual({ value: 24, unit: 'PIXELS' });
            expect(parseLineHeight('32px')).toEqual({ value: 32, unit: 'PIXELS' });
        });

        it('deve converter porcentagens para PERCENT', () => {
            expect(parseLineHeight('150%')).toEqual({ value: 150, unit: 'PERCENT' });
            expect(parseLineHeight('120%')).toEqual({ value: 120, unit: 'PERCENT' });
        });

        it('deve converter valores unitless (multiplicador) para PERCENT', () => {
            expect(parseLineHeight('1.5')).toEqual({ value: 150, unit: 'PERCENT' });
            expect(parseLineHeight('1.2')).toEqual({ value: 120, unit: 'PERCENT' });
            expect(parseLineHeight('2')).toEqual({ value: 200, unit: 'PERCENT' });
        });

        it('deve retornar undefined para valores inválidos', () => {
            expect(parseLineHeight(undefined)).toBeUndefined();
            expect(parseLineHeight('')).toBeUndefined();
            expect(parseLineHeight('invalid')).toBeUndefined();
        });

        it('deve lidar com valores decimais', () => {
            expect(parseLineHeight('24.5px')).toEqual({ value: 24.5, unit: 'PIXELS' });
            expect(parseLineHeight('1.25')).toEqual({ value: 125, unit: 'PERCENT' });
        });
    });

    describe('extractTypographyFromCss', () => {
        it('deve extrair todas as propriedades de tipografia', () => {
            const css = {
                'font-family': 'Inter, sans-serif',
                'font-weight': '700',
                'font-size': '16px',
                'line-height': '1.5',
                'letter-spacing': '0.5px',
                'text-align': 'center',
                'color': '#333333'
            };

            const result = extractTypographyFromCss(css);

            expect(result.fontFamily).toBe('Inter, sans-serif');
            expect(result.fontWeight).toBe('700');
            expect(result.fontSize).toBe(16);
            expect(result.lineHeight).toBe('1.5');
            expect(result.textAlign).toBe('center');
            expect(result.color).toBe('#333333');
        });

        it('deve aceitar propriedades em camelCase', () => {
            const css = {
                fontFamily: 'Roboto',
                fontWeight: 500,
                fontSize: '20px'
            };

            const result = extractTypographyFromCss(css);

            expect(result.fontFamily).toBe('Roboto');
            expect(result.fontWeight).toBe(500);
            expect(result.fontSize).toBe(20);
        });

        it('deve lidar com propriedades faltantes', () => {
            const css = {
                'font-size': '14px'
            };

            const result = extractTypographyFromCss(css);

            expect(result.fontSize).toBe(14);
            expect(result.fontFamily).toBeUndefined();
            expect(result.fontWeight).toBeUndefined();
        });

        it('deve aceitar objeto vazio', () => {
            const result = extractTypographyFromCss({});
            expect(result).toBeDefined();
            expect(result.fontFamily).toBeUndefined();
        });
    });

    describe('convertTypographyToFigma', () => {
        it('deve converter propriedades completas para formato Figma', () => {
            const typography: TypographyProperties = {
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 16,
                lineHeight: '1.5',
                textAlign: 'center',
                color: '#000000'
            };

            const result = convertTypographyToFigma(typography);

            expect(result.fontName).toEqual({ family: 'Inter', style: 'Bold' });
            expect(result.fontSize).toBe(16);
            expect(result.lineHeight).toEqual({ value: 150, unit: 'PERCENT' });
            expect(result.textAlignHorizontal).toBe('CENTER');
            expect(result.color).toBe('#000000');
        });

        it('deve mapear text-align corretamente', () => {
            expect(convertTypographyToFigma({ textAlign: 'left' }).textAlignHorizontal).toBe('LEFT');
            expect(convertTypographyToFigma({ textAlign: 'center' }).textAlignHorizontal).toBe('CENTER');
            expect(convertTypographyToFigma({ textAlign: 'right' }).textAlignHorizontal).toBe('RIGHT');
            expect(convertTypographyToFigma({ textAlign: 'justify' }).textAlignHorizontal).toBe('JUSTIFIED');
        });

        it('deve criar fontName mesmo com apenas fontWeight', () => {
            const result = convertTypographyToFigma({ fontWeight: 600 });
            expect(result.fontName).toEqual({ family: 'Inter', style: 'SemiBold' });
        });

        it('deve criar fontName mesmo com apenas fontFamily', () => {
            const result = convertTypographyToFigma({ fontFamily: 'Roboto' });
            expect(result.fontName).toEqual({ family: 'Roboto', style: 'Regular' });
        });

        it('deve lidar com propriedades opcionais ausentes', () => {
            const result = convertTypographyToFigma({});
            expect(result.fontName).toBeUndefined();
            expect(result.fontSize).toBeUndefined();
            expect(result.lineHeight).toBeUndefined();
        });

        it('deve incluir apenas propriedades definidas', () => {
            const result = convertTypographyToFigma({ fontSize: 16 });
            expect(result.fontSize).toBe(16);
            expect(Object.keys(result)).toEqual(['fontSize']);
        });
    });

    describe('buildFontFallbackList', () => {
        it('deve incluir fonte primária seguida de fallbacks', () => {
            const primary: FigmaFontName = { family: 'Custom Font', style: 'Bold' };
            const list = buildFontFallbackList(primary);

            expect(list[0]).toEqual(primary);
            expect(list.length).toBeGreaterThan(1);
            expect(list).toContainEqual({ family: 'Inter', style: 'Regular' });
        });

        it('deve retornar apenas fallbacks se não houver fonte primária', () => {
            const list = buildFontFallbackList();

            expect(list.length).toBe(FONT_FALLBACK_LIST.length);
            expect(list[0]).toEqual(FONT_FALLBACK_LIST[0]);
        });

        it('deve evitar duplicatas se primária for igual a fallback', () => {
            const primary: FigmaFontName = { family: 'Inter', style: 'Regular' };
            const list = buildFontFallbackList(primary);

            const interCount = list.filter(f => f.family === 'Inter' && f.style === 'Regular').length;
            expect(interCount).toBe(1);
        });

        it('deve manter ordem de prioridade', () => {
            const primary: FigmaFontName = { family: 'Montserrat', style: 'Bold' };
            const list = buildFontFallbackList(primary);

            expect(list[0].family).toBe('Montserrat');
            expect(list[1].family).toBe('Inter'); // primeiro fallback
        });

        it('deve incluir todos os fallbacks padrão', () => {
            const list = buildFontFallbackList();

            expect(list).toContainEqual({ family: 'Inter', style: 'Regular' });
            expect(list).toContainEqual({ family: 'Roboto', style: 'Regular' });
            expect(list).toContainEqual({ family: 'Arial', style: 'Regular' });
        });
    });

    describe('Edge cases', () => {
        it('deve lidar com font-family com múltiplas fontes e espaços', () => {
            const result = buildFigmaFontName('  "Open Sans"  ,  Arial  ,  sans-serif  ', 400);
            expect(result.family).toBe('Open Sans');
        });

        it('deve lidar com line-height inválido gracefully', () => {
            const result = parseLineHeight('invalid-value');
            expect(result).toBeUndefined();
        });

        it('deve lidar com valores negativos', () => {
            expect(mapFontWeightToStyle(-100)).toBe('Regular'); // valores negativos retornam Regular
            expect(parseFontSize('-10px')).toBeUndefined(); // valores negativos são inválidos
        });

        it('deve lidar com objetos vazios em convertTypographyToFigma', () => {
            const result = convertTypographyToFigma({});
            expect(Object.keys(result).length).toBe(0);
        });
    });
});
