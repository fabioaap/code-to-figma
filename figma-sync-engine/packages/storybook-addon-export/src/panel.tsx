/**
 * MVP-1: Painel de Exportação do Addon
 * Interface visual para exportar componentes para Figma
 */

import React, { useState } from 'react';
import { useStorybookState } from '@storybook/manager-api';
import { captureStoryHTML } from './captureHtml';
import { exportToClipboard, addExportMetadata, exportToFile } from './export';
import { convertHtmlToFigma } from '@figma-sync-engine/html-to-figma-core';
import { applyAutoLayoutRecursive } from '@figma-sync-engine/autolayout-interpreter';
import { CSSProperties } from 'react';

type Status = 'idle' | 'capturing' | 'exporting' | 'success' | 'error';

const statusMessages: Record<Status, string> = {
    idle: 'Pronto para exportar componente',
    capturing: '⏳ Capturando HTML do componente...',
    exporting: '🔄 Convertendo para Figma e aplicando Auto Layout...',
    success: '✅ Exportado com sucesso!',
    error: '❌ Erro na exportação'
};

export const ExportPanel: React.FC = () => {
    const state = useStorybookState();
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string>('');
    const [exportMethod, setExportMethod] = useState<'clipboard' | 'download'>('clipboard');

    const handleExport = async () => {
        const startTime = Date.now();
        
        try {
            setError('');
            setStatus('capturing');

            // ========================================
            // PASSO 1: Capturar HTML
            // ========================================
            console.log('[MVP-5] Iniciando exportação', {
                storyId: state.storyId,
                timestamp: new Date().toISOString()
            });

            const capture = await captureStoryHTML();
            if (!capture.html) {
                throw new Error('Nenhum HTML capturado');
            }

            console.log('[MVP-5] HTML capturado', {
                nodeCount: capture.nodeCount,
                hasInteractiveElements: capture.hasInteractiveElements,
                htmlSize: capture.html.length
            });

            // ========================================
            // PASSO 2: Converter HTML → Figma JSON
            // ========================================
            setStatus('exporting'); // Usando 'exporting' para conversão também
            
            const figmaJson = await convertHtmlToFigma(capture.html);
            
            console.log('[MVP-5] HTML convertido para Figma JSON', {
                type: figmaJson.type,
                hasChildren: !!figmaJson.children,
                childCount: figmaJson.children?.length || 0
            });

            // ========================================
            // PASSO 3: Aplicar Auto Layout
            // ========================================
            // Note: Using 'as any' here because ConversionResult and FigmaNode have slightly
            // different type definitions. This is safe as the conversion result is compatible
            // with what applyAutoLayoutRecursive expects. Future: align types across packages.
            const withAutoLayout = applyAutoLayoutRecursive(figmaJson as any, (_node: any) => {
                // Extrair CSS do nó se disponível
                // TODO (MVP-4+): Implement CSS extraction from captured HTML
                // This would analyze computed styles from the original HTML and pass them
                // to applyAutoLayout for more accurate layout property mapping.
                // For now, returning empty object - basic layout is still applied based on
                // node structure from html-to-figma conversion.
                return {};
            });

            console.log('[MVP-5] Auto Layout aplicado');

            // ========================================
            // PASSO 4: Adicionar metadados
            // ========================================
            const finalJson = addExportMetadata(withAutoLayout, {
                storyId: state.storyId || 'unknown',
                nodeCount: capture.nodeCount,
                hasInteractiveElements: capture.hasInteractiveElements,
                captureTimestamp: new Date().toISOString(),
                exportMethod
            });

            // ========================================
            // PASSO 5: Exportar (clipboard ou download)
            // ========================================
            let result;
            if (exportMethod === 'clipboard') {
                result = await exportToClipboard(finalJson);
            } else {
                const filename = `${state.storyId || 'component'}.figma.json`;
                result = exportToFile(finalJson, filename);
            }

            if (!result.success) {
                throw new Error('Falha ao exportar');
            }

            const duration = Date.now() - startTime;
            
            // ========================================
            // MÉTRICAS FINAIS (MVP-9 prep)
            // ========================================
            console.log('[MVP-5] Exportação concluída com sucesso!', {
                storyId: state.storyId,
                exportMethod: result.method,
                jsonSize: result.size,
                duration: `${duration}ms`,
                timestamp: result.timestamp
            });

            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            const duration = Date.now() - startTime;
            const message = err instanceof Error ? err.message : String(err);
            
            console.error('[MVP-5] Erro na exportação:', {
                storyId: state.storyId,
                error: message,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString()
            });
            
            setError(message);
            setStatus('error');
        }
    };

    const styles = {
        container: {
            padding: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            marginBottom: '16px'
        } as CSSProperties,
        header: {
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#333'
        } as CSSProperties,
        storyInfo: {
            fontSize: '12px',
            color: '#666',
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all' as const
        } as CSSProperties,
        statusBar: {
            fontSize: '12px',
            padding: '8px 12px',
            borderRadius: '4px',
            marginBottom: '12px',
            backgroundColor: status === 'success' ? '#d4edda' : 
                           status === 'error' ? '#f8d7da' : '#e7f3ff',
            color: status === 'success' ? '#155724' : 
                   status === 'error' ? '#721c24' : '#004085',
            fontWeight: 500
        } as CSSProperties,
        controls: {
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            flexWrap: 'wrap' as const
        } as CSSProperties,
        button: {
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 500,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#0066cc',
            color: 'white',
            transition: 'all 0.2s'
        } as CSSProperties,
        selectButton: {
            padding: '6px 8px',
            fontSize: '11px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        } as CSSProperties,
        errorMsg: {
            fontSize: '12px',
            color: '#721c24',
            backgroundColor: '#f8d7da',
            padding: '8px',
            borderRadius: '4px',
            marginTop: '8px'
        } as CSSProperties,
        successMsg: {
            fontSize: '12px',
            color: '#155724',
            backgroundColor: '#d4edda',
            padding: '8px',
            borderRadius: '4px',
            marginTop: '8px'
        } as CSSProperties
    };

    const isWorking = status !== 'idle' && status !== 'success' && status !== 'error';

    return (
        <div style={styles.container}>
            <div style={styles.header}>📤 Exportar para Figma</div>
            
            <div style={styles.storyInfo}>
                <strong>Story:</strong> {state.storyId || 'nenhuma selecionada'}
            </div>

            <div style={styles.statusBar}>
                {statusMessages[status]}
            </div>

            <div style={styles.controls}>
                <button 
                    onClick={handleExport} 
                    disabled={isWorking}
                    style={{
                        ...styles.button,
                        opacity: isWorking ? 0.6 : 1,
                        cursor: isWorking ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isWorking ? `${statusMessages[status]}` : '📥 Exportar'}
                </button>
                
                <button 
                    onClick={() => setExportMethod('clipboard')}
                    style={{
                        ...styles.selectButton,
                        backgroundColor: exportMethod === 'clipboard' ? '#0066cc' : '#e0e0e0',
                        color: exportMethod === 'clipboard' ? 'white' : '#333'
                    }}
                    title="Copiar para clipboard"
                >
                    📋
                </button>
                
                <button 
                    onClick={() => setExportMethod('download')}
                    style={{
                        ...styles.selectButton,
                        backgroundColor: exportMethod === 'download' ? '#0066cc' : '#e0e0e0',
                        color: exportMethod === 'download' ? 'white' : '#333'
                    }}
                    title="Fazer download do arquivo"
                >
                    💾
                </button>
            </div>

            {error && <div style={styles.errorMsg}>⚠️ {error}</div>}
            {status === 'success' && (
                <div style={styles.successMsg}>
                    <div>✅ JSON exportado via {exportMethod === 'clipboard' ? 'clipboard' : 'download'}!</div>
                    <div>Pronto para importar no Figma. Verifique o console para métricas detalhadas.</div>
                </div>
            )}
        </div>
    );
};
