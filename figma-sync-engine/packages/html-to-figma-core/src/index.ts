/**
 * Core module para conversão de HTML → JSON Figma.
 * MVP-3: Wrapper e extensões sobre @builder.io/html-to-figma
 */

import { htmlToFigma } from '@builder.io/html-to-figma';
export * from '@builder.io/html-to-figma';
export * from './tokens';

/**
 * Interface para resultado de conversão
 */
export interface ConversionResult {
    type?: string;
    id?: string;
    name?: string;
    children?: ConversionResult[];
    [key: string]: any;
}

/**
 * Opções de conversão
 */
export interface ConvertOptions {
    imagePlaceholders?: boolean;
    width?: number;
    height?: number;
}

/**
 * Converte HTML para JSON compatível com Figma
 * 
 * @param html - String HTML a ser convertida
 * @param options - Opções de conversão
 * @returns Promise com estrutura JSON para Figma
 * 
 * @example
 * const html = '<div style="display: flex; gap: 12px;"><button>Click</button></div>';
 * const result = await convertHtmlToFigma(html);
 * console.log(result);
 */
export async function convertHtmlToFigma(
    htmlString: string,
    options: ConvertOptions = {}
): Promise<ConversionResult> {
    try {
        if (!htmlString || htmlString.trim().length === 0) {
            throw new Error('HTML input is empty');
        }

        // Usa htmlToFigma da biblioteca
        const figmaJson = await htmlToFigma(htmlString);

        if (!figmaJson) {
            throw new Error('Failed to convert HTML to Figma');
        }

        return figmaJson as ConversionResult;
    } catch (error) {
        throw new Error(
            `Failed to convert HTML to Figma: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Versão assíncrona com suporte a imagens
 */
export async function convertHtmlToFigmaWithImages(
    htmlString: string,
    options: ConvertOptions = {}
): Promise<ConversionResult> {
    try {
        const result = await convertHtmlToFigma(htmlString, options);

        // Futuro: processar imagens se necessário
        if (options.imagePlaceholders) {
            // Placeholder para processamento de imagens
            await processImages(result);
        }

        return result;
    } catch (error) {
        throw new Error(
            `Failed to convert HTML with images: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Placeholder para processamento recursivo de imagens
 */
async function processImages(node: ConversionResult): Promise<void> {
    // TODO: Implementar após MVP-3 base
    // Pode incluir:
    // - Download de imagens remotas
    // - Conversão para base64
    // - Integração com Figma Assets
}

/**
 * AL-7: Estrutura de estilos de tipografia
 */
export interface TextStyles {
    fontFamily: string;
    fontSize: number;
    fontWeight: number | string;
    lineHeight: number | string;
    letterSpacing: number;
    textAlign: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    textDecoration?: string;
}

/**
 * AL-7: Extrai estilos de tipografia de um elemento HTML
 */
export function extractTextStyles(computedStyle: CSSStyleDeclaration): TextStyles {
    return {
        fontFamily: computedStyle.fontFamily.replace(/["']/g, '').split(',')[0].trim(),
        fontSize: parseFloat(computedStyle.fontSize),
        fontWeight: parseFontWeight(computedStyle.fontWeight),
        lineHeight: parseLineHeight(computedStyle.lineHeight, computedStyle.fontSize),
        letterSpacing: parseFloat(computedStyle.letterSpacing) || 0,
        textAlign: mapTextAlign(computedStyle.textAlign),
        textDecoration: computedStyle.textDecoration
    };
}

/**
 * AL-7: Parse font-weight para número
 */
export function parseFontWeight(weight: string): number {
    const weightMap: Record<string, number> = {
        'normal': 400,
        'bold': 700,
        'lighter': 300,
        'bolder': 600,
        '100': 100,
        '200': 200,
        '300': 300,
        '400': 400,
        '500': 500,
        '600': 600,
        '700': 700,
        '800': 800,
        '900': 900
    };

    return weightMap[weight] || parseInt(weight) || 400;
}

/**
 * AL-7: Parse line-height (pode ser número, px, %, ou 'normal')
 */
export function parseLineHeight(lineHeight: string, fontSize: string): number | string {
    if (lineHeight === 'normal') {
        return 'AUTO';
    }

    if (lineHeight.includes('px')) {
        return parseFloat(lineHeight);
    }

    if (lineHeight.includes('%')) {
        const percent = parseFloat(lineHeight) / 100;
        return parseFloat(fontSize) * percent;
    }

    // Unitless (multiplier)
    const multiplier = parseFloat(lineHeight);
    if (!isNaN(multiplier)) {
        return parseFloat(fontSize) * multiplier;
    }

    return 'AUTO';
}

/**
 * AL-7: Mapeia textAlign CSS para Figma
 */
export function mapTextAlign(align: string): 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED' {
    switch (align) {
        case 'center':
            return 'CENTER';
        case 'right':
            return 'RIGHT';
        case 'justify':
            return 'JUSTIFIED';
        default:
            return 'LEFT';
    }
}

/**
 * Extrai metadados do HTML convertido
 */
export function getConversionMetadata(result: ConversionResult) {
    const countNodes = (node: ConversionResult): number => {
        let count = 1;
        if (node.children && Array.isArray(node.children)) {
            count += node.children.reduce((sum, child) => sum + countNodes(child), 0);
        }
        return count;
    };

    return {
        nodeCount: countNodes(result),
        hasChildren: !!result.children && result.children.length > 0,
        type: result.type,
        name: result.name
    };
}



