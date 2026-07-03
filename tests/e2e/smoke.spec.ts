import { expect, test } from '@playwright/test'

test('healthz responds', async ({ request }) => {
  const response = await request.get('/api/healthz')
  expect(response.ok()).toBeTruthy()
})

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('oidc login reaches nodes when live credentials are provided', async ({ page }) => {
  test.skip(!process.env.HEADMASTER_E2E_USERNAME || !process.env.HEADMASTER_E2E_PASSWORD, 'Live OIDC credentials not provided')

  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.goto('/')

  if (page.url().includes('/login')) {
    await page.getByRole('link', { name: 'Sign in' }).click()
  }

  const usernameField = page.locator('input[name="username"], #username').first()
  const loginVisible = await usernameField.isVisible().catch(() => false)

  if (page.url().includes('/protocol/openid-connect/auth') || loginVisible) {
    await usernameField.fill(process.env.HEADMASTER_E2E_USERNAME!)
    await page.locator('input[name="password"], #password').first().fill(process.env.HEADMASTER_E2E_PASSWORD!)
    await page.getByRole('button', { name: /sign in|log in/i }).click()
  }

  await page.waitForURL(/headmaster\.lab\.pragith\.net|127\.0\.0\.1:41869/, { timeout: 30_000 })
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('link', { name: 'Nodes' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Nodes' })).toBeVisible({ timeout: 15_000 })

  for (const route of ['/users', '/keys', '/apikeys', '/routes', '/auth', '/policy', '/settings', '/audit']) {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible()
  }

  expect(consoleErrors).toEqual([])
})
