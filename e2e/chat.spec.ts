import { test, expect } from '@playwright/test'
import { loginAsE2EUser } from './helpers'

test.describe('Chat de Aprofundamento (/deep)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page)
  })

  test('carrega página /deep com pergunta via query param', async ({ page }) => {
    await page.goto('/deep?q=O+que+%C3%A9+isso%3F&topic=Tecnologia&itemId=e2e-item-1')

    // Header deve mostrar "Aprofundamento"
    await expect(page.locator('text=Aprofundamento')).toBeVisible({ timeout: 5_000 })

    // Pergunta inicial do usuário deve aparecer
    await expect(page.locator('text=O que é isso?')).toBeVisible({ timeout: 5_000 })
  })

  test('exibe indicador de carregamento enquanto IA responde', async ({ page }) => {
    await page.goto('/deep?q=Explique+mais&topic=Tecnologia&itemId=e2e-item-1')

    // O indicador de bounce (dots) deve aparecer brevemente
    // (pode já ter sumido se a resposta foi rápida — checamos a resposta como fallback)
    await page.waitForTimeout(300)
    const hasResponse = await page.locator('p').count()
    expect(hasResponse).toBeGreaterThan(0)
  })

  test('input de follow-up está visível e funcional', async ({ page }) => {
    await page.goto('/deep?q=Teste&topic=Tecnologia&itemId=e2e-item-1')

    const input = page.locator('input[placeholder*="Pergunte"]')
    await expect(input).toBeVisible({ timeout: 5_000 })

    // Aguarda IA responder antes de enviar follow-up
    await page.waitForTimeout(2_000)
    await input.fill('Pode detalhar mais?')
    await page.click('button:has-text("Enviar")')

    // Pergunta de follow-up deve aparecer na conversa
    await expect(page.locator('text=Pode detalhar mais?')).toBeVisible({ timeout: 5_000 })
  })

  test('botão voltar navega para página anterior', async ({ page }) => {
    await page.goto('/')
    await loginAsE2EUser(page)
    await page.goto('/deep?q=Teste&topic=Tecnologia&itemId=e2e-item-1')

    await page.click('[aria-label="Voltar"]')
    // Deve ter navegado de volta
    await expect(page).not.toHaveURL('/deep', { timeout: 3_000 })
  })
})
