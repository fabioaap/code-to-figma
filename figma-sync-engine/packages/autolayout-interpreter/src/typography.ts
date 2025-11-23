/**
 * AL-7: Módulo de tipografia
 * Extrai propriedades de fonte do CSS e mapeia para Figma
 */

/**
 * Propriedades de tipografia extraídas do CSS
 */
export interface TypographyProperties {
    fontFamily?: string;
    fontWeight?: number | string;
    fontSize?: number;
    lineHeight?: number | string;
    letterSpacing?: number;
    textAlign?: string;
    color?: string;
}

/**
 * Estrutura de fonte para Figma
 */
export interface FigmaFontName {
    family: string;
    style: string;
}

/**
 * Estrutura de lineHeight para Figma
 */
export interface FigmaLineHeight {
    value: number;
    unit: 'PIXELS' | 'PERCENT' | 'AUTO';
}

/**
 * Mapeamento de font-weight numérico CSS para estilos Figma
 * Suporta valores de 100 a 900
 */
const FONT_WEIGHT_MAP: Record<number, string> = {
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

/**
 * Aliases comuns de font-weight (palavras-chave CSS)
 */
const FONT_WEIGHT_ALIASES: Record<string, number> = {
    'thin': 100,
    'extralight': 200,
    'ultralight': 200,
    'light': 300,
    'normal': 400,
    'regular': 400,
    'medium': 500,
    'semibold': 600,
    'demibold': 600,
    'bold': 700,
    'extrabold': 800,
    'ultrabold': 800,
    'black': 900,
    'heavy': 900
};

/**
 * Lista de fontes de fallback em ordem de prioridade
 */
export const FONT_FALLBACK_LIST: FigmaFontName[] = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Roboto', style: 'Regular' },
    { family: 'Arial', style: 'Regular' },
    { family: 'Helvetica', style: 'Regular' }
];

/**
 * Mapeia font-weight CSS (numérico ou palavra-chave) para estilo Figma
 * 
 * @param weight - Valor CSS de font-weight (100-900, 'bold', 'normal', etc)
 * @returns Estilo Figma correspondente ('Regular', 'Bold', etc)
 * 
 * @example
 * mapFontWeightToStyle(400) // 'Regular'
 * mapFontWeightToStyle(700) // 'Bold'
 * mapFontWeightToStyle('bold') // 'Bold'
 */
export function mapFontWeightToStyle(weight?: number | string): string {
    if (!weight) return 'Regular';

    // Se for string, tentar converter para número ou buscar alias
    if (typeof weight === 'string') {
        const normalized = weight.toLowerCase().trim();
        
        // Tentar converter string numérica para número
        const numericWeight = parseInt(normalized, 10);
        if (!isNaN(numericWeight)) {
            return FONT_WEIGHT_MAP[numericWeight] || 'Regular';
        }
        
        // Tentar buscar alias
        const aliasWeight = FONT_WEIGHT_ALIASES[normalized];
        if (aliasWeight) {
            return FONT_WEIGHT_MAP[aliasWeight] || 'Regular';
        }
        
        return 'Regular';
    }

    // Se for número, mapear diretamente
    if (typeof weight === 'number') {
        // Valores fora do range ou zero retornam Regular
        if (weight <= 0) {
            return 'Regular';
        }
        
        // Arredondar para múltiplo de 100 mais próximo
        const rounded = Math.round(weight / 100) * 100;
        const clamped = Math.max(100, Math.min(900, rounded));
        return FONT_WEIGHT_MAP[clamped] || 'Regular';
    }

    return 'Regular';
}

/**
 * Constrói nome de fonte Figma a partir de family e weight
 * 
 * @param family - Nome da família de fonte (ex: 'Inter', 'Roboto')
 * @param weight - Font-weight CSS
 * @returns Objeto FigmaFontName com family e style
 * 
 * @example
 * buildFigmaFontName('Inter', 700) // { family: 'Inter', style: 'Bold' }
 * buildFigmaFontName('Roboto', 'medium') // { family: 'Roboto', style: 'Medium' }
 */
