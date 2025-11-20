/**
 * Core module para conversão de HTML → JSON Figma.
 * MVP-3: Wrapper e extensões sobre @builder.io/html-to-figma
 */

import { htmlToFigma, getImageFromURI } from '@builder.io/html-to-figma';
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
    html: string,
    options: ConvertOptions = {}
): Promise<ConversionResult> {
    try {
        if (!html || html.trim().length === 0) {
            throw new Error('HTML input is empty');
        }

        // Cria um container temporário para parse
        const container = document.createElement('div');
        container.innerHTML = html;

        // Obtém o primeiro elemento (ou usa o container se houver múltiplos)
        const rootElement = container.children.length === 1
            ? container.children[0]
            : container;

        // Converte usando @builder.io/html-to-figma
        const figmaJson = await htmlToFigma({
            html: rootElement.outerHTML,
        });

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
    html: string,
    options: ConvertOptions = {}
): Promise<ConversionResult> {
    try {
        const result = await convertHtmlToFigma(html, options);

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


