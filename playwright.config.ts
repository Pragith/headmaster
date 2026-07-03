import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.HEADMASTER_E2E_BASE_URL || 'http://127.0.0.1:41869',
    headless: true,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
  },
})
