import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // 启用代码分割和 tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          'alpine': ['alpinejs'],
          'decimal': ['decimalish']
        }
      }
    },
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 100,
    // CSS 代码分割
    cssCodeSplit: true
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['alpinejs', 'decimalish']
  }
})
