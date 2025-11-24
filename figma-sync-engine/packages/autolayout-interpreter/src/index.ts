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
 * Detecta direção do layout baseado em flex-direction
 * AL-3: Detecção robusta de direção com fallback para HORIZONTAL
 */
export function detectLayoutDirection(css: CssSnapshot): boolean {
    // Se flexDirection está explicitamente definido
    if (css.flexDirection) {
        // row ou row-reverse → HORIZONTAL (isRow = true)
        if (css.flexDirection === 'row' || css.flexDirection === 'row-reverse') {
            return true;
        }
        // column ou column-reverse → VERTICAL (isRow = false)
        if (css.flexDirection === 'column' || css.flexDirection === 'column-reverse') {
            return false;
        }
    }
    
    // Se display é flex mas flexDirection não está definido → HORIZONTAL (default)
    // Qualquer outro caso → HORIZONTAL (fallback)
    return true;
}

/**
 * Analisa propriedades CSS
 */
export function analyzeCss(css: CssSnapshot): CssAnalysis {
    const isFlex = css.display === 'flex';
    const isRow = detectLayoutDirection(css);

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

