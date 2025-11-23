/**
 * MVP-5: Exportação de JSON para Figma
 * Suporta clipboard (copy) e download (file)
 * MVP-9: Integrado com logger estruturado
 * TOK-1: Integrado com extração de tokens de cor
 */

import { logger } from './logger';
import { extractColorTokens, serializeColorTokens } from '@figma-sync-engine/color-tokens';

/**
 * Resultado da exportação
 */
export interface ExportResult {
    success: boolean;
    method: 'clipboard' | 'download';
    size: number;
    timestamp: string;
    message: string;
    colorTokensCount?: number;
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
    const startTime = performance.now();
    
    try {
        logger.info('export.started', { method: 'clipboard' });
        
        const jsonString = JSON.stringify(json, null, 2);
        const size = new Blob([jsonString]).size;

        // Verifica suporte à Clipboard API
        if (!navigator.clipboard) {
            throw new Error('Clipboard API not available');
        }

        await navigator.clipboard.writeText(jsonString);

        const duration = Math.round(performance.now() - startTime);
        
        logger.info('export.completed', { 
            method: 'clipboard', 
            size,
            duration
        });

        return {
            success: true,
            method: 'clipboard',
            size,
            timestamp: new Date().toISOString(),
            message: `JSON copied to clipboard (${size} bytes)`
        };
    } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error('export.failed', { 
            method: 'clipboard', 
            error: errorMessage,
            duration
        });
        
