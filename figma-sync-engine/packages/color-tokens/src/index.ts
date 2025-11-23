/**
 * TOK-1: Módulo de extração de tokens de cor
 * Extrai cores hexadecimais do JSON Figma e gera dicionário de tokens
 */

/**
 * Tipo para representar uma cor no formato RGB normalizado do Figma
 */
export interface FigmaColor {
    r: number; // 0-1
    g: number; // 0-1
    b: number; // 0-1
}

/**
 * Tipo para representar um fill/preenchimento do Figma
 */
export interface FigmaFill {
    type: 'SOLID' | 'GRADIENT' | 'IMAGE';
    color?: FigmaColor;
    [key: string]: any;
}

/**
 * Tipo para o dicionário de tokens de cor
 */
export interface ColorToken {
    name: string;
    value: string; // hex color
    usage: number; // quantas vezes é usado
}

/**
 * Tipo para o resultado da extração
 */
export interface ColorExtractionResult {
    tokens: Record<string, ColorToken>;
    figmaJson: any; // JSON com referências aos tokens
}

/**
 * Converte cor RGB normalizada (0-1) para hexadecimal
 * 
 * @param color - Cor no formato Figma (r, g, b de 0 a 1)
 * @returns String hexadecimal no formato #RRGGBB
 * 
 * @example
 * rgbToHex({ r: 1, g: 0, b: 0 }) // '#ff0000' (vermelho)
 * rgbToHex({ r: 0.5, g: 0.5, b: 0.5 }) // '#808080' (cinza)
 */
