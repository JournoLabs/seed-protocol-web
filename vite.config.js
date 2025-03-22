import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { apiRoutes } from './src/plugin/api';
import { resolve } from 'path';
import { dependencies } from './package.json'
import tailwindcss from '@tailwindcss/vite';

const renderChunks = (deps) => {
    let chunks = {};
    Object.keys(deps).forEach((key) => {
      if (['react', 'react-router-dom', 'react-dom'].includes(key)) return;
      chunks[key] = [key];
    });
    return chunks;
  }

const webConfig = defineConfig({
    envDir: '.',
    optimizeDeps: {
        exclude: ['@sqlite.org/sqlite-wasm',],
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
        apiRoutes(),
        tailwindcss(),
    ],
    server: {
        port: 4004,
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        },
        fs: {
            allow: [
                '../seed-protocol-sdk',
                './'
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
            output: {
                format: 'es',
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
                assetFileNames: '[name]-[hash][extname]',
                manualChunks: {
                    vendor: ['react', 'react-router-dom', 'react-dom'],
                    ...renderChunks(dependencies),
                },
            },
        },
    },
});

const containerConfig = defineConfig({
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

export default ({ command }) => {
//   if (command === 'build') {
//     return [webConfig, cliConfig];
//   }
  return webConfig;
};
