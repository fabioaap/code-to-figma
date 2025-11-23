/**
 * Token de tipografia extraído do CSS
 * TOK-2: Estrutura normalizada para estilos de texto
 */
export interface TypographyToken {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number | 'normal';
    letterSpacing: number;
    textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    textTransform?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
}

export interface FigmaNode {
    type: string;
    name?: string;
    children?: FigmaNode[];
    layoutMode?: 'HORIZONTAL' | 'VERTICAL';
    itemSpacing?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    typography?: TypographyToken;
    fontSize?: number;
    fontName?: { family: string; style: string };
    lineHeight?: { value: number; unit: 'PIXELS' | 'AUTO' };
    letterSpacing?: { value: number; unit: 'PIXELS' };
    textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    [key: string]: any;
}
