import { applyAutoLayout } from '@figma-sync-engine/autolayout-interpreter';
import type { FigmaNode as AutoLayoutNode } from '@figma-sync-engine/autolayout-interpreter';
import type { FigmaExportData, FigmaNode } from './shared';

/**
 * Captura o HTML renderizado da história atual
 */
export function captureStoryHtml(): string {
    const storyRoot = document.querySelector('#storybook-root');
    
    if (!storyRoot) {
        throw new Error('Elemento raiz da história não encontrado (#storybook-root)');
    }
    
    return storyRoot.innerHTML;
}

/**
 * Converte HTML para estrutura JSON Figma
 * Nota: Esta é uma implementação simplificada. A lib @builder.io/html-to-figma
 * requer um ambiente completo do navegador. Por ora, criamos uma estrutura básica.
 */
export function convertToFigmaJson(html: string, storyId: string): FigmaExportData {
    // Parse básico do HTML para criar estrutura Figma
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rootElement = doc.body.firstElementChild;
    
    if (!rootElement) {
        throw new Error('Nenhum elemento encontrado no HTML');
    }
    
    const figmaNode = convertElementToFigmaNode(rootElement);
    
    return {
        version: 1,
        root: figmaNode,
        metadata: {
            storyId,
            timestamp: new Date().toISOString(),
            htmlSource: html.substring(0, 500) // Primeiros 500 chars para referência
        }
    };
}

/**
 * Converte um elemento DOM em um FigmaNode
 */
function convertElementToFigmaNode(element: Element): FigmaNode {
    const tagName = element.tagName.toLowerCase();
    const computedStyle = getComputedStyleSafe(element);
    
    // Determina o tipo do node baseado no elemento
    let nodeType = 'FRAME';
    let nodeName = element.getAttribute('data-testid') || 
                   element.className || 
                   tagName.toUpperCase();
    
    // Cria o node base
    const node: FigmaNode = {
        type: nodeType,
        name: nodeName
    };
    
    // Extrai propriedades de layout do CSS
    if (computedStyle) {
        applyLayoutPropertiesFromStyle(node, computedStyle);
    }
    
    // Processa filhos recursivamente
    const children: FigmaNode[] = [];
    for (const child of Array.from(element.children)) {
        try {
            children.push(convertElementToFigmaNode(child));
        } catch (err) {
            console.warn('Erro ao converter elemento filho:', err);
        }
    }
    
    // Se tem texto direto sem filhos, cria um node de texto
    const textContent = getDirectTextContent(element);
    if (textContent && children.length === 0) {
        children.push({
            type: 'TEXT',
            name: 'Text',
            characters: textContent,
            fontSize: parseFloat(computedStyle?.fontSize || '14'),
            fontWeight: parseFontWeight(computedStyle?.fontWeight || '400')
        });
    }
    
    if (children.length > 0) {
        node.children = children;
    }
    
    return node;
}

/**
 * Obtém computed style de forma segura
 */
function getComputedStyleSafe(element: Element): CSSStyleDeclaration | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.getComputedStyle(element);
}

/**
 * Extrai texto direto do elemento (não de filhos)
 */
function getDirectTextContent(element: Element): string {
    let text = '';
    for (const node of Array.from(element.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent || '';
        }
    }
    return text.trim();
}

/**
 * Aplica propriedades de layout do CSS ao node Figma
 */
