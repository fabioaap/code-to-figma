import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
    const [json, setJson] = useState('');
    const [status, setStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        window.onmessage = (event) => {
            const msg = event.data.pluginMessage;
            if (msg.type === 'import-success') {
                setStatus('success');
                setMessage(`Sucesso! ${msg.frameCount} frame(s), ${msg.childCount} elemento(s)`);
                setTimeout(() => setStatus('idle'), 3000);
            } else if (msg.type === 'import-error') {
                setStatus('error');
                setMessage(`Erro: ${msg.error}`);
            }
        };
    }, []);

    const handleImport = () => {
        if (!json.trim()) {
            setStatus('error');
            setMessage('Por favor, cole o JSON primeiro');
            return;
        }
        
        try {
            JSON.parse(json); // Validate JSON before sending
            setStatus('importing');
            setMessage('Importando...');
            parent.postMessage({ pluginMessage: { type: 'import-json', payload: json } }, '*');
        } catch (e) {
            setStatus('error');
            setMessage('JSON inválido: ' + (e instanceof Error ? e.message : 'erro desconhecido'));
        }
    };

    const handleCancel = () => {
        parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
    };

    const handleLoadExample = () => {
        const exampleJson = {
            root: {
                type: 'FRAME',
                name: 'Example Frame',
                layoutMode: 'VERTICAL',
                itemSpacing: 12,
                paddingTop: 20,
                paddingRight: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                primaryAxisAlignItems: 'CENTER',
                counterAxisAlignItems: 'CENTER',
                children: [
                    {
                        type: 'TEXT',
                        name: 'Title',
                        characters: 'Hello from Code!',
                        fontSize: 24
                    },
                    {
                        type: 'RECTANGLE',
                        name: 'Divider',
                        width: 200,
                        height: 2,
                        fills: [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }]
                    },
                    {
                        type: 'TEXT',
                        name: 'Subtitle',
                        characters: 'This is an example',
                        fontSize: 14
                    }
                ]
            }
        };
        setJson(JSON.stringify(exampleJson, null, 2));
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Importar JSON Figma</h3>
            
            <textarea 
                style={{ 
                    width: '100%', 
                    flex: 1,
                    minHeight: 200,
                    padding: 8, 
                    fontFamily: 'monospace',
                    fontSize: 12,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    resize: 'vertical'
                }} 
                value={json} 
                onChange={e => setJson(e.target.value)}
                placeholder='Cole o JSON do Figma aqui...'
            />
            
            {status !== 'idle' && (
                <div style={{ 
                    marginTop: 12, 
                    padding: 8, 
                    borderRadius: 4,
                    backgroundColor: status === 'success' ? '#d4edda' : status === 'error' ? '#f8d7da' : '#d1ecf1',
                    color: status === 'success' ? '#155724' : status === 'error' ? '#721c24' : '#0c5460',
                    fontSize: 12
                }}>
                    {message}
                </div>
            )}
            
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button
                    onClick={handleImport}
                    disabled={status === 'importing'}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: status === 'importing' ? '#ccc' : '#0066ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: status === 'importing' ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 500
                    }}
                >
                    {status === 'importing' ? 'Importando...' : 'Importar'}
                </button>
                <button
                    onClick={handleLoadExample}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: 'white',
                        color: '#333',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14
                    }}
                >
                    Exemplo
                </button>
            </div>
            
            <button
                onClick={handleCancel}
                style={{
                    marginTop: 8,
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12
                }}
            >
                Cancelar
            </button>
        </div>
    );
};

createRoot(document.getElementById('root')!).render(<App />);
