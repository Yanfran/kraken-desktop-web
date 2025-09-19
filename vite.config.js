// vite.config.js - VERSIÓN ACTUALIZADA SIN WARNINGS
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
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@contexts': path.resolve(__dirname, './src/contexts')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // ✅ NUEVA SINTAXIS - Sin warnings
        additionalData: `
          @use "@styles/variables.scss" as *;
          @use "@styles/mixins.scss" as *;
          @use "@styles/breakpoints.scss" as *;
        `,
        // ✅ SILENCIAR WARNINGS DE DEPRECACIÓN (opcional)
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})