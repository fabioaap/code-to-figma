import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(tsx|ts)'],
    addons: [
        '@storybook/addon-essentials',
        '@figma-sync-engine/storybook-addon-export'
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
};
export default config;
