import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    // Tailwind CSS plugin
    tailwindcss(),
  ],
  server: {
    proxy: {
      // proxies for API requests
      '/calendars': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
      },
    },
  },
});
