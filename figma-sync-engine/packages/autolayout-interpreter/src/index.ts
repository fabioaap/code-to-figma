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
        
        // Map justify-content to primary axis alignment
        if (css.justifyContent) {
            node.primaryAxisAlignItems = mapJustifyContentToPrimaryAxis(css.justifyContent);
        }
        
        // Map align-items to counter axis alignment
        if (css.alignItems) {
            node.counterAxisAlignItems = mapAlignItemsToCounterAxis(css.alignItems);
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

/**
 * Maps CSS justify-content values to Figma primaryAxisAlignItems.
 * Primary axis is the main direction of the layout (horizontal for row, vertical for column).
 */
function mapJustifyContentToPrimaryAxis(justifyContent: string): 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN' {
    switch (justifyContent) {
        case 'flex-start':
        case 'start':
            return 'MIN';
        case 'center':
            return 'CENTER';
        case 'flex-end':
        case 'end':
            return 'MAX';
        case 'space-between':
            return 'SPACE_BETWEEN';
        default:
            return 'MIN'; // Default to start alignment
    }
}

/**
 * Maps CSS align-items values to Figma counterAxisAlignItems.
 * Counter axis is perpendicular to the layout direction.
 */
function mapAlignItemsToCounterAxis(alignItems: string): 'MIN' | 'CENTER' | 'MAX' | 'BASELINE' {
    switch (alignItems) {
        case 'flex-start':
        case 'start':
            return 'MIN';
        case 'center':
            return 'CENTER';
        case 'flex-end':
        case 'end':
            return 'MAX';
        case 'baseline':
            return 'BASELINE';
        default:
            return 'MIN'; // Default to start alignment
    }
}
