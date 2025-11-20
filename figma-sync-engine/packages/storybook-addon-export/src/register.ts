import React from 'react';
import { addons, types } from '@storybook/addons';
import { ADDON_ID, PANEL_ID } from './shared';
import { ExportPanel } from './panel';

addons.register(ADDON_ID, () => {
    addons.add(PANEL_ID, {
        type: types.PANEL,
        title: 'Figma Export',
        render: ({ active }) => {
            if (!active) return null;
            return React.createElement(ExportPanel, {});
        }
    });
});
