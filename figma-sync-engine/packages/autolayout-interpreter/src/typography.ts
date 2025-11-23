/**
 * TOK-2: Módulo de Extração de Tokens de Tipografia
 * Converte propriedades CSS de texto para formato normalizado compatível com Figma
 */

import { TypographyToken } from './types';

/**
 * Snapshot de propriedades CSS de tipografia
 */
export interface CssTypographySnapshot {
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string | number;
    lineHeight?: string;
    letterSpacing?: string;
    textAlign?: string;
    textTransform?: string;
}

/**
 * Parser de fontSize (suporta px, rem, em)
 * Padrão: 16px
 * 
 * @param value - Valor CSS (ex: '14px', '1rem', '1.5em')
 * @returns Tamanho em pixels
 */
export function parseFontSize(value?: string): number {
    if (!value) return 16;
    
    const trimmed = value.trim();
    if (!trimmed) return 16;
    
    // Extrair número e unidade
    const match = trimmed.match(/^([\d.]+)(px|rem|em)?$/);
    if (!match) return 16;
    
    const num = parseFloat(match[1]);
    if (isNaN(num) || num <= 0) return 16;
    
    const unit = match[2] || 'px';
    
    // Conversão de unidades
    switch (unit) {
        case 'rem':
            return Math.round(num * 16); // 1rem = 16px (padrão navegador)
        case 'em':
            return Math.round(num * 16); // 1em = 16px (contexto base)
        case 'px':
        default:
            return Math.round(num);
    }
}

/**
 * Parser de fontWeight (normaliza para 100-900)
 * Padrão: 400 (normal)
 * 
 * @param value - Valor CSS (ex: 'normal', 'bold', '500', 500)
 * @returns Peso numérico entre 100-900
 */
export function parseFontWeight(value?: string | number): number {
    if (!value) return 400;
    
    // Se já é número, validar range
    if (typeof value === 'number') {
        if (value >= 100 && value <= 900) {
            return Math.round(value / 100) * 100; // Arredondar para centenas
        }
        return 400;
    }
    
    const trimmed = value.trim().toLowerCase();
    
    // Mapear keywords
    switch (trimmed) {
        case 'normal':
            return 400;
        case 'bold':
            return 700;
        case 'lighter':
            return 300;
        case 'bolder':
            return 600;
        default:
            break;
    }
    
    // Tentar parsear como número
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num >= 100 && num <= 900) {
        return Math.round(num / 100) * 100; // Arredondar para centenas
    }
    
    return 400;
}

/**
 * Parser de lineHeight (suporta unitless, px, %)
 * Padrão: 'normal'
 * 
 * @param value - Valor CSS (ex: '1.5', '24px', '150%')
 * @param fontSize - Tamanho da fonte base para cálculo (padrão: 16px)
 * @returns Altura da linha em pixels ou 'normal'
 */
export function parseLineHeight(value?: string, fontSize: number = 16): number | 'normal' {
    if (!value) return 'normal';
    
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || trimmed === 'normal') return 'normal';
    
    // Unitless (multiplicador do fontSize)
    if (/^[\d.]+$/.test(trimmed)) {
        const multiplier = parseFloat(trimmed);
        if (!isNaN(multiplier) && multiplier > 0) {
            return Math.round(fontSize * multiplier);
        }
        return 'normal';
    }
    
    // Pixels
    const pxMatch = trimmed.match(/^([\d.]+)px$/);
    if (pxMatch) {
        const num = parseFloat(pxMatch[1]);
        if (!isNaN(num) && num > 0) {
            return Math.round(num);
        }
        return 'normal';
    }
    
    // Porcentagem
    const percentMatch = trimmed.match(/^([\d.]+)%$/);
    if (percentMatch) {
        const percent = parseFloat(percentMatch[1]);
        if (!isNaN(percent) && percent > 0) {
            return Math.round((fontSize * percent) / 100);
        }
        return 'normal';
    }
    
    // rem/em
    const remMatch = trimmed.match(/^([\d.]+)(rem|em)$/);
    if (remMatch) {
        const num = parseFloat(remMatch[1]);
        if (!isNaN(num) && num > 0) {
            return Math.round(num * 16);
        }
        return 'normal';
    }
    
    return 'normal';
}

/**
 * Parser de letterSpacing (converte para pixels)
 * Padrão: 0
 * 
 * @param value - Valor CSS (ex: '0.5px', '-0.02em', '1rem')
 * @returns Espaçamento em pixels (pode ser negativo)
 */
