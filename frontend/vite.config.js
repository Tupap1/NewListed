import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Allow ngrok and other custom hosts
    allowedHosts: [
      'propretorian-britta-overbravely.ngrok-free.dev',
      '.ngrok-free.dev',  // Allow any ngrok subdomain
      '.ngrok.app',       // Allow ngrok.app domains
      '.ngrok.io',        // Allow classic ngrok.io domains
      'localhost'
    ],
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
