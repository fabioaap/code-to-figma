/**
 * MVP-1: Registrar o Addon no Storybook
 */

import { addons, types } from '@storybook/addons';
import { ADDON_ID, PANEL_ID } from './shared';

// Import dinâmico para evitar JSX no arquivo TypeScript
let ExportPanel: any;

addons.register(ADDON_ID, (api) => {
    addons.add(PANEL_ID, {
        type: types.PANEL,
        title: '📤 Export to Figma',
        match: ({ viewMode }) => viewMode === 'story',
        render: ({ active, key }: any) => {
            if (!ExportPanel) {
                // Lazy load do painel
                const { ExportPanel: Panel } = require('./panel');
                ExportPanel = Panel;
            }
            return active ? ExportPanel({ key }) : null;
        }
    });
});
