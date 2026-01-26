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
    host: true,      // Enables 0.0.0.0 for external connections (Railway requirement)
    strictPort: true, // Forces port 5173, fails if unavailable (Railway requirement)
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
    // Using direct IP to avoid IPv6 resolution issues in Docker
    proxy: {
      '/api': {
        target: 'http://172.20.0.3:5000',
        changeOrigin: true,
        secure: false,
        ws: true
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
