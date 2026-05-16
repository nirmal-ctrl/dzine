import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const root = process.cwd();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(root, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        background: resolve(root, 'src/background/index.ts'),
        content: resolve(root, 'src/content/index.tsx'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          if (chunkInfo.name === 'content') {
            return 'content.js';
          }
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.includes('content')) {
            return 'content.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
