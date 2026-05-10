import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react') || id.includes('react-router-dom')) return 'react';
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) return 'state';
          if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-hot-toast')) return 'ui';
          if (id.includes('recharts')) return 'charts';
          return 'vendor';
        },
      },
    },
  },
})
