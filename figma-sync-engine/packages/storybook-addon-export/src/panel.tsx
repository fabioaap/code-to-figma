import React, { useState } from 'react';
import { useChannel, useStorybookState } from '@storybook/manager-api';
import { 
    EVENT_EXPORT_REQUEST, 
    EVENT_EXPORT_RESPONSE,
    type ExportRequestPayload,
    type ExportResponsePayload,
    type FigmaExportData
} from './shared';
import { copyToClipboard, downloadJson, formatJsonSize } from './utils';

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export const ExportPanel: React.FC = () => {
    const state = useStorybookState();
    const [status, setStatus] = useState<ExportStatus>('idle');
    const [exportData, setExportData] = useState<FigmaExportData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const emit = useChannel({
        [EVENT_EXPORT_RESPONSE]: (payload: ExportResponsePayload) => {
            console.log('[Panel] Recebida resposta:', payload);
            
            if (payload.success && payload.data) {
                setStatus('success');
                setExportData(payload.data);
                setErrorMessage('');
            } else {
                setStatus('error');
                setErrorMessage(payload.error || 'Erro desconhecido');
                setExportData(null);
            }
        }
    });

    const handleExport = () => {
        if (!state.storyId) {
            setStatus('error');
            setErrorMessage('Nenhuma história selecionada');
            return;
        }

        setStatus('exporting');
        setErrorMessage('');
        setCopySuccess(false);
        setExportData(null);

        const payload: ExportRequestPayload = {
            storyId: state.storyId
        };

        emit(EVENT_EXPORT_REQUEST, payload);
    };

    const handleCopyToClipboard = async () => {
        if (!exportData) return;

        try {
            await copyToClipboard(exportData);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar:', error);
            alert(`Erro ao copiar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const handleDownload = () => {
        if (!exportData || !state.storyId) return;

        try {
            downloadJson(exportData, state.storyId);
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            alert(`Erro ao fazer download: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    return (
        <div style={{ 
            padding: '16px', 
            fontFamily: 'system-ui, sans-serif',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                    Exportar para Figma
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    História atual: <code style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        fontSize: '11px'
                    }}>{state.storyId || 'Nenhuma'}</code>
                </p>
            </div>

            <button 
                onClick={handleExport} 
                disabled={status === 'exporting' || !state.storyId}
                style={{
                    padding: '8px 16px',
                    backgroundColor: status === 'exporting' ? '#ccc' : '#0066ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: status === 'exporting' ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 500
                }}
            >
                {status === 'exporting' ? 'Exportando...' : 'Exportar JSON'}
            </button>

            {status === 'exporting' && (
                <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f0f7ff', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#0066ff'
                }}>
                    ⏳ Processando história...
                </div>
            )}

            {status === 'error' && (
                <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fff0f0', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#cc0000',
                    border: '1px solid #ffcccc'
                }}>
                    <strong>❌ Erro:</strong> {errorMessage}
                </div>
            )}

            {status === 'success' && exportData && (
                <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    flex: 1
                }}>
                    <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#f0fff4', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#00aa00',
                        border: '1px solid #ccffcc'
                    }}>
                        ✅ Exportação concluída!
                        <div style={{ marginTop: '4px', color: '#666' }}>
                            Tamanho: {formatJsonSize(exportData)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={handleCopyToClipboard}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: copySuccess ? '#00aa00' : '#fff',
                                color: copySuccess ? '#fff' : '#333',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500
                            }}
                        >
                            {copySuccess ? '✓ Copiado!' : '📋 Copiar'}
                        </button>
                        <button 
                            onClick={handleDownload}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: '#fff',
                                color: '#333',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500
                            }}
                        >
                            💾 Download
                        </button>
                    </div>

                    <details style={{ fontSize: '11px' }}>
                        <summary style={{ 
                            cursor: 'pointer', 
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            userSelect: 'none'
                        }}>
                            Visualizar JSON
                        </summary>
                        <pre style={{ 
                            marginTop: '8px',
                            padding: '12px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxHeight: '300px',
                            fontSize: '10px',
                            lineHeight: '1.4'
                        }}>
                            {JSON.stringify(exportData, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};

