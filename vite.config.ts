import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/perfect-line/',
  build: {
    outDir: 'dist',
  },
  // Skip TypeScript checking during build to avoid JSON module issues
  optimizeDeps: {
    esbuildOptions: {
      // Avoid TypeScript-related build issues
      tsconfig: false,
    },
  },
})
