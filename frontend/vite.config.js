import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Allows access from ngrok and other external tunnels
    allowedHosts: true, 
    // Exposes the project on your local network (can test on phone browser)
    host: true, 
  }
})