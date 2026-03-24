import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import glsl from 'vite-plugin-glsl'
import { vitePluginForArco } from '@arco-plugins/vite-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { codeInspectorPlugin } from 'code-inspector-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'APP')

  return {
    base: env.APP_BASE_URL || '/',
    envPrefix: 'APP',
    server: {
      host: '0.0.0.0',
      port: 8080,
      watch: {
        // 显式添加要监视的 node_modules
        ignored: ['./node_modules/@wiit/**'],
      },
    },
    plugins: [
      vue(),
      // glsl(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'unplugin/auto-imports.d.ts',
        dirs: ['src/hooks', 'src/utils', 'src/enum', 'src/apis', 'src/stores/*.ts'],
        resolvers: [],
      }),
      // Components({
      //   dts: 'unplugin/components.d.ts',
      //   dirs: ['src/components', 'src/views/**/**/components', 'src/layouts/**/components'],
      //   resolvers: [],
      // }),
      vitePluginForArco({
        style: 'css',
      }),
      createSvgIconsPlugin({
        // 指定 SVG图标 保存的文件夹路径
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        // 指定 使用svg图标的格式
        symbolId: 'icon-[dir]-[name]',
      }),
      codeInspectorPlugin({
        bundler: 'vite',
        editor: 'trae',
        showSwitch: true,
      }),
      // vueJsx(),
      // vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~/': `${path.resolve(__dirname, 'src')}/`,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `
           @use "~/assets/styles/theme.scss" as *;
           @use "~/assets/styles/media.scss" as *;
           `,
        },
      },
    },
    worker: {
      rollupOptions: {
        output: {
          entryFileNames: 'worker/[name]-[hash].js',
          chunkFileNames: 'worker/[name]-[hash].js',
        },
      },
    },

    build: {
      minify: 'esbuild',
      // minify: 'terser',
      // // 打包后的文件
      outDir: env.APP_OUT_DIR || 'dist',
      assetsDir: 'static',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1800,
      rollupOptions: {
        output: {
          entryFileNames: 'static/js/[name]-[hash].js',
          chunkFileNames: 'static/js/[name]-[hash].js',
          assetFileNames(assetInfo) {
            const imgExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico']
            if (assetInfo.name?.endsWith('.css')) {
              return 'static/css/[name]-[hash].css'
            }
            if (imgExts.some((ext) => assetInfo.name?.endsWith(ext))) {
              return 'static/images/[name]-[hash][ext]'
            }
            return 'assets/[name]-[hash][ext]'
          },

          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          },
        },
      },
    },
    define: {
      // enable hydration mismatch details in production build
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    },
  }
})
