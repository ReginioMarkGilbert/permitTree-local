import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
      },
   },
   server: {
      port: 5174,
   },
   optimizeDeps: {
      include: ['react-hook-form'],
   },
   test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/tests/setup.js',
      include: [
         'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
   }
});
