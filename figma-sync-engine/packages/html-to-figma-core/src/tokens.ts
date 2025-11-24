/**
 * TOK-1: Extração de tokens de cor de árvore Figma JSON
 */

export interface ColorToken {
    name: string;
    value: string;
    usageCount: number;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface Fill {
    type: string;
    color?: RGB;
}

export interface FigmaNode {
    type?: string;
    fills?: Fill[];
    strokes?: Fill[];
    children?: FigmaNode[];
    [key: string]: any;
}

/**
 * Converte RGB (0-1) para HEX
 */
export function rgbToHex(rgb: RGB): string {
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

/**
 * Incrementa contagem de uso de uma cor
 */
function incrementColorUsage(colorMap: Map<string, ColorToken>, hex: string): void {
    if (colorMap.has(hex)) {
        colorMap.get(hex)!.usageCount++;
    } else {
        colorMap.set(hex, {
            name: `color-${colorMap.size + 1}`,
            value: hex,
            usageCount: 1
        });
    }
}

/**
 * TOK-1: Extrai todos os tokens de cor únicos de uma árvore Figma
 */
export function extractColorTokens(jsonTree: FigmaNode): ColorToken[] {
    const colorMap = new Map<string, ColorToken>();

    function traverse(node: FigmaNode): void {
        // Processar fills (backgrounds)
        if (node.fills && Array.isArray(node.fills)) {
            node.fills.forEach(fill => {
                if (fill.type === 'SOLID' && fill.color) {
                    const hex = rgbToHex(fill.color);
                    incrementColorUsage(colorMap, hex);
                }
            });
        }

        // Processar strokes (borders)
        if (node.strokes && Array.isArray(node.strokes)) {
            node.strokes.forEach(stroke => {
                if (stroke.type === 'SOLID' && stroke.color) {
                    const hex = rgbToHex(stroke.color);
                    incrementColorUsage(colorMap, hex);
                }
            });
        }

        // Recursão em filhos
        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(traverse);
        }
    }

    traverse(jsonTree);

    // Retorna ordenado por frequência (mais usado primeiro)
    return Array.from(colorMap.values())
        .sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * TOK-2: Token de tipografia
 */
export interface TypographyToken {
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number | string;
    letterSpacing: number;
    usageCount: number;
}

/**
 * TOK-2: Gera chave única para combinação de estilos tipográficos
 */
function getTypographyKey(styles: Partial<TypographyToken>): string {
    return `${styles.fontFamily || 'inherit'}-${styles.fontSize || 16}-${styles.fontWeight || 400}-${styles.lineHeight || 'AUTO'}-${styles.letterSpacing || 0}`;
}

/**
 * TOK-2: Incrementa contagem de uso de um token tipográfico
 */
function incrementTypographyUsage(
    typoMap: Map<string, TypographyToken>,
    styles: Partial<TypographyToken>
): void {
    const key = getTypographyKey(styles);
    
    if (typoMap.has(key)) {
        typoMap.get(key)!.usageCount++;
    } else {
        typoMap.set(key, {
            name: `typography-${typoMap.size + 1}`,
            fontFamily: styles.fontFamily || 'inherit',
            fontSize: styles.fontSize || 16,
            fontWeight: styles.fontWeight || 400,
            lineHeight: styles.lineHeight || 'AUTO',
            letterSpacing: styles.letterSpacing || 0,
            usageCount: 1
        });
    }
}

/**
 * TOK-2: Extrai todos os tokens de tipografia únicos de uma árvore Figma
 */
export function extractTypographyTokens(jsonTree: FigmaNode): TypographyToken[] {
    const typoMap = new Map<string, TypographyToken>();
    
    function traverse(node: FigmaNode): void {
        // Processar apenas nós de texto
        if (node.type === 'TEXT') {
            const styles: Partial<TypographyToken> = {
                fontFamily: node.fontFamily,
                fontSize: node.fontSize,
                fontWeight: node.fontWeight,
                lineHeight: node.lineHeight,
                letterSpacing: node.letterSpacing
            };
            
            incrementTypographyUsage(typoMap, styles);
        }
        
        // Recursão em filhos
        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(traverse);
        }
    }
    
    traverse(jsonTree);
    
    // Retorna ordenado por frequência (mais usado primeiro)
    return Array.from(typoMap.values())
        .sort((a, b) => b.usageCount - a.usageCount);
}
