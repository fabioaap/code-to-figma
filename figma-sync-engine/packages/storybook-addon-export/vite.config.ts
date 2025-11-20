import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        emptyOutDir: false, // Não limpa o diretório para preservar os arquivos .d.ts do tsc
        lib: {
            entry: {
                index: path.resolve(__dirname, 'src/index.ts'),
                register: path.resolve(__dirname, 'src/register.ts'),
                preview: path.resolve(__dirname, 'src/preview.ts')
            },
            name: 'StorybookAddonExport',
            formats: ['es']
        },
        rollupOptions: {
            external: [
                'react', 
                'react-dom', 
                '@storybook/addons', 
                '@storybook/manager-api', 
                '@storybook/preview-api',
                '@storybook/components',
                '@figma-sync-engine/html-to-figma-core',
                '@figma-sync-engine/autolayout-interpreter'
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                },
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name]-[hash].js'
            }
        }
    }
});
