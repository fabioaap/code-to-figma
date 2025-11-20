import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rename-ui-html',
      apply: 'build',
      enforce: 'post',
      generateBundle() {
        // This hook runs after bundle generation
        // We'll rename the HTML file in the closeBundle hook
      },
      closeBundle() {
        // Move src/index.html to ui.html
        const srcHtml = path.join('dist/src', 'index.html');
        const destHtml = path.join('dist', 'ui.html');

        if (fs.existsSync(srcHtml)) {
          fs.mkdirSync(path.dirname(destHtml), { recursive: true });
          fs.renameSync(srcHtml, destHtml);

          // Remove empty src directory if it exists
          const srcDir = path.join('dist/src');
          if (fs.existsSync(srcDir) && fs.readdirSync(srcDir).length === 0) {
            fs.rmdirSync(srcDir);
          }
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        code: 'src/code.ts',
        ui: 'src/index.html',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
