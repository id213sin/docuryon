import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileTreePlugin } from './vite-plugin-file-tree'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    fileTreePlugin({
      // DOCURYON_TRUNK_PATH env var takes priority, fallback to './trunk'
      trunkPath: process.env.DOCURYON_TRUNK_PATH || './trunk'
    })
  ],
  base: '/docuryon/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
