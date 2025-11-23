import { describe, it, expect } from 'vitest';
import {
    parseFontSize,
    parseFontWeight,
    parseLineHeight,
    parseLetterSpacing,
    parseTextAlign,
    parseTextTransform,
    parseFontFamily,
    extractTypographyToken,
    CssTypographySnapshot
} from './typography';

describe('typography - TOK-2: Extração de Tokens de Tipografia', () => {
    describe('parseFontSize', () => {
        it('deve parsear valores em pixels', () => {
            expect(parseFontSize('14px')).toBe(14);
            expect(parseFontSize('16px')).toBe(16);
            expect(parseFontSize('24px')).toBe(24);
        });

        it('deve parsear valores em rem (1rem = 16px)', () => {
            expect(parseFontSize('1rem')).toBe(16);
            expect(parseFontSize('1.5rem')).toBe(24);
            expect(parseFontSize('0.875rem')).toBe(14);
        });

        it('deve parsear valores em em (usa base 16px)', () => {
            expect(parseFontSize('1em')).toBe(16);
            expect(parseFontSize('1.5em')).toBe(24);
            expect(parseFontSize('0.875em')).toBe(14);
        });

        it('deve arredondar valores decimais', () => {
            expect(parseFontSize('14.5px')).toBe(15);
            expect(parseFontSize('14.4px')).toBe(14);
            expect(parseFontSize('1.25rem')).toBe(20);
        });

        it('deve retornar 16 (padrão) para valores inválidos', () => {
            expect(parseFontSize('')).toBe(16);
            expect(parseFontSize(undefined)).toBe(16);
            expect(parseFontSize('invalid')).toBe(16);
            expect(parseFontSize('0px')).toBe(16);
            expect(parseFontSize('-10px')).toBe(16);
        });
    });

    describe('parseFontWeight', () => {
        it('deve parsear números válidos (100-900)', () => {
            expect(parseFontWeight(400)).toBe(400);
            expect(parseFontWeight(700)).toBe(700);
            expect(parseFontWeight('500')).toBe(500);
        });

        it('deve mapear keywords para números', () => {
            expect(parseFontWeight('normal')).toBe(400);
            expect(parseFontWeight('bold')).toBe(700);
            expect(parseFontWeight('lighter')).toBe(300);
            expect(parseFontWeight('bolder')).toBe(600);
        });

        it('deve arredondar para centenas (100, 200, ... 900)', () => {
            expect(parseFontWeight(450)).toBe(500);
            expect(parseFontWeight(350)).toBe(400);
            expect(parseFontWeight('550')).toBe(600);
        });

        it('deve retornar 400 (padrão) para valores inválidos', () => {
            expect(parseFontWeight('')).toBe(400);
            expect(parseFontWeight(undefined)).toBe(400);
            expect(parseFontWeight('invalid')).toBe(400);
            expect(parseFontWeight(50)).toBe(400);
            expect(parseFontWeight(1000)).toBe(400);
        });

        it('deve ignorar case em keywords', () => {
            expect(parseFontWeight('NORMAL')).toBe(400);
            expect(parseFontWeight('Bold')).toBe(700);
            expect(parseFontWeight('  normal  ')).toBe(400);
        });
    });

    describe('parseLineHeight', () => {
        it('deve parsear valores unitless (multiplicador)', () => {
            expect(parseLineHeight('1.5', 16)).toBe(24);
            expect(parseLineHeight('1.2', 20)).toBe(24);
            expect(parseLineHeight('2', 14)).toBe(28);
        });

        it('deve parsear valores em pixels', () => {
            expect(parseLineHeight('20px')).toBe(20);
            expect(parseLineHeight('24px')).toBe(24);
            expect(parseLineHeight('18.5px')).toBe(19);
        });

        it('deve parsear valores em porcentagem', () => {
            expect(parseLineHeight('150%', 16)).toBe(24);
            expect(parseLineHeight('120%', 20)).toBe(24);
            expect(parseLineHeight('100%', 18)).toBe(18);
        });

        it('deve parsear valores em rem/em', () => {
            expect(parseLineHeight('1.5rem')).toBe(24);
            expect(parseLineHeight('1em')).toBe(16);
        });

        it('deve retornar "normal" para valores padrão/inválidos', () => {
            expect(parseLineHeight('normal')).toBe('normal');
            expect(parseLineHeight('')).toBe('normal');
            expect(parseLineHeight(undefined)).toBe('normal');
            expect(parseLineHeight('invalid')).toBe('normal');
            expect(parseLineHeight('0px')).toBe('normal');
            expect(parseLineHeight('-10px')).toBe('normal');
        });

        it('deve usar fontSize padrão (16px) quando não fornecido', () => {
            expect(parseLineHeight('1.5')).toBe(24); // 16 * 1.5
            expect(parseLineHeight('150%')).toBe(24); // 16 * 1.5
        });
    });

    describe('parseLetterSpacing', () => {
        it('deve parsear valores positivos em pixels', () => {
            expect(parseLetterSpacing('0.5px')).toBe(0.5);
            expect(parseLetterSpacing('1px')).toBe(1);
            expect(parseLetterSpacing('2px')).toBe(2);
        });

        it('deve parsear valores negativos em pixels', () => {
            expect(parseLetterSpacing('-0.5px')).toBe(-0.5);
            expect(parseLetterSpacing('-1px')).toBe(-1);
        });

        it('deve parsear valores em rem', () => {
            expect(parseLetterSpacing('0.5rem')).toBe(8);
            expect(parseLetterSpacing('1rem')).toBe(16);
            expect(parseLetterSpacing('-0.5rem')).toBe(-8);
        });

        it('deve parsear valores em em', () => {
            expect(parseLetterSpacing('0.5em')).toBe(8);
            expect(parseLetterSpacing('1em')).toBe(16);
        });

        it('deve parsear valores unitless (trata como pixels)', () => {
            expect(parseLetterSpacing('0.5')).toBe(0.5);
            expect(parseLetterSpacing('-1')).toBe(-1);
        });

        it('deve retornar 0 (padrão) para valores inválidos', () => {
            expect(parseLetterSpacing('')).toBe(0);
            expect(parseLetterSpacing(undefined)).toBe(0);
            expect(parseLetterSpacing('normal')).toBe(0);
            expect(parseLetterSpacing('invalid')).toBe(0);
        });
    });

    describe('parseTextAlign', () => {
        it('deve mapear valores CSS para Figma', () => {
            expect(parseTextAlign('left')).toBe('LEFT');
            expect(parseTextAlign('center')).toBe('CENTER');
            expect(parseTextAlign('right')).toBe('RIGHT');
            expect(parseTextAlign('justify')).toBe('JUSTIFIED');
        });

        it('deve retornar undefined para valores inválidos', () => {
            expect(parseTextAlign('')).toBeUndefined();
            expect(parseTextAlign(undefined)).toBeUndefined();
            expect(parseTextAlign('invalid')).toBeUndefined();
        });

        it('deve ignorar case', () => {
            expect(parseTextAlign('LEFT')).toBe('LEFT');
            expect(parseTextAlign('Center')).toBe('CENTER');
            expect(parseTextAlign('  right  ')).toBe('RIGHT');
        });
    });

    describe('parseTextTransform', () => {
        it('deve mapear valores CSS para Figma', () => {
            expect(parseTextTransform('uppercase')).toBe('UPPER');
            expect(parseTextTransform('lowercase')).toBe('LOWER');
            expect(parseTextTransform('capitalize')).toBe('TITLE');
            expect(parseTextTransform('none')).toBe('ORIGINAL');
        });

        it('deve retornar undefined para valores inválidos', () => {
            expect(parseTextTransform('')).toBeUndefined();
            expect(parseTextTransform(undefined)).toBeUndefined();
            expect(parseTextTransform('invalid')).toBeUndefined();
        });

        it('deve ignorar case', () => {
            expect(parseTextTransform('UPPERCASE')).toBe('UPPER');
            expect(parseTextTransform('LowerCase')).toBe('LOWER');
        });
    });

    describe('parseFontFamily', () => {
        it('deve extrair primeira fonte da lista', () => {
            expect(parseFontFamily('Inter, sans-serif')).toBe('Inter');
            expect(parseFontFamily('Roboto, Arial, sans-serif')).toBe('Roboto');
            expect(parseFontFamily('Helvetica Neue, Helvetica, sans-serif')).toBe('Helvetica Neue');
        });

        it('deve remover aspas', () => {
            expect(parseFontFamily('"Roboto Mono", monospace')).toBe('Roboto Mono');
            expect(parseFontFamily("'Open Sans', sans-serif")).toBe('Open Sans');
            expect(parseFontFamily('"Inter"')).toBe('Inter');
        });

        it('deve ignorar fontes genéricas sozinhas', () => {
            expect(parseFontFamily('sans-serif')).toBe('Inter');
            expect(parseFontFamily('serif')).toBe('Inter');
            expect(parseFontFamily('monospace')).toBe('Inter');
            expect(parseFontFamily('system-ui')).toBe('Inter');
        });

        it('deve pular fontes genéricas e usar próxima', () => {
            expect(parseFontFamily('sans-serif, Inter')).toBe('Inter');
            expect(parseFontFamily('system-ui, Roboto')).toBe('Roboto');
        });

        it('deve retornar "Inter" (padrão) para valores inválidos', () => {
            expect(parseFontFamily('')).toBe('Inter');
            expect(parseFontFamily(undefined)).toBe('Inter');
            expect(parseFontFamily('  ')).toBe('Inter');
        });

        it('deve lidar com múltiplas aspas e espaços', () => {
            expect(parseFontFamily('  "Roboto"  ,  sans-serif  ')).toBe('Roboto');
        });
    });

    describe('extractTypographyToken', () => {
        it('deve extrair token completo com todos os campos', () => {
            const css: CssTypographySnapshot = {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                lineHeight: '1.5',
                letterSpacing: '0.5px',
                textAlign: 'center',
                textTransform: 'uppercase'
            };

            const token = extractTypographyToken(css);

            expect(token).toEqual({
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 21, // 14 * 1.5
                letterSpacing: 0.5,
                textAlign: 'CENTER',
                textTransform: 'UPPER'
            });
        });

        it('deve usar valores padrão quando propriedades ausentes', () => {
            const css: CssTypographySnapshot = {
                fontSize: '16px'
            };

            const token = extractTypographyToken(css);

            expect(token).toEqual({
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 'normal',
                letterSpacing: 0
            });
        });

        it('deve omitir propriedades opcionais quando undefined', () => {
            const css: CssTypographySnapshot = {
                fontSize: '16px',
                fontFamily: 'Roboto'
            };

            const token = extractTypographyToken(css);

            expect(token?.textAlign).toBeUndefined();
            expect(token?.textTransform).toBeUndefined();
        });

        it('deve retornar null quando não há propriedades de tipografia', () => {
            const css: CssTypographySnapshot = {};
            const token = extractTypographyToken(css);
            expect(token).toBeNull();
        });

        it('deve processar exemplo real do Storybook', () => {
            const css: CssTypographySnapshot = {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                lineHeight: '20px',
                letterSpacing: '0px'
            };

            const token = extractTypographyToken(css);

            expect(token).toEqual({
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 20,
                letterSpacing: 0
            });
        });

        it('deve processar valores com keywords', () => {
            const css: CssTypographySnapshot = {
                fontSize: '1rem',
                fontWeight: 'bold',
                lineHeight: 'normal',
                letterSpacing: 'normal'
            };

            const token = extractTypographyToken(css);

            expect(token).toEqual({
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 'normal',
                letterSpacing: 0
            });
        });

        it('deve processar valores negativos de letter-spacing', () => {
            const css: CssTypographySnapshot = {
                fontSize: '24px',
                letterSpacing: '-0.02em'
            };

            const token = extractTypographyToken(css);

            expect(token?.letterSpacing).toBe(-0.32); // -0.02 * 16
        });

        it('deve processar line-height em porcentagem', () => {
            const css: CssTypographySnapshot = {
                fontSize: '20px',
                lineHeight: '150%'
            };

            const token = extractTypographyToken(css);

            expect(token?.lineHeight).toBe(30); // 20 * 1.5
        });
    });

    describe('Edge cases', () => {
        it('deve lidar com valores com muito whitespace', () => {
            expect(parseFontSize('  14px  ')).toBe(14);
            expect(parseFontWeight('  bold  ')).toBe(700);
            expect(parseFontFamily('  Inter  ,  sans-serif  ')).toBe('Inter');
        });

        it('deve lidar com valores mistos válidos e inválidos', () => {
            const css: CssTypographySnapshot = {
                fontSize: 'invalid',
                fontWeight: '999999',
                lineHeight: 'invalid',
                letterSpacing: 'invalid'
            };

            const token = extractTypographyToken(css);

            expect(token).toEqual({
                fontFamily: 'Inter',
                fontSize: 16, // padrão
                fontWeight: 400, // padrão
                lineHeight: 'normal', // padrão
                letterSpacing: 0 // padrão
            });
        });

        it('deve processar fontWeight numérico direto', () => {
            const css: CssTypographySnapshot = {
                fontWeight: 600
            };

            const token = extractTypographyToken(css);
            expect(token?.fontWeight).toBe(600);
        });

        it('deve processar fontes com espaços no nome', () => {
            expect(parseFontFamily('Helvetica Neue')).toBe('Helvetica Neue');
            expect(parseFontFamily('"Roboto Mono", monospace')).toBe('Roboto Mono');
        });

        it('deve arredondar lineHeight corretamente', () => {
            expect(parseLineHeight('1.42857', 14)).toBe(20); // 14 * 1.42857 = 20
            expect(parseLineHeight('1.5', 13)).toBe(20); // 13 * 1.5 = 19.5 → 20
        });
    });
});