        throw new Error(
            `Failed to copy to clipboard: ${errorMessage}`
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
    const startTime = performance.now();
    
    try {
        logger.info('export.started', { method: 'download', filename });
        
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

        const duration = Math.round(performance.now() - startTime);
        
        logger.info('export.completed', { 
            method: 'download', 
            filename,
            size,
            duration
        });

        return {
            success: true,
            method: 'download',
            size,
            timestamp: new Date().toISOString(),
            message: `JSON downloaded as ${filename} (${size} bytes)`
        };
    } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error('export.failed', { 
            method: 'download', 
            filename,
            error: errorMessage,
            duration
        });
        
        throw new Error(
            `Failed to download file: ${errorMessage}`
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

/**
 * Exporta JSON com extração de tokens de cor
 * Retorna objeto com payload principal e dicionário de cores
 * 
 * @param json - Objeto Figma a ser exportado
 * @returns Objeto com figmaJson (com referências) e tokens de cor
 * 
 * @example
 * const result = exportWithColorTokens({
 *   type: 'FRAME',
 *   fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
 * });
 * // result.figmaJson.fills[0].colorToken = 'red'
 * // result.colors = { red: { name: 'red', value: '#ff0000', usage: 1 } }
 */
export function exportWithColorTokens(json: any): {
    figmaJson: any;
    colors: Record<string, any>;
} {
    logger.info('export.extractingColors', { hasContent: !!json });
    
    try {
        const result = extractColorTokens(json);
        const colorCount = Object.keys(result.tokens).length;
        
        logger.info('export.colorsExtracted', { 
            colorCount,
            tokens: Object.keys(result.tokens)
        });
        
        return {
            figmaJson: result.figmaJson,
            colors: result.tokens
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('export.colorExtractionFailed', { error: errorMessage });
        
        // Fallback: retorna JSON original sem extração
        return {
            figmaJson: json,
            colors: {}
        };
    }
}

/**
 * Copia JSON com tokens de cor para clipboard
 * Exporta como um único JSON com payload e cores separados
 * 
 * @param json - Objeto a ser copiado
 * @returns Promise com resultado da operação
 */
export async function exportToClipboardWithColors(json: any): Promise<ExportResult> {
    const startTime = performance.now();
    
    try {
        logger.info('export.started', { method: 'clipboard', withColors: true });
        
        const { figmaJson, colors } = exportWithColorTokens(json);
        const colorCount = Object.keys(colors).length;
        
        const payload = {
            figma: figmaJson,
            colors: colors,
            __metadata: {
                timestamp: new Date().toISOString(),
                version: '0.1.0',
                engine: 'figma-sync-engine',
                colorTokensCount: colorCount
            }
        };
        
        const jsonString = JSON.stringify(payload, null, 2);
        const size = new Blob([jsonString]).size;

        if (!navigator.clipboard) {
            throw new Error('Clipboard API not available');
        }

        await navigator.clipboard.writeText(jsonString);

        const duration = Math.round(performance.now() - startTime);
        
        logger.info('export.completed', { 
            method: 'clipboard', 
            size,
            duration,
            colorTokensCount: colorCount
        });

        return {
            success: true,
            method: 'clipboard',
            size,
            timestamp: new Date().toISOString(),
            message: `JSON com ${colorCount} tokens de cor copiado (${size} bytes)`,
            colorTokensCount: colorCount
        };
    } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error('export.failed', { 
            method: 'clipboard', 
            withColors: true,
            error: errorMessage,
            duration
        });
        
        throw new Error(
            `Failed to copy to clipboard with colors: ${errorMessage}`
        );
    }
}

/**
 * Faz download do JSON com tokens de cor como arquivo único
 * 
 * @param json - Objeto a ser baixado
 * @param filename - Nome do arquivo (padrão: figma-export.json)
 * @returns Resultado da operação
 */
export function exportToFileWithColors(
    json: any, 
    filename: string = 'figma-export.json'
): ExportResult {
    const startTime = performance.now();
    
    try {
        logger.info('export.started', { method: 'download', filename, withColors: true });
        
        const { figmaJson, colors } = exportWithColorTokens(json);
        const colorCount = Object.keys(colors).length;
        
        const payload = {
            figma: figmaJson,
            colors: colors,
            __metadata: {
                timestamp: new Date().toISOString(),
                version: '0.1.0',
                engine: 'figma-sync-engine',
                colorTokensCount: colorCount
            }
        };
        
        const jsonString = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const size = blob.size;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        const duration = Math.round(performance.now() - startTime);
        
        logger.info('export.completed', { 
            method: 'download', 
            filename,
            size,
            duration,
            colorTokensCount: colorCount
        });

        return {
            success: true,
            method: 'download',
            size,
            timestamp: new Date().toISOString(),
            message: `JSON com ${colorCount} tokens de cor baixado como ${filename} (${size} bytes)`,
            colorTokensCount: colorCount
        };
    } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error('export.failed', { 
            method: 'download', 
            filename,
            withColors: true,
            error: errorMessage,
            duration
        });
        
        throw new Error(
            `Failed to download file with colors: ${errorMessage}`
        );
    }
}

/**
 * Faz download separado de colors.json e figma.json
 * 
 * @param json - Objeto a ser exportado
 * @param baseFilename - Nome base dos arquivos (padrão: figma-export)
 * @returns Array com resultados de ambos os downloads
 */
export function exportToSeparateFiles(
    json: any,
    baseFilename: string = 'figma-export'
): ExportResult[] {
    const startTime = performance.now();
    
    try {
        logger.info('export.started', { 
            method: 'download', 
            mode: 'separate',
            baseFilename 
        });
        
        const { figmaJson, colors } = exportWithColorTokens(json);
        const colorCount = Object.keys(colors).length;
        
        const results: ExportResult[] = [];
        
        // Exportar colors.json
        if (colorCount > 0) {
            const colorsJson = serializeColorTokens(colors);
            const colorsBlob = new Blob([colorsJson], { type: 'application/json' });
            const colorsUrl = URL.createObjectURL(colorsBlob);
            
            const colorsLink = document.createElement('a');
            colorsLink.href = colorsUrl;
            colorsLink.download = `${baseFilename}.colors.json`;
            colorsLink.style.display = 'none';
            
            document.body.appendChild(colorsLink);
            colorsLink.click();
            document.body.removeChild(colorsLink);
            
            URL.revokeObjectURL(colorsUrl);
            
            results.push({
                success: true,
                method: 'download',
                size: colorsBlob.size,
                timestamp: new Date().toISOString(),
                message: `colors.json com ${colorCount} tokens baixado`,
                colorTokensCount: colorCount
            });
        }
        
        // Exportar figma.json
        const figmaJsonString = JSON.stringify(figmaJson, null, 2);
        const figmaBlob = new Blob([figmaJsonString], { type: 'application/json' });
        const figmaUrl = URL.createObjectURL(figmaBlob);
        
        const figmaLink = document.createElement('a');
        figmaLink.href = figmaUrl;
        figmaLink.download = `${baseFilename}.figma.json`;
        figmaLink.style.display = 'none';
        
        document.body.appendChild(figmaLink);
        figmaLink.click();
        document.body.removeChild(figmaLink);
        
        URL.revokeObjectURL(figmaUrl);
        
        results.push({
            success: true,
            method: 'download',
            size: figmaBlob.size,
            timestamp: new Date().toISOString(),
            message: `figma.json com referências baixado`
        });
        
        const duration = Math.round(performance.now() - startTime);
        
        logger.info('export.completed', { 
            method: 'download',
            mode: 'separate',
            filesCount: results.length,
            duration,
            colorTokensCount: colorCount
        });
        
        return results;
    } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error('export.failed', { 
            method: 'download',
            mode: 'separate',
            error: errorMessage,
            duration
        });
        
        throw new Error(
            `Failed to export to separate files: ${errorMessage}`
        );
    }
}