function applyLayoutPropertiesFromStyle(node: FigmaNode, style: CSSStyleDeclaration): void {
    // Detecta flexbox
    if (style.display === 'flex' || style.display === 'inline-flex') {
        const direction = style.flexDirection || 'row';
        node.layoutMode = direction.includes('column') ? 'VERTICAL' : 'HORIZONTAL';
        
        // Gap
        const gap = parseFloat(style.gap || '0');
        if (!isNaN(gap) && gap > 0) {
            node.itemSpacing = gap;
        }
        
        // Padding
        const paddingTop = parseFloat(style.paddingTop || '0');
        const paddingRight = parseFloat(style.paddingRight || '0');
        const paddingBottom = parseFloat(style.paddingBottom || '0');
        const paddingLeft = parseFloat(style.paddingLeft || '0');
        
        if (paddingTop > 0) node.paddingTop = paddingTop;
        if (paddingRight > 0) node.paddingRight = paddingRight;
        if (paddingBottom > 0) node.paddingBottom = paddingBottom;
        if (paddingLeft > 0) node.paddingLeft = paddingLeft;
    }
    
    // Dimensões
    const width = parseFloat(style.width || '0');
    const height = parseFloat(style.height || '0');
    if (!isNaN(width) && width > 0) node.width = width;
    if (!isNaN(height) && height > 0) node.height = height;
    
    // Background color
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        node.fills = [{
            type: 'SOLID',
            color: parseColor(style.backgroundColor)
        }];
    }
}

/**
 * Parse color CSS para formato Figma (RGB normalizado 0-1)
 */
function parseColor(cssColor: string): { r: number; g: number; b: number; a?: number } {
    // Simplificação: apenas rgb/rgba
    const rgbaMatch = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
        return {
            r: parseInt(rgbaMatch[1]) / 255,
            g: parseInt(rgbaMatch[2]) / 255,
            b: parseInt(rgbaMatch[3]) / 255,
            ...(rgbaMatch[4] ? { a: parseFloat(rgbaMatch[4]) } : {})
        };
    }
    return { r: 0, g: 0, b: 0 };
}

/**
 * Parse font weight CSS
 */
function parseFontWeight(weight: string): number {
    const numWeight = parseInt(weight);
    if (!isNaN(numWeight)) return numWeight;
    
    const weightMap: Record<string, number> = {
        'normal': 400,
        'bold': 700,
        'lighter': 300,
        'bolder': 600
    };
    
    return weightMap[weight] || 400;
}

/**
 * Aplica heurísticas de Auto Layout ao JSON Figma
 */
export function applyAutoLayoutToJson(data: FigmaExportData): FigmaExportData {
    const enhancedRoot = enhanceNodeWithAutoLayout(data.root);
    
    return {
        ...data,
        root: enhancedRoot
    };
}

/**
 * Aplica Auto Layout recursivamente a um node
 */
function enhanceNodeWithAutoLayout(node: FigmaNode): FigmaNode {
    // Se já tem layoutMode, tenta aplicar o interpretador
    if (node.layoutMode) {
        const cssSnapshot = {
            display: 'flex',
            flexDirection: node.layoutMode === 'VERTICAL' ? 'column' : 'row',
            gap: node.itemSpacing ? `${node.itemSpacing}px` : undefined,
            padding: buildPaddingString(node),
        };
        
        // Aplica o autolayout interpreter
        node = applyAutoLayout(node as AutoLayoutNode, cssSnapshot) as FigmaNode;
    }
    
    // Processa filhos recursivamente
    if (node.children) {
        node.children = node.children.map(child => enhanceNodeWithAutoLayout(child));
    }
    
    return node;
}

/**
 * Constrói string de padding CSS a partir do node
 */
function buildPaddingString(node: FigmaNode): string | undefined {
    const { paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0 } = node;
    
    if (paddingTop === 0 && paddingRight === 0 && paddingBottom === 0 && paddingLeft === 0) {
        return undefined;
    }
    
    if (paddingTop === paddingRight && paddingRight === paddingBottom && paddingBottom === paddingLeft) {
        return `${paddingTop}px`;
    }
    
    if (paddingTop === paddingBottom && paddingRight === paddingLeft) {
        return `${paddingTop}px ${paddingRight}px`;
    }
    
    return `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`;
}

/**
 * Pipeline completo de exportação
 */
export async function executeExportPipeline(storyId: string): Promise<FigmaExportData> {
    // 1. Captura HTML
    const html = captureStoryHtml();
    
    // 2. Converte para JSON Figma
    const figmaJson = convertToFigmaJson(html, storyId);
    
    // 3. Aplica Auto Layout
    const enhancedJson = applyAutoLayoutToJson(figmaJson);
    
    return enhancedJson;
}
