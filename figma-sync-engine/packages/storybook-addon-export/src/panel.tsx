/**
 * MVP-1: Painel de Exportação do Addon
 * Interface visual para exportar componentes para Figma
 */

import React, { useState } from 'react';
import { useStorybookState } from '@storybook/manager-api';
import { captureStoryHTML } from './captureHtml';
import { exportToClipboard, addExportMetadata, exportToFile, validateFigmaJson } from './export';
import { CSSProperties } from 'react';

type Status = 'idle' | 'capturing' | 'exporting' | 'success' | 'error';

const statusMessages: Record<Status, string> = {
    idle: 'Pronto para exportar',
    capturing: 'Capturando HTML...',
    exporting: 'Exportando...',
    success: '✅ Exportado com sucesso!',
    error: '❌ Erro na exportação'
};

export const ExportPanel: React.FC = () => {
    const state = useStorybookState();
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string>('');
    const [exportMethod, setExportMethod] = useState<'clipboard' | 'download'>('clipboard');
    const [duration, setDuration] = useState<number | null>(null);

    const handleExport = async () => {
        try {
            setError('');
            setStatus('capturing');
            const startTime = performance.now();

            // Passo 1: Capturar HTML
            const capture = await captureStoryHTML();
            if (!capture.html) {
                throw new Error('Nenhum HTML capturado');
            }

            // Passo 2: Criar JSON Figma simples
            let figmaJson: any = {
                type: 'FRAME',
                name: state.storyId || 'Exported Component',
                children: [],
                __html: capture.html
            };

            // Passo 3: Validar JSON antes de exportar
            if (!validateFigmaJson(figmaJson)) {
                throw new Error('JSON Figma inválido - estrutura não reconhecida');
            }

            // Passo 4: Adicionar metadados
            figmaJson = addExportMetadata(figmaJson, {
                storyId: state.storyId || 'unknown',
                nodeCount: capture.nodeCount,
                hasInteractiveElements: capture.hasInteractiveElements,
                timestamp: new Date().toISOString()
            });

            setStatus('exporting');
            // Passo 5: Exportar
            let result;
            if (exportMethod === 'clipboard') {
                result = await exportToClipboard(figmaJson);
            } else {
                const filename = `figma-${state.storyId || 'export'}.json`;
                result = exportToFile(figmaJson, filename);
            }

            if (!result.success) {
                throw new Error('Falha ao exportar');
            }

            // Calcular duração
            const elapsed = Math.round(performance.now() - startTime);
            setDuration(elapsed);
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setDuration(null);
            }, 3000);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
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
                {duration !== null && status === 'success' && (
                    <span style={{ marginLeft: '8px', fontWeight: 700 }}>
                        ⏱️ {duration}ms
                    </span>
                )}
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
            {status === 'success' && <div style={styles.successMsg}>JSON exportado com sucesso! Pronto para importar no Figma.</div>}
        </div>
    );
};
