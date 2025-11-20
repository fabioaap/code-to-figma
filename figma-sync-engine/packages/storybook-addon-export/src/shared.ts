export const ADDON_ID = 'figma-sync-engine/export-addon';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const EVENT_EXPORT_REQUEST = `${ADDON_ID}/export-request`;
export const EVENT_EXPORT_RESPONSE = `${ADDON_ID}/export-response`;

export interface ExportRequestPayload {
    storyId: string;
}

export interface ExportResponsePayload {
    success: boolean;
    storyId: string;
    data?: FigmaExportData;
    error?: string;
}

export interface FigmaExportData {
    version: number;
    root: FigmaNode;
    metadata?: {
        storyId: string;
        timestamp: string;
        htmlSource?: string;
    };
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
    [key: string]: any;
}
