import React, { useState } from 'react';
import { useChannel, useStorybookState } from '@storybook/manager-api';
import { EVENT_EXPORT_REQUEST, PANEL_ID } from './shared';

export const ExportPanel: React.FC = () => {
    const state = useStorybookState();
    const emit = useChannel({});
    const [status, setStatus] = useState<'idle' | 'working' | 'done'>('idle');

    const handleExport = () => {
        setStatus('working');
        emit(EVENT_EXPORT_REQUEST, { storyId: state.storyId });
        setStatus('done');
    };

    return (
        <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
            <h3>Exportar para Figma</h3>
            <p>História atual: <code>{state.storyId}</code></p>
            <button onClick={handleExport} disabled={status === 'working'}>
                {status === 'working' ? 'Exportando...' : 'Exportar JSON'}
            </button>
            {status === 'done' && <p>JSON gerado e enviado para preview (placeholder).</p>}
        </div>
    );
};
