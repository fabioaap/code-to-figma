import type { StorybookConfig } from '@storybook/react-vite';
import { ADDON_ID, PANEL_ID } from '@figma-sync-engine/storybook-addon-export';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(tsx|ts)'],
    addons: [
        '@storybook/addon-essentials',
        // Placeholder: registrar nosso painel custom (implementação futura via preset).
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
};
export default config;
