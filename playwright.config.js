import { defineConfig } from '@playwright/test'

const viewportWidth = Number(process.env.PW_VIEWPORT_WIDTH ?? 390)
const viewportHeight = Number(process.env.PW_VIEWPORT_HEIGHT ?? 844)

export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: viewportWidth, height: viewportHeight },
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 30000
  }
})
