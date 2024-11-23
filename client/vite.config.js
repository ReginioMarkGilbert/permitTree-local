import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
         '@components': path.resolve(__dirname, './src/components'),
         '@pages': path.resolve(__dirname, './src/pages'),
         '@utils': path.resolve(__dirname, './src/utils')
      }
   },
   build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
         output: {
            manualChunks: {
               vendor: ['react', 'react-dom'],
               apollo: ['@apollo/client']
            }
         }
      }
   },
   optimizeDeps: {
      include: ['react-hook-form'],
   },
   server: {
      port: 5174
   }
})
