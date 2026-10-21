import { defineConfig } from 'vite'

const cerebroApiOrigin = process.env.CEREBRO_API_ORIGIN || 'http://127.0.0.1:8765'

export default defineConfig({
  base: '/jarvis/',
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: cerebroApiOrigin,
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', request => request.setHeader('Origin', cerebroApiOrigin))
        },
      },
    },
  },
  build: { outDir: 'dist' },
})
