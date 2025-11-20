import type { FigmaExportData } from './shared';

/**
 * Copia o JSON para a área de transferência
 */
export async function copyToClipboard(data: FigmaExportData): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2);
    
    if (!navigator.clipboard) {
        throw new Error('Clipboard API não disponível neste navegador');
    }
    
    await navigator.clipboard.writeText(jsonString);
}

/**
 * Faz download do JSON como arquivo .figma.json
 */
export function downloadJson(data: FigmaExportData, storyId: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const filename = `${sanitizeFilename(storyId)}.figma.json`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Sanitiza o nome do arquivo removendo caracteres inválidos
 */
function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-z0-9_-]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
}

/**
 * Formata o tamanho do JSON em bytes para formato legível
 */
export function formatJsonSize(data: FigmaExportData): string {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}
