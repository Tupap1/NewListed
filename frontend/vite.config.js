import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          axios: ['axios']
        }
      }
    }
  },

  // Development server configuration
  server: {
    host: true,
    port: 5173,
    // Allow ngrok and other custom hosts
    allowedHosts: [
      'propretorian-britta-overbravely.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.app',
      '.ngrok.io',
      'localhost',
      '.railway.app'  // Allow Railway domains
    ],
    watch: {
      usePolling: true
    },
    // Proxy only for development (production uses VITE_API_URL)
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Define global constants for the app
  define: {
    // Use environment variable in production, fallback for development
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || '/api'
    )
  }
})
