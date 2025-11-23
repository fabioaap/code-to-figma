/**
 * Core module para conversão de HTML → JSON Figma.
 * MVP-3: Wrapper e extensões sobre @builder.io/html-to-figma
 */

import { htmlToFigma } from '@builder.io/html-to-figma';
export * from '@builder.io/html-to-figma';

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

/**
 * TOK-1, TOK-2: Estrutura de tokens de design
 */
export interface DesignTokens {
    colors: ColorToken[];
    typography: TypographyToken[];
}

export interface ColorToken {
    name: string;
    value: string;
    usage: string[]; // Onde o token é usado
}

export interface TypographyToken {
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight?: string;
    lineHeight?: string;
    usage: string[]; // Onde o token é usado
}

/**
 * TOK-1: Extrai cores únicas do JSON Figma
 */
export function extractColorTokens(node: ConversionResult, colors: Map<string, ColorToken> = new Map()): ColorToken[] {
    // Extrair cor de preenchimento (fills)
    if (node.fills && Array.isArray(node.fills)) {
        node.fills.forEach((fill: any, index: number) => {
            if (fill.type === 'SOLID' && fill.color) {
                const { r, g, b } = fill.color;
                const hexColor = rgbToHex(r, g, b);
                
                if (!colors.has(hexColor)) {
                    colors.set(hexColor, {
                        name: `color-${colors.size + 1}`,
                        value: hexColor,
                        usage: []
                    });
                }
                
                const token = colors.get(hexColor)!;
                if (node.name && !token.usage.includes(node.name)) {
                    token.usage.push(node.name);
                }
            }
        });
    }

    // Extrair cor de background
    if (node.backgroundColor) {
        const hexColor = normalizeColor(node.backgroundColor);
        if (hexColor && !colors.has(hexColor)) {
            colors.set(hexColor, {
                name: `color-${colors.size + 1}`,
                value: hexColor,
                usage: []
            });
        }
        if (hexColor && node.name) {
            const token = colors.get(hexColor)!;
            if (!token.usage.includes(node.name)) {
                token.usage.push(node.name);
            }
        }
    }

    // Extrair cor de texto
    if (node.color) {
        const hexColor = normalizeColor(node.color);
        if (hexColor && !colors.has(hexColor)) {
            colors.set(hexColor, {
                name: `text-color-${colors.size + 1}`,
                value: hexColor,
                usage: []
            });
        }
        if (hexColor && node.name) {
            const token = colors.get(hexColor)!;
            if (!token.usage.includes(node.name)) {
                token.usage.push(node.name);
            }
        }
    }

    // Processar filhos recursivamente
    if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => extractColorTokens(child, colors));
    }

    return Array.from(colors.values());
}

/**
 * TOK-2: Extrai tipografia do JSON Figma
 */
export function extractTypographyTokens(node: ConversionResult, typography: Map<string, TypographyToken> = new Map()): TypographyToken[] {
    // Só processar nós TEXT
    if (node.type === 'TEXT') {
        const fontFamily = node.fontName?.family || node.fontFamily || 'Inter';
        const fontSize = node.fontSize || 16;
        const fontWeight = node.fontName?.style || node.fontWeight || 'Regular';
        const lineHeight = node.lineHeight ? String(node.lineHeight.value) + (node.lineHeight.unit === 'PERCENT' ? '%' : 'px') : undefined;

        // Criar chave única para este estilo tipográfico
        const key = `${fontFamily}-${fontSize}-${fontWeight}`;

        if (!typography.has(key)) {
            typography.set(key, {
                name: `text-${typography.size + 1}`,
                fontFamily,
                fontSize,
                fontWeight,
                lineHeight,
                usage: []
            });
        }

        const token = typography.get(key)!;
        if (node.name && !token.usage.includes(node.name)) {
            token.usage.push(node.name);
        }
    }

    // Processar filhos recursivamente
    if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => extractTypographyTokens(child, typography));
    }

    return Array.from(typography.values());
}

/**
 * TOK-1, TOK-2: Extrai todos os tokens de design do JSON Figma
 */
export function extractDesignTokens(node: ConversionResult): DesignTokens {
    return {
        colors: extractColorTokens(node),
        typography: extractTypographyTokens(node)
    };
}

/**
 * Converte RGB (0-1) para hexadecimal
 */
function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (value: number) => {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Normaliza cor CSS para formato hexadecimal
 */
function normalizeColor(color: string): string | null {
    if (!color) return null;

    // Se já está em hexadecimal, retorna
    if (color.startsWith('#')) {
        return color.toLowerCase();
    }

    // Se é rgb/rgba, converte
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]) / 255;
        const g = parseInt(rgbMatch[2]) / 255;
        const b = parseInt(rgbMatch[3]) / 255;
        return rgbToHex(r, g, b);
    }

    return null;
}



