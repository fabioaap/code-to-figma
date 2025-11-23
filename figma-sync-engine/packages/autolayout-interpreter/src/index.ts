/**
 * MVP-4, AL-1, AL-2: Auto Layout Engine
 * Converte propriedades CSS de flexbox para campos Figma equivalentes
 */

import { FigmaNode } from './types';

/**
 * Snapshot de propriedades CSS relevantes
 */
export interface CssSnapshot {
    display?: string;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    gap?: string;
    padding?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    margin?: string;
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    // AL-7: Tipografia
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string | number;
    lineHeight?: string;
    color?: string;
    [key: string]: any;
}

/**
 * Resultado da análise CSS
 */
export interface CssAnalysis {
    isFlex: boolean;
    isRow: boolean;
    gap: number;
    padding: { top: number; right: number; bottom: number; left: number };
    alignItems?: string;
    justifyContent?: string;
}

/**
 * AL-7: Tipografia extraída do CSS
 */
export interface TypographyStyle {
    fontFamily: string;
    fontStyle: string; // 'Regular', 'Bold', 'Italic', etc.
    fontSize: number;
    lineHeight?: { value: number; unit: 'PIXELS' | 'PERCENT' };
    letterSpacing?: { value: number; unit: 'PIXELS' | 'PERCENT' };
}

/**
 * Parser de valor de espaçamento (px, rem, em, etc)
 */
export function parseSpacing(value?: string): number {
    if (!value) return 0;
    const match = value.match(/^([\d.]+)/);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Normaliza padding/margin para [top, right, bottom, left]
 * Suporta: 1, 2, 3 ou 4 valores (CSS padrão)
 * AL-1: Parser robusto com cobertura de casos 1/2/3/4 valores
 */
export function normalizePadding(
    paddingStr?: string,
    topOverride?: string,
    rightOverride?: string,
    bottomOverride?: string,
    leftOverride?: string
): { top: number; right: number; bottom: number; left: number } {
    let top = 0, right = 0, bottom = 0, left = 0;

    // Primeiro, parse do padding geral
    if (paddingStr) {
        const parts = paddingStr.trim().split(/\s+/).map(parseSpacing);
        if (parts.length === 1) {
            top = right = bottom = left = parts[0];
        } else if (parts.length === 2) {
            top = bottom = parts[0];
            right = left = parts[1];
        } else if (parts.length === 3) {
            top = parts[0];
            right = left = parts[1];
            bottom = parts[2];
        } else if (parts.length >= 4) {
            top = parts[0];
            right = parts[1];
            bottom = parts[2];
            left = parts[3];
        }
    }

    // Depois, aplicar overrides específicos (paddingTop, etc)
    if (topOverride !== undefined) top = parseSpacing(topOverride);
    if (rightOverride !== undefined) right = parseSpacing(rightOverride);
    if (bottomOverride !== undefined) bottom = parseSpacing(bottomOverride);
    if (leftOverride !== undefined) left = parseSpacing(leftOverride);

    return { top, right, bottom, left };
}

/**
 * Detecta direção do flex com fallback robusto
 * AL-3: Detecção de direção com fallback para HORIZONTAL
 */
export function detectFlexDirection(flexDirection?: string): 'HORIZONTAL' | 'VERTICAL' {
    if (!flexDirection) {
        // Fallback: quando não especificado, usa HORIZONTAL (padrão CSS flex-direction: row)
        return 'HORIZONTAL';
    }

    // Normaliza para lowercase e remove espaços
    const normalized = flexDirection.toLowerCase().trim();

    // Mapeia valores CSS para Figma layoutMode
    if (normalized === 'column' || normalized === 'column-reverse') {
        return 'VERTICAL';
    }

    // row, row-reverse, ou qualquer valor inválido -> HORIZONTAL (fallback)
    return 'HORIZONTAL';
}

/**
 * Analisa propriedades CSS
 */
export function analyzeCss(css: CssSnapshot): CssAnalysis {
    const isFlex = css.display === 'flex';
    const isRow = detectFlexDirection(css.flexDirection) === 'HORIZONTAL';

    const padding = normalizePadding(
        css.padding,
        css.paddingTop,
        css.paddingRight,
        css.paddingBottom,
        css.paddingLeft
    );

    return {
        isFlex,
        isRow,
        gap: parseSpacing(css.gap),
        padding,
        alignItems: css.alignItems,
        justifyContent: css.justifyContent
    };
}

/**
 * Mapeia align-items CSS para alignMode Figma
 * AL-2: Suporte a align-items (sempre secundário)
 */
export function mapAlignItems(
    alignItems?: string,
    _isRow: boolean = true
): 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | undefined {
    if (!alignItems) return undefined;

    switch (alignItems) {
        case 'flex-start':
            return 'MIN';
        case 'center':
            return 'CENTER';
        case 'flex-end':
            return 'MAX';
        case 'stretch':
            return 'STRETCH';
        default:
            return undefined;
    }
}

/**
 * Mapeia justify-content CSS para alignMode Figma
 * AL-2: Suporte a justify-content (sempre no eixo primário)
 */
export function mapJustifyContent(
    justifyContent?: string
): 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN' | undefined {
    if (!justifyContent) return undefined;

    switch (justifyContent) {
        case 'flex-start':
            return 'MIN';
        case 'center':
            return 'CENTER';
        case 'flex-end':
            return 'MAX';
        case 'space-between':
            return 'SPACE_BETWEEN';
        default:
            return undefined;
    }
}

/**
 * Aplica Auto Layout heurístico a um nó Figma baseado em CSS
 * MVP-4: Integração completa de sanitização CSS → Figma
 */
