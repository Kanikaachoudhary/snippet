import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server on :5173. All /api requests are proxied to the Express
// back-end on :3001 so the two run on separate ports with no CORS hassle.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
