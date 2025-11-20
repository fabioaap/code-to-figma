import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
    const [json, setJson] = useState('');
    const handleImport = () => {
        parent.postMessage({ pluginMessage: { type: 'import-json', payload: json } }, '*');
    };
    return (
        <div style={{ fontFamily: 'sans-serif', padding: 8 }}>
            <h4>Importar JSON Figma</h4>
            <textarea style={{ width: '100%', height: 120 }} value={json} onChange={e => setJson(e.target.value)} />
            <button onClick={handleImport} style={{ marginTop: 8 }}>Importar</button>
        </div>
    );
};

createRoot(document.getElementById('root')!).render(<App />);