export function buildFigmaFontName(
    family?: string,
    weight?: number | string
): FigmaFontName {
    const cleanFamily = family
        ? family.trim().split(',')[0].replace(/['"]/g, '').trim()
        : 'Inter';
    const style = mapFontWeightToStyle(weight);
    
    return {
        family: cleanFamily,
        style
    };
}

/**
 * Extrai e mapeia font-size CSS para Figma
 * 
 * @param fontSize - Valor CSS de font-size (ex: '16px', '1rem')
 * @returns Tamanho em pixels como número
 */
export function parseFontSize(fontSize?: string): number | undefined {
    if (!fontSize) return undefined;
    
    const match = fontSize.match(/^(-?[\d.]+)/);
    if (!match) return undefined;
    
    const num = parseFloat(match[1]);
    if (isNaN(num)) return undefined;
    
    // Valores negativos são inválidos para font-size
    if (num < 0) return undefined;
    
    // Para rem/em, assumir 16px base (padrão browser)
    if (fontSize.includes('rem')) {
        return num * 16;
    }
    if (fontSize.includes('em')) {
        return num * 16;
    }
    
    return num;
}

/**
 * Extrai e mapeia line-height CSS para Figma
 * 
 * @param lineHeight - Valor CSS de line-height (ex: '1.5', '24px', '150%')
 * @param _fontSize - Tamanho da fonte para cálculo de valores relativos (reservado para uso futuro)
 * @returns Objeto FigmaLineHeight ou undefined
 */
export function parseLineHeight(
    lineHeight?: string,
    _fontSize?: number
): FigmaLineHeight | undefined {
    if (!lineHeight) return undefined;
    
    // 'normal' ou 'auto' → AUTO
    if (lineHeight === 'normal' || lineHeight === 'auto') {
        return { value: 0, unit: 'AUTO' };
    }
    
    // Valor em pixels → PIXELS
    if (lineHeight.includes('px')) {
        const match = lineHeight.match(/^([\d.]+)/);
        if (match) {
            const pixels = parseFloat(match[1]);
            if (!isNaN(pixels)) {
                return { value: pixels, unit: 'PIXELS' };
            }
        }
    }
    
    // Valor em porcentagem → PERCENT
    if (lineHeight.includes('%')) {
        const match = lineHeight.match(/^([\d.]+)/);
        if (match) {
            const percent = parseFloat(match[1]);
            if (!isNaN(percent)) {
                return { value: percent, unit: 'PERCENT' };
            }
        }
    }
    
    // Valor unitless (multiplicador) → PERCENT
    const match = lineHeight.match(/^([\d.]+)$/);
    if (match) {
        const multiplier = parseFloat(match[1]);
        if (!isNaN(multiplier)) {
            return { value: multiplier * 100, unit: 'PERCENT' };
        }
    }
    
    return undefined;
}

/**
 * Extrai propriedades de tipografia de um snapshot CSS
 * 
 * @param cssProps - Objeto com propriedades CSS computadas
 * @returns Objeto TypographyProperties com propriedades extraídas
 */
export function extractTypographyFromCss(cssProps: Record<string, any>): TypographyProperties {
    return {
        fontFamily: cssProps['font-family'] || cssProps['fontFamily'],
        fontWeight: cssProps['font-weight'] || cssProps['fontWeight'],
        fontSize: parseFontSize(cssProps['font-size'] || cssProps['fontSize']),
        lineHeight: cssProps['line-height'] || cssProps['lineHeight'],
        letterSpacing: cssProps['letter-spacing'] || cssProps['letterSpacing'],
        textAlign: cssProps['text-align'] || cssProps['textAlign'],
        color: cssProps['color']
    };
}

/**
 * Converte propriedades de tipografia CSS para formato Figma TEXT
 * 
 * @param typography - Propriedades extraídas do CSS
 * @returns Objeto com campos prontos para nó TEXT do Figma
 */
export function convertTypographyToFigma(typography: TypographyProperties): Record<string, any> {
    const figmaProps: Record<string, any> = {};
    
    // Font name (family + style baseado em weight)
    if (typography.fontFamily || typography.fontWeight) {
        figmaProps.fontName = buildFigmaFontName(
            typography.fontFamily,
            typography.fontWeight
        );
    }
    
    // Font size
    if (typography.fontSize !== undefined) {
        figmaProps.fontSize = typography.fontSize;
    }
    
    // Line height
    if (typography.lineHeight) {
        figmaProps.lineHeight = parseLineHeight(
            String(typography.lineHeight),
            typography.fontSize
        );
    }
    
    // Text align
    if (typography.textAlign) {
        const alignMap: Record<string, string> = {
            'left': 'LEFT',
            'center': 'CENTER',
            'right': 'RIGHT',
            'justify': 'JUSTIFIED'
        };
        const mapped = alignMap[typography.textAlign];
        if (mapped) {
            figmaProps.textAlignHorizontal = mapped;
        }
    }
    
    // Color (se disponível)
    if (typography.color) {
        figmaProps.color = typography.color;
    }
    
    return figmaProps;
}

/**
 * Gera lista de fontes para tentar carregar, com fallbacks
 * 
 * @param primaryFont - Fonte primária desejada
 * @returns Array de FigmaFontName em ordem de prioridade
 */
export function buildFontFallbackList(primaryFont?: FigmaFontName): FigmaFontName[] {
    const list: FigmaFontName[] = [];
    
    // Adicionar fonte primária se fornecida
    if (primaryFont) {
        list.push(primaryFont);
    }
    
    // Adicionar fallbacks padrão (evitar duplicatas)
    for (const fallback of FONT_FALLBACK_LIST) {
        const isDuplicate = list.some(
            f => f.family === fallback.family && f.style === fallback.style
        );
        if (!isDuplicate) {
            list.push(fallback);
        }
    }
    
    return list;
}
