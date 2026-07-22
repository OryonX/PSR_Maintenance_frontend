import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'

export default defineConfig({
  plugins: [
    react(),
    vike()
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets',
      '@hooks': '/src/hooks',
      '@config': '/src/config',
      '@locales': '/src/locales',
      '@seo': '/src/seo'
    }
  },
  ssr: {
    noExternal: ['react-helmet-async']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})