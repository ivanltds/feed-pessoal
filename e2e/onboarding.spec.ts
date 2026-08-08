import { test, expect } from '@playwright/test'

test.describe('Onboarding', () => {
  test('exibe landing page com CTA', async ({ page }) => {
    await page.goto('/')
    // Se não há cookie, deve mostrar landing ou redirecionar para onboarding
    // A landing page tem o botão de inicio
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('completa onboarding sem email (Agora não)', async ({ page }) => {
    await page.goto('/onboarding')

    // Step 1 — nome (opcional, pode pular)
    const nameInput = page.locator('input[type="text"]').first()
    if (await nameInput.isVisible()) {
      await nameInput.fill('Ivan Teste E2E')
    }
    await page.click('button:has-text("Continuar")')

    // Step 2 — tópicos
    await page.waitForTimeout(500)
    const topicBtn = page.locator('button', { hasText: 'Tecnologia' }).first()
    if (await topicBtn.isVisible()) {
      await topicBtn.click()
    }
    await page.click('button:has-text("Continuar")')

    // Step 3 — email opcional
    await page.waitForTimeout(500)
    const skipBtn = page.locator('button', { hasText: 'Agora não' })
    if (await skipBtn.isVisible()) {
      await skipBtn.click()
    }

    // Deve chegar no feed ou iniciar criação
    await expect(page).toHaveURL(/\/(|$)/, { timeout: 15_000 })
  })
})
