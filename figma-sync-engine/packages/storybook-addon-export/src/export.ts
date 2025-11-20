/**
 * MVP-5: Exportação de JSON para Figma
 * Suporta clipboard (copy) e download (file)
 */

/**
 * Resultado da exportação
 */
export interface ExportResult {
    success: boolean;
    method: 'clipboard' | 'download';
    size: number;
    timestamp: string;
    message: string;
}

/**
 * Copia JSON para clipboard usando Clipboard API
 * 
 * @param json - Objeto a ser copiado
 * @returns Promise com resultado da operação
 * 
 * @example
 * const result = await exportToClipboard({ type: 'FRAME', children: [] });
 * console.log(result.success); // true
 */
export async function exportToClipboard(json: any): Promise<ExportResult> {
    try {
        const jsonString = JSON.stringify(json, null, 2);
        const size = new Blob([jsonString]).size;

        // Verifica suporte à Clipboard API
        if (!navigator.clipboard) {
            throw new Error('Clipboard API not available');
        }

        await navigator.clipboard.writeText(jsonString);

        return {
            success: true,
            method: 'clipboard',
            size,
            timestamp: new Date().toISOString(),
            message: `JSON copied to clipboard (${size} bytes)`
        };
    } catch (error) {
        throw new Error(
            `Failed to copy to clipboard: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Faz download do JSON como arquivo
 * 
 * @param json - Objeto a ser baixado
 * @param filename - Nome do arquivo (padrão: figma-export.json)
 * @returns Resultado da operação
 * 
 * @example
 * const result = exportToFile({ type: 'FRAME' }, 'my-button.json');
 * console.log(result.success); // true
 */
export function exportToFile(json: any, filename: string = 'figma-export.json'): ExportResult {
    try {
        const jsonString = JSON.stringify(json, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const size = blob.size;

        // Cria URL temporária para o blob
        const url = URL.createObjectURL(blob);

        // Cria elemento <a> e simula clique
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpa a URL
        URL.revokeObjectURL(url);

        return {
            success: true,
            method: 'download',
            size,
            timestamp: new Date().toISOString(),
            message: `JSON downloaded as ${filename} (${size} bytes)`
        };
    } catch (error) {
        throw new Error(
            `Failed to download file: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Exporta JSON com fallback: tenta clipboard, se falhar tenta download
 * 
 * @param json - Objeto a ser exportado
 * @param filename - Nome do arquivo para fallback
 * @returns Resultado da operação
 */
export async function exportWithFallback(
    json: any,
    filename: string = 'figma-export.json'
): Promise<ExportResult> {
    try {
        // Tenta clipboard primeiro
        return await exportToClipboard(json);
    } catch (clipboardError) {
        // Fallback para download se clipboard falhar
        try {
            return exportToFile(json, filename);
        } catch (fileError) {
            throw new Error(
                `Export failed: clipboard (${clipboardError instanceof Error ? clipboardError.message : 'unknown'
                }), download (${fileError instanceof Error ? fileError.message : 'unknown'
                })`
            );
        }
    }
}

/**
 * Valida se um objeto é um JSON Figma válido
 * Verificações básicas de estrutura
 */
export function validateFigmaJson(json: any): boolean {
    if (!json || typeof json !== 'object') return false;
    if (!json.type) return false;
    // Tipos válidos de nós Figma
    const validTypes = ['FRAME', 'GROUP', 'TEXT', 'COMPONENT', 'SHAPE', 'LINE'];
    return validTypes.includes(json.type);
}

/**
 * Adiciona metadados de exportação ao JSON
 * Útil para rastreamento e debugging
 */
export function addExportMetadata(json: any, metadata?: Record<string, any>) {
    return {
        ...json,
        __export: {
            timestamp: new Date().toISOString(),
            version: '0.1.0',
            engine: 'figma-sync-engine',
            ...metadata
        }
    };
}
