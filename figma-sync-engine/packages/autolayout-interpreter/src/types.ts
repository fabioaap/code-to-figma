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
    primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER';
    [key: string]: any;
}
