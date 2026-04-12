import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,           // Allow access from network
    port: 5173,           // Try to use 5173 first
    strictPort: false,    // Allow fallback to any available port if 5173 is busy
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});