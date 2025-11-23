/**
 * Core module para conversão de HTML → JSON Figma.
 * MVP-3: Wrapper e extensões sobre @builder.io/html-to-figma
 * AL-7: Enriquecimento de nós TEXT com propriedades de tipografia
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
    enrichTypography?: boolean; // AL-7: Nova opção para enriquecer tipografia
}

/**
 * AL-7: Enriquece nós TEXT com propriedades de tipografia
 * Esta função percorre a árvore de nós e adiciona propriedades de fonte
 * extraídas do HTML original, se disponíveis
 * 
 * @param node - Nó a ser enriquecido
 * @param cssProps - Propriedades CSS computadas (opcional)
 * @returns Nó enriquecido
 */
function enrichTextNodeWithTypography(
    node: ConversionResult,
    cssProps?: Record<string, any>
): ConversionResult {
    // Se for nó TEXT e tiver propriedades CSS, enriquecer
    if (node.type === 'TEXT' && cssProps) {
        // Extrair font-family
        const fontFamily = cssProps['font-family'] || cssProps['fontFamily'];
        if (fontFamily) {
            const cleanFamily = fontFamily.trim().split(',')[0].replace(/['"]/g, '');
            
            // Extrair font-weight e mapear para style
            const fontWeight = cssProps['font-weight'] || cssProps['fontWeight'];
            let fontStyle = 'Regular';
            
            if (fontWeight) {
                const weightNum = typeof fontWeight === 'string' ? parseInt(fontWeight, 10) : fontWeight;
                if (!isNaN(weightNum)) {
                    const weightMap: Record<number, string> = {
                        100: 'Thin',
                        200: 'ExtraLight',
                        300: 'Light',
                        400: 'Regular',
                        500: 'Medium',
                        600: 'SemiBold',
                        700: 'Bold',
                        800: 'ExtraBold',
                        900: 'Black'
                    };
                    const rounded = Math.round(weightNum / 100) * 100;
                    const clamped = Math.max(100, Math.min(900, rounded));
                    fontStyle = weightMap[clamped] || 'Regular';
                }
            }
            
            node.fontName = {
                family: cleanFamily,
                style: fontStyle
            };
        }
        
        // Extrair font-size
        const fontSize = cssProps['font-size'] || cssProps['fontSize'];
        if (fontSize) {
            const match = String(fontSize).match(/^([\d.]+)/);
            if (match) {
                const num = parseFloat(match[1]);
                if (!isNaN(num)) {
                    // Converter rem/em para px (assumindo 16px base)
                    if (String(fontSize).includes('rem') || String(fontSize).includes('em')) {
                        node.fontSize = num * 16;
                    } else {
                        node.fontSize = num;
                    }
                }
            }
        }
        
        // Extrair line-height
        const lineHeight = cssProps['line-height'] || cssProps['lineHeight'];
        if (lineHeight) {
            const lhStr = String(lineHeight);
            
            if (lhStr === 'normal' || lhStr === 'auto') {
                node.lineHeight = { value: 0, unit: 'AUTO' };
            } else if (lhStr.includes('px')) {
                const match = lhStr.match(/^([\d.]+)/);
                if (match) {
                    node.lineHeight = { value: parseFloat(match[1]), unit: 'PIXELS' };
                }
            } else if (lhStr.includes('%')) {
                const match = lhStr.match(/^([\d.]+)/);
                if (match) {
                    node.lineHeight = { value: parseFloat(match[1]), unit: 'PERCENT' };
                }
            } else {
                // Valor unitless (multiplicador)
                const match = lhStr.match(/^([\d.]+)$/);
                if (match) {
                    node.lineHeight = { value: parseFloat(match[1]) * 100, unit: 'PERCENT' };
                }
            }
        }
        
        // Extrair text-align
        const textAlign = cssProps['text-align'] || cssProps['textAlign'];
        if (textAlign) {
            const alignMap: Record<string, string> = {
                'left': 'LEFT',
                'center': 'CENTER',
                'right': 'RIGHT',
                'justify': 'JUSTIFIED'
            };
            const mapped = alignMap[textAlign];
            if (mapped) {
                node.textAlignHorizontal = mapped;
            }
        }
        
        // Extrair color
        const color = cssProps['color'];
        if (color && !node.fills) {
            node.color = color;
        }
    }
    
    // Processar filhos recursivamente
    if (node.children && Array.isArray(node.children)) {
        node.children = node.children.map(child => 
            enrichTextNodeWithTypography(child, cssProps)
        );
    }
    
    return node;
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
        
        // AL-7: Enriquecer nós TEXT com tipografia se solicitado
        let result = figmaJson as ConversionResult;
        
        if (options.enrichTypography !== false) {
            // Por padrão, enriquecer tipografia está habilitado
            // Nota: Em uma implementação futura, poderíamos extrair CSS computado
            // do HTML parseado e passar para enrichTextNodeWithTypography
            result = enrichTextNodeWithTypography(result);
        }

        return result;
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
async function processImages(_node: ConversionResult): Promise<void> {
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



