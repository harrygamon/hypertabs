import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

/**
 * Vite configuration for HyperTabs Chrome Extension
 * 
 * Uses CRXJS plugin for Chrome extension bundling with hot reload
 * and Svelte for the UI components.
 */
export default defineConfig({
  plugins: [
    svelte(),
    crx({ manifest }),
  ],
  build: {
    // Ensure output is compatible with Chrome extensions
    target: 'esnext',
    // Output directory for the built extension
    outDir: 'dist',
  },
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': '/src',
      '@lib': '/src/lib',
      '@components': '/src/popup/components',
    },
  },
});
