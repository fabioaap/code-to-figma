import React, { useState } from 'react';
import { useChannel, useStorybookState } from '@storybook/manager-api';
import { EVENT_EXPORT_REQUEST, EVENT_EXPORT_COMPLETE, ExportResult, ExportLog } from './shared';

export const ExportPanel: React.FC = () => {
    const state = useStorybookState();
    const emit = useChannel({});
    const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
    const [exportResult, setExportResult] = useState<ExportResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const handleExport = async () => {
        try {
            setStatus('working');
            setErrorMsg('');
            
            // Log export start
            const startLog: ExportLog = {
                event: 'export-start',
                storyId: state.storyId || 'unknown',
                timestamp: new Date().toISOString()
            };
            console.log('[Figma Export]', startLog);

            // Emit export request
            emit(EVENT_EXPORT_REQUEST, { storyId: state.storyId });

            // Simulate export result (in real implementation, this would come from preview)
            const mockResult: ExportResult = {
                storyId: state.storyId || 'unknown',
                json: JSON.stringify({
                    root: {
                        type: 'FRAME',
                        name: state.storyId || 'Story',
                        layoutMode: 'HORIZONTAL',
                        itemSpacing: 8,
                        paddingTop: 16,
                        paddingRight: 16,
                        paddingBottom: 16,
                        paddingLeft: 16,
                        primaryAxisAlignItems: 'MIN',
                        counterAxisAlignItems: 'MIN',
                        children: []
                    }
                }, null, 2),
                size: 0,
                timestamp: new Date().toISOString()
            };
            mockResult.size = mockResult.json.length;

            setExportResult(mockResult);
            setStatus('done');

            // Log export complete
            const completeLog: ExportLog = {
                event: 'export-complete',
                storyId: mockResult.storyId,
                size: mockResult.size,
                timestamp: mockResult.timestamp
            };
            console.log('[Figma Export]', completeLog);
        } catch (error) {
            setStatus('error');
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setErrorMsg(errorMessage);
            
            const errorLog: ExportLog = {
                event: 'export-error',
                storyId: state.storyId || 'unknown',
                timestamp: new Date().toISOString(),
                error: errorMessage
            };
            console.error('[Figma Export]', errorLog);
        }
    };

    const handleCopyToClipboard = async () => {
        if (!exportResult) return;
        
        try {
            await navigator.clipboard.writeText(exportResult.json);
            alert('JSON copiado para área de transferência!');
        } catch (error) {
            alert('Falha ao copiar JSON: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const handleDownload = () => {
        if (!exportResult) return;
        
        const blob = new Blob([exportResult.json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportResult.storyId.replace(/[^a-zA-Z0-9]/g, '-')}.figma.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
            <h3>Exportar para Figma</h3>
            <p>História atual: <code>{state.storyId || 'N/A'}</code></p>
            
            <button 
                onClick={handleExport} 
                disabled={status === 'working'}
                style={{
                    padding: '8px 16px',
                    backgroundColor: status === 'working' ? '#ccc' : '#0066ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: status === 'working' ? 'not-allowed' : 'pointer',
                    fontSize: 14
                }}
            >
                {status === 'working' ? 'Exportando...' : 'Exportar JSON'}
            </button>
            
            {status === 'done' && exportResult && (
                <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
                    <p style={{ margin: 0, marginBottom: 8, color: 'green' }}>
                        ✓ JSON gerado com sucesso! ({exportResult.size} bytes)
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={handleCopyToClipboard}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
                            }}
                        >
                            📋 Copiar
                        </button>
                        <button
                            onClick={handleDownload}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
                            }}
                        >
                            💾 Download
                        </button>
                    </div>
                </div>
            )}
            
            {status === 'error' && (
                <p style={{ marginTop: 8, color: 'red' }}>
                    ✗ Erro ao exportar: {errorMsg}
                </p>
            )}
        </div>
    );
};
