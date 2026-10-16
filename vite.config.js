import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  esbuild: {
    // 生产构建移除 console 和 debugger
    drop: command === 'build' ? ['console', 'debugger'] : []
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          alpine: ['alpinejs'],
          decimal: ['decimalish']
        }
      }
    },
    chunkSizeWarningLimit: 100
  }
}))
