// Re-export principal da lib original com espaço para extensões.
export * from '@builder.io/html-to-figma';
import { htmlToFigma } from '@builder.io/html-to-figma';

/**
 * Converte HTML em estrutura Figma JSON compatível.
 * 
 * Esta função serve como wrapper sobre @builder.io/html-to-figma,
 * com espaço para pós-processamento e extensões futuras.
 * 
 * @param html - String HTML ou HTMLElement a ser convertido
 * @param options - Opções de conversão
 * @param options.useFrames - Se true, usa frames ao invés de grupos (padrão: true)
 * @param options.logTime - Se true, loga tempo de execução (padrão: false)
 * @returns Array de nodes Figma compatíveis
 * 
 * @example
 * ```typescript
 * const htmlString = '<div style="display: flex;"><span>Hello</span></div>';
 * const figmaNodes = convertHtmlToFigma(htmlString);
 * ```
 */
export function convertHtmlToFigma(
    html: string | HTMLElement,
    options: {
        useFrames?: boolean;
        logTime?: boolean;
    } = {}
) {
    const { useFrames = true, logTime = false } = options;

    // Se for string, precisamos criar um elemento temporário no DOM
    // Nota: em ambiente Node.js isso requer jsdom ou similar
    let element: HTMLElement;
    
    if (typeof html === 'string') {
        if (typeof document !== 'undefined') {
            // Ambiente browser
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            element = tempDiv.firstElementChild as HTMLElement || tempDiv;
        } else {
            // Ambiente Node.js - retorna erro explicativo
            throw new Error(
                'convertHtmlToFigma: Cannot parse HTML string in Node.js environment. ' +
                'Please provide an HTMLElement directly, or use jsdom to create a DOM environment.'
            );
        }
    } else {
        element = html;
    }

    // Chama a função original do @builder.io/html-to-figma
    const nodes = htmlToFigma(element, useFrames, logTime);

    // Espaço para pós-processamento futuro:
    // - Aplicar heurísticas de auto-layout
    // - Normalizar propriedades
    // - Adicionar metadados customizados
    
    return nodes;
}
