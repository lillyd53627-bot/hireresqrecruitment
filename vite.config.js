import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,           // Allow access from network
    port: 5178,           // You can change this if needed
    strictPort: false,    // Use any available port if 5178 is busy
    https: false,         // Keep false for now to avoid frame issues
  },
});