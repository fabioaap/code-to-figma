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
    primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
    [key: string]: any;
}
