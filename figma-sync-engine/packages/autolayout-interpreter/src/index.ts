import { FigmaNode } from './types';

interface CssSnapshot {
    display?: string;
    flexDirection?: string;
    gap?: string;
    padding?: string;
    alignItems?: string;
    justifyContent?: string;
}

export function applyAutoLayout(node: FigmaNode, css: CssSnapshot): FigmaNode {
    if (css.display === 'flex') {
        const isVertical = css.flexDirection === 'column';
        node.layoutMode = isVertical ? 'VERTICAL' : 'HORIZONTAL';
        
        if (css.gap) {
            const g = parseInt(css.gap, 10);
            if (!isNaN(g)) node.itemSpacing = g;
        }
        
        if (css.padding) {
            const parts = css.padding.split(' ').map(p => parseInt(p, 10));
            const [t, r, b, l] = normalizePadding(parts);
            node.paddingTop = t; node.paddingRight = r; node.paddingBottom = b; node.paddingLeft = l;
        }
        
        // Map justify-content to primaryAxisAlignItems (main axis)
        if (css.justifyContent) {
            node.primaryAxisAlignItems = mapJustifyContent(css.justifyContent);
        }
        
        // Map align-items to counterAxisAlignItems (cross axis)
        if (css.alignItems) {
            node.counterAxisAlignItems = mapAlignItems(css.alignItems);
        }
    }
    if (node.children) node.children = node.children.map(c => ({ ...c }));
    return node;
}

function normalizePadding(parts: number[]): [number, number, number, number] {
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
    if (parts.length >= 4) return [parts[0], parts[1], parts[2], parts[3]];
    return [0, 0, 0, 0];
}

function mapJustifyContent(value: string): 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN' {
    switch (value) {
        case 'flex-start':
        case 'start':
            return 'MIN';
        case 'flex-end':
        case 'end':
            return 'MAX';
        case 'center':
            return 'CENTER';
        case 'space-between':
            return 'SPACE_BETWEEN';
        default:
            return 'MIN'; // Default fallback
    }
}

function mapAlignItems(value: string): 'MIN' | 'MAX' | 'CENTER' {
    switch (value) {
        case 'flex-start':
        case 'start':
            return 'MIN';
        case 'flex-end':
        case 'end':
            return 'MAX';
        case 'center':
            return 'CENTER';
        default:
            return 'MIN'; // Default fallback
    }
}
