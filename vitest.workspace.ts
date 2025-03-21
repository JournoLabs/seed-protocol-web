import { defineWorkspace } from 'vitest/config'
import tsConfigPaths       from 'vite-tsconfig-paths'

export default defineWorkspace([
  {
    plugins: [
    ],
    optimizeDeps: {
      exclude: [
        '@sqlite.org/sqlite-wasm',
      ],
    },
    test: {
      name: 'browser',
      environment: 'jsdom',
      globalSetup: './vitest.setup.ts',
      dir: './__tests__/',
      exclude: [
        '**/node_modules/**',
        'dist/**',
        'src/app-files/**',
        '__tests__/container/**',
        '__tests__/bin/**'
      ],
      pool: 'forks',
      hookTimeout: 60000,
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        // https://playwright.dev
      },
    },
  },
  {
    plugins: [
    ],
    test: {
      name: 'NodeJS',
      environment: 'node',
      globalSetup: './vitest.setup.ts',
      dir: './__tests__/',
      exclude: [ '**/node_modules/**', 'dist/**',],
    },
  },
  {
    plugins: [
    ],
    test: {
      name: 'CLI',
      environment: 'node',
      dir: './__tests__/',
      exclude: [ '**/node_modules/**', 'dist/**', ],
    },
  },
])
