import { defineConfig } from 'vite'
import uni from "@dcloudio/vite-plugin-uni"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:7001', // 你后端 API 的地址
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '') // 可选：去掉 /api 前缀
      }
    }
  },
})
