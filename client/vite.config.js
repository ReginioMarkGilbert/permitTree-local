import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          apollo: ['@apollo/client']
        }
      }
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/graphql': {
        target: 'https://permittree.vercel.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
   