import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['apollo-upload-client']
  },
  build: {
    commonjsOptions: {
      include: [/apollo-upload-client/, /node_modules/]
    }
  }
})
