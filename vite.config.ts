import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: './'
        },
        {
          src: 'assets/*',
          dest: './assets/'
        },
        {
          src: 'onboarding.html',
          dest: './'
        },
        {
          src: 'onboarding.css',
          dest: './'
        },
        {
          src: 'onboarding.js',
          dest: './'
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        sidepanel: 'index.html',
        background: 'src/background/index.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'src/background/background.js';
          }
          return 'assets/[name].[hash].js';
        }
      }
    }
  }
});