import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,                 // cold start del free tier de Render
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',   // el FRONT (la api usa API_BASE_URL)
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
})