export function applyAutoLayout(node: FigmaNode, css: CssSnapshot): FigmaNode {
    const analysis = analyzeCss(css);

    if (!analysis.isFlex) {
        return node;
    }

    // Configurar modo de layout
    node.layoutMode = analysis.isRow ? 'HORIZONTAL' : 'VERTICAL';

    // Configurar espaçamento entre itens
    if (analysis.gap > 0) {
        node.itemSpacing = analysis.gap;
    }

    // Configurar padding
    const { top, right, bottom, left } = analysis.padding;
    if (top > 0) node.paddingTop = top;
    if (right > 0) node.paddingRight = right;
    if (bottom > 0) node.paddingBottom = bottom;
    if (left > 0) node.paddingLeft = left;

    // Configurar alinhamento no eixo primário (justify-content)
    const primaryAlign = mapJustifyContent(analysis.justifyContent);
    if (primaryAlign) {
        node.primaryAxisAlignItems = primaryAlign;
    }

    // Configurar alinhamento no eixo secundário (align-items)
    const counterAlign = mapAlignItems(analysis.alignItems, analysis.isRow);
    if (counterAlign) {
        node.counterAxisAlignItems = counterAlign;
    }

    // Processar filhos recursivamente
    if (node.children) {
        node.children = node.children.map(child => ({ ...child }));
    }

    return node;
}

/**
 * Aplica Auto Layout recursivamente a toda árvore
 */
export function applyAutoLayoutRecursive(
    node: FigmaNode,
    getCss: (node: FigmaNode) => CssSnapshot = () => ({})
): FigmaNode {
    const css = getCss(node);
    const processed = applyAutoLayout(node, css);

    if (processed.children) {
        processed.children = processed.children.map(child =>
            applyAutoLayoutRecursive(child, getCss)
        );
    }

    return processed;
}

/**
 * AL-7: Mapeia font-weight CSS para estilo Figma
 */
export function mapFontWeight(weight?: string | number): string {
    if (!weight) return 'Regular';

    // Converte número para string se necessário
    const weightStr = String(weight).toLowerCase();

    // Mapeamento de pesos CSS para estilos Figma
    const weightMap: { [key: string]: string } = {
        '100': 'Thin',
        'thin': 'Thin',
        '200': 'Extra Light',
        'extralight': 'Extra Light',
        'extra-light': 'Extra Light',
        '300': 'Light',
        'light': 'Light',
        '400': 'Regular',
        'normal': 'Regular',
        'regular': 'Regular',
        '500': 'Medium',
        'medium': 'Medium',
        '600': 'Semi Bold',
        'semibold': 'Semi Bold',
        'semi-bold': 'Semi Bold',
        '700': 'Bold',
        'bold': 'Bold',
        '800': 'Extra Bold',
        'extrabold': 'Extra Bold',
        'extra-bold': 'Extra Bold',
        '900': 'Black',
        'black': 'Black'
    };

    return weightMap[weightStr] || 'Regular';
}

/**
 * AL-7: Extrai família de fonte principal (primeira da lista)
 */
export function extractFontFamily(fontFamily?: string): string {
    if (!fontFamily) return 'Inter';

    // Remove aspas e pega a primeira fonte da lista
    const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
    
    // Filtra fontes genéricas (sans-serif, serif, etc)
    const specificFonts = fonts.filter(f => 
        !['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui'].includes(f.toLowerCase())
    );

    // Se só temos fontes genéricas, usa Inter como fallback
    if (specificFonts.length === 0) return 'Inter';

    return specificFonts[0] || 'Inter';
}

/**
 * AL-7: Converte line-height CSS para formato Figma
 */
export function parseLineHeight(lineHeight?: string, fontSize: number = 16): { value: number; unit: 'PIXELS' | 'PERCENT' } | undefined {
    if (!lineHeight || lineHeight === 'normal') return undefined;

    // Se for número puro (unitless), é multiplicador do font-size
    const numericMatch = lineHeight.match(/^([\d.]+)$/);
    if (numericMatch) {
        const multiplier = parseFloat(numericMatch[1]);
        return {
            value: Math.round(multiplier * 100),
            unit: 'PERCENT'
        };
    }

    // Se for em pixels
    const pxMatch = lineHeight.match(/^([\d.]+)px$/);
    if (pxMatch) {
        return {
            value: parseFloat(pxMatch[1]),
            unit: 'PIXELS'
        };
    }

    // Se for em porcentagem
    const percentMatch = lineHeight.match(/^([\d.]+)%$/);
    if (percentMatch) {
        return {
            value: parseFloat(percentMatch[1]),
            unit: 'PERCENT'
        };
    }

    return undefined;
}

/**
 * AL-7: Extrai tipografia completa do CSS
 */
export function extractTypography(css: CssSnapshot): TypographyStyle {
    const fontFamily = extractFontFamily(css.fontFamily);
    const fontStyle = mapFontWeight(css.fontWeight);
    const fontSize = parseSpacing(css.fontSize) || 16;
    const lineHeight = parseLineHeight(css.lineHeight, fontSize);

    return {
        fontFamily,
        fontStyle,
        fontSize,
        lineHeight
    };
}

/**
 * AL-7: Aplica tipografia a um nó TEXT do Figma
 */
export function applyTypography(node: FigmaNode, css: CssSnapshot): FigmaNode {
    // Só aplica tipografia em nós TEXT
    if (node.type !== 'TEXT') return node;

    const typography = extractTypography(css);

    // Aplica propriedades de fonte
    node.fontName = {
        family: typography.fontFamily,
        style: typography.fontStyle
    };

    node.fontSize = typography.fontSize;

    if (typography.lineHeight) {
        node.lineHeight = typography.lineHeight;
    }

    // Aplica cor do texto se disponível
    if (css.color) {
        // Converte cor CSS para formato Figma se necessário
        node.color = css.color;
    }

    return node;
}