export function rgbToHex(color: FigmaColor): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    
    const toHex = (n: number) => {
        return n.toString(16).padStart(2, '0');
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converte cor hexadecimal para RGB normalizado do Figma
 * 
 * @param hex - String hexadecimal (#RGB ou #RRGGBB)
 * @returns Cor no formato Figma ou null se inválido
 * 
 * @example
 * hexToRgb('#ff0000') // { r: 1, g: 0, b: 0 }
 * hexToRgb('#abc') // { r: 0.667, g: 0.733, b: 0.8 }
 */
export function hexToRgb(hex: string): FigmaColor | null {
    // Remove o # se presente
    hex = hex.replace(/^#/, '');
    
    // Suporta formatos #RGB e #RRGGBB
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    if (hex.length !== 6) {
        return null;
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return null;
    }
    
    return {
        r: r / 255,
        g: g / 255,
        b: b / 255
    };
}

/**
 * Gera nome semântico para cor baseado em heurísticas
 * 
 * @param hex - Cor hexadecimal
 * @param index - Índice da cor no conjunto
 * @returns Nome semântico para o token
 * 
 * @example
 * generateColorName('#ffffff', 0) // 'white'
 * generateColorName('#000000', 1) // 'black'
 * generateColorName('#2563eb', 2) // 'color-3'
 */
export function generateColorName(hex: string, index: number): string {
    const normalized = hex.toLowerCase();
    
    // Cores comuns pré-definidas
    const commonColors: Record<string, string> = {
        '#ffffff': 'white',
        '#000000': 'black',
        '#ff0000': 'red',
        '#00ff00': 'green',
        '#0000ff': 'blue',
        '#ffff00': 'yellow',
        '#ff00ff': 'magenta',
        '#00ffff': 'cyan',
        '#808080': 'gray',
        '#c0c0c0': 'silver',
        '#800000': 'maroon',
        '#008000': 'darkgreen',
        '#000080': 'navy',
        '#808000': 'olive',
        '#800080': 'purple',
        '#008080': 'teal',
        '#ffa500': 'orange'
    };
    
    if (commonColors[normalized]) {
        return commonColors[normalized];
    }
    
    // Para outras cores, usa um nome genérico com índice
    return `color-${index + 1}`;
}

/**
 * Normaliza cor hexadecimal adicionando # se necessário
 * 
 * @param color - Cor hexadecimal com ou sem #
 * @returns Cor hexadecimal normalizada com #
 */
function normalizeHexColor(color: string): string {
    return color.startsWith('#') ? color : `#${color}`;
}

/**
 * Extrai todas as cores de um nó Figma recursivamente
 * 
 * @param node - Nó do JSON Figma
 * @param colors - Map acumulador de cores (hex -> contagem)
 */
function extractColorsFromNode(node: any, colors: Map<string, number>): void {
    if (!node || typeof node !== 'object') {
        return;
    }
    
    // Extrair de fills
    if (node.fills && Array.isArray(node.fills)) {
        for (const fill of node.fills) {
            if (fill.type === 'SOLID' && fill.color) {
                const hex = rgbToHex(fill.color);
                colors.set(hex, (colors.get(hex) || 0) + 1);
            }
        }
    }
    
    // Extrair de backgroundColor (formato alternativo)
    if (node.backgroundColor && typeof node.backgroundColor === 'string') {
        const hex = normalizeHexColor(node.backgroundColor);
        colors.set(hex, (colors.get(hex) || 0) + 1);
    }
    
    // Extrair de color (para textos)
    if (node.color && typeof node.color === 'string') {
        const hex = normalizeHexColor(node.color);
        colors.set(hex, (colors.get(hex) || 0) + 1);
    }
    
    // Recursão para filhos
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            extractColorsFromNode(child, colors);
        }
    }
}

/**
 * Substitui cores por referências de tokens em um nó recursivamente
 * 
 * @param node - Nó do JSON Figma
 * @param colorMap - Mapa de hex -> nome do token
 * @returns Nó com cores substituídas por referências
 */
function replaceColorsWithTokens(node: any, colorMap: Map<string, string>): any {
    if (!node || typeof node !== 'object') {
        return node;
    }
    
    const result = { ...node };
    
    // Substituir em fills
    if (result.fills && Array.isArray(result.fills)) {
        result.fills = result.fills.map((fill: FigmaFill) => {
            if (fill.type === 'SOLID' && fill.color) {
                const hex = rgbToHex(fill.color);
                const tokenName = colorMap.get(hex);
                if (tokenName) {
                    return {
                        ...fill,
                        colorToken: tokenName
                    };
                }
            }
            return fill;
        });
    }
    
    // Substituir backgroundColor
    if (result.backgroundColor && typeof result.backgroundColor === 'string') {
        const hex = result.backgroundColor.startsWith('#') 
            ? result.backgroundColor 
            : `#${result.backgroundColor}`;
        const tokenName = colorMap.get(hex);
        if (tokenName) {
            result.backgroundColorToken = tokenName;
        }
    }
    
    // Substituir color (texto)
    if (result.color && typeof result.color === 'string') {
        const hex = result.color.startsWith('#') 
            ? result.color 
            : `#${result.color}`;
        const tokenName = colorMap.get(hex);
        if (tokenName) {
            result.colorToken = tokenName;
        }
    }
    
    // Recursão para filhos
    if (result.children && Array.isArray(result.children)) {
        result.children = result.children.map((child: any) => 
            replaceColorsWithTokens(child, colorMap)
        );
    }
    
    return result;
}

/**
 * Extrai tokens de cor de um JSON Figma
 * 
 * @param figmaJson - JSON no formato Figma
 * @returns Resultado com dicionário de tokens e JSON modificado
 * 
 * @example
 * const result = extractColorTokens({
 *   type: 'FRAME',
 *   fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
 *   children: [...]
 * });
 * 
 * // result.tokens = { 'red': { name: 'red', value: '#ff0000', usage: 1 } }
 * // result.figmaJson.fills[0].colorToken = 'red'
 */
export function extractColorTokens(figmaJson: any): ColorExtractionResult {
    // Extrair todas as cores
    const colorUsage = new Map<string, number>();
    extractColorsFromNode(figmaJson, colorUsage);
    
    // Criar tokens ordenados por uso (mais usado primeiro)
    const sortedColors = Array.from(colorUsage.entries())
        .sort((a, b) => b[1] - a[1]); // Ordena por uso decrescente
    
    const tokens: Record<string, ColorToken> = {};
    const colorMap = new Map<string, string>();
    
    sortedColors.forEach(([hex, usage], index) => {
        const name = generateColorName(hex, index);
        tokens[name] = {
            name,
            value: hex,
            usage
        };
        colorMap.set(hex, name);
    });
    
    // Substituir cores por referências
    const modifiedJson = replaceColorsWithTokens(figmaJson, colorMap);
    
    return {
        tokens,
        figmaJson: modifiedJson
    };
}

/**
 * Serializa tokens de cor para o formato colors.json
 * 
 * @param tokens - Dicionário de tokens
 * @returns String JSON formatada
 */
export function serializeColorTokens(tokens: Record<string, ColorToken>): string {
    return JSON.stringify(tokens, null, 2);
}

/**
 * Carrega tokens de cor de uma string JSON
 * 
 * @param json - String JSON com tokens
 * @returns Dicionário de tokens
 */
export function deserializeColorTokens(json: string): Record<string, ColorToken> {
    return JSON.parse(json);
}