export function parseLetterSpacing(value?: string): number {
    if (!value) return 0;
    
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || trimmed === 'normal') return 0;
    
    // Pixels
    const pxMatch = trimmed.match(/^(-?[\d.]+)px$/);
    if (pxMatch) {
        const num = parseFloat(pxMatch[1]);
        return isNaN(num) ? 0 : num;
    }
    
    // rem
    const remMatch = trimmed.match(/^(-?[\d.]+)rem$/);
    if (remMatch) {
        const num = parseFloat(remMatch[1]);
        return isNaN(num) ? 0 : num * 16;
    }
    
    // em (usa 16px como base)
    const emMatch = trimmed.match(/^(-?[\d.]+)em$/);
    if (emMatch) {
        const num = parseFloat(emMatch[1]);
        return isNaN(num) ? 0 : num * 16;
    }
    
    // Unitless (trata como pixels)
    const unitless = parseFloat(trimmed);
    return isNaN(unitless) ? 0 : unitless;
}

/**
 * Parser de textAlign (mapeia para valores Figma)
 * Padrão: undefined (usa padrão do Figma)
 * 
 * @param value - Valor CSS (ex: 'left', 'center', 'right', 'justify')
 * @returns Alinhamento Figma ou undefined
 */
export function parseTextAlign(value?: string): 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED' | undefined {
    if (!value) return undefined;
    
    const trimmed = value.trim().toLowerCase();
    
    switch (trimmed) {
        case 'left':
            return 'LEFT';
        case 'center':
            return 'CENTER';
        case 'right':
            return 'RIGHT';
        case 'justify':
            return 'JUSTIFIED';
        default:
            return undefined;
    }
}

/**
 * Parser de textTransform (mapeia para valores Figma)
 * Padrão: 'ORIGINAL'
 * 
 * @param value - Valor CSS (ex: 'uppercase', 'lowercase', 'capitalize', 'none')
 * @returns Transformação Figma
 */
export function parseTextTransform(value?: string): 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' | undefined {
    if (!value) return undefined;
    
    const trimmed = value.trim().toLowerCase();
    
    switch (trimmed) {
        case 'uppercase':
            return 'UPPER';
        case 'lowercase':
            return 'LOWER';
        case 'capitalize':
            return 'TITLE';
        case 'none':
            return 'ORIGINAL';
        default:
            return undefined;
    }
}

/**
 * Extrai e normaliza fontFamily (usa primeira da lista)
 * Padrão: 'Inter'
 * 
 * @param value - Valor CSS (ex: 'Inter, sans-serif', '"Roboto Mono", monospace')
 * @returns Nome da primeira fonte
 */
export function parseFontFamily(value?: string): string {
    if (!value) return 'Inter';
    
    const trimmed = value.trim();
    if (!trimmed) return 'Inter';
    
    // Pegar primeira fonte da lista
    const fonts = trimmed.split(',');
    let firstFont = fonts[0].trim();
    
    // Remover aspas se existirem
    firstFont = firstFont.replace(/^["']|["']$/g, '');
    
    // Ignorar fontes genéricas (sans-serif, serif, monospace, etc)
    const genericFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
    if (genericFonts.includes(firstFont.toLowerCase())) {
        // Se só tem fonte genérica, usar Inter como fallback
        if (fonts.length === 1) {
            return 'Inter';
        }
        // Tentar próxima fonte
        if (fonts.length > 1) {
            const secondFont = fonts[1].trim().replace(/^["']|["']$/g, '');
            if (!genericFonts.includes(secondFont.toLowerCase())) {
                return secondFont;
            }
        }
        return 'Inter';
    }
    
    return firstFont;
}

/**
 * Extrai token completo de tipografia a partir de snapshot CSS
 * TOK-2: Função principal de extração
 * 
 * @param css - Snapshot de propriedades CSS
 * @returns Token de tipografia normalizado ou null se não houver dados
 */
export function extractTypographyToken(css: CssTypographySnapshot): TypographyToken | null {
    // Se não tem nenhuma propriedade de tipografia, retornar null
    if (!css.fontSize && !css.fontFamily && !css.fontWeight && 
        !css.lineHeight && !css.letterSpacing && !css.textAlign && !css.textTransform) {
        return null;
    }
    
    const fontSize = parseFontSize(css.fontSize);
    const fontFamily = parseFontFamily(css.fontFamily);
    const fontWeight = parseFontWeight(css.fontWeight);
    const lineHeight = parseLineHeight(css.lineHeight, fontSize);
    const letterSpacing = parseLetterSpacing(css.letterSpacing);
    const textAlign = parseTextAlign(css.textAlign);
    const textTransform = parseTextTransform(css.textTransform);
    
    const token: TypographyToken = {
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing
    };
    
    // Adicionar propriedades opcionais apenas se definidas
    if (textAlign) {
        token.textAlign = textAlign;
    }
    
    if (textTransform) {
        token.textTransform = textTransform;
    }
    
    return token;
}
