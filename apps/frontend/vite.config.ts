import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Use tsconfig paths
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
});