import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { apiRoutes } from './src/plugin/api'


export default defineConfig({
  envDir: '.',
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { "legacy": true }]
        ]
      }
    }),
    nodePolyfills({
      include: ['crypto', 'util', 'stream'],
    }),
    apiRoutes()
  ],
  server: {
    port: 4004,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  resolve: {
    alias: {
      fs: '@zenfs/core',
      'node:fs': '@zenfs/core',
      'node:path': 'path-browserify',
      path: 'path-browserify',
    },
  },
})
