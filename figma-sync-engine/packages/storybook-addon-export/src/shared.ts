export const ADDON_ID = 'figma-sync-engine/export-addon';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const EVENT_EXPORT_REQUEST = `${ADDON_ID}/export-request`;
export const EVENT_EXPORT_COMPLETE = `${ADDON_ID}/export-complete`;

export interface ExportResult {
    storyId: string;
    json: string;
    size: number;
    timestamp: string;
}

export interface ExportLog {
    event: 'export-start' | 'export-complete' | 'export-error';
    storyId: string;
    size?: number;
    timestamp: string;
    error?: string;
}
