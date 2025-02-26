import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { apiRoutes } from './src/plugin/api'
import { resolve } from 'path'

const webConfig = defineConfig({
  envDir: '.',
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm', '@seedprotocol/sdk', '@zenfs/core', 'drizzle-kit'],
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
      include: ['crypto', 'util', 'stream', 'url', 'path'],
    }),
    apiRoutes(),
  ],
  server: {
    port: 4004,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        '../seed-protocol-sdk/**/*',
        './',
      ]
    }
  },
  resolve: {
    alias: {
      fs: '@zenfs/core',
      'node:fs': '@zenfs/core',
      'node:path': 'path-browserify',
      path: 'path-browserify',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: [
        './index.html',
      ],
      external: ['@seedprotocol/sdk'],
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
  },
})

const cliConfig = defineConfig({
  build: {
    target: 'node18',
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/cli/index.ts'),
      formats: ['cjs'],  // CommonJS for Node.js
    },
    rollupOptions: {
      external: ['child_process', 'fs', 'path',],
    },
  }
})

export default ({ command }: { command: string }) => {
  if (command === 'build') {
    return [webConfig, cliConfig];
  }
  return webConfig;
};