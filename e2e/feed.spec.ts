import { test, expect } from '@playwright/test'
import { loginAsE2EUser } from './helpers'

test.describe('Feed', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page)
  })

  test('exibe o header com "feed pessoal"', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=feed pessoal')).toBeVisible({ timeout: 10_000 })
  })

  test('exibe pelo menos um card de notícia', async ({ page }) => {
    await page.goto('/')
    // Cards têm data-item-id
    const cards = page.locator('[data-item-id]')
    await expect(cards.first()).toBeVisible({ timeout: 10_000 })
  })

  test('exibe botão de recriar feed', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button', { hasText: 'Recriar feed' })).toBeVisible({ timeout: 10_000 })
  })

  test('abre modal ao clicar em um card', async ({ page }) => {
    await page.goto('/')
    // Clica no primeiro card que seja clicável
    const firstCard = page.locator('[data-item-id]').first()
    await firstCard.waitFor({ timeout: 10_000 })
    await firstCard.click()

    // Modal deve aparecer com algum conteúdo
    const modal = page.locator('[role="dialog"], [data-modal]').first()
    // Se não há role=dialog, procura pelo overlay ou pelo resumo
    const modalContent = page.locator('text=Resumo').or(page.locator('text=resumo')).first()
    await expect(modalContent.or(modal)).toBeVisible({ timeout: 5_000 })
  })

  test('exibe seções por tópico', async ({ page }) => {
    await page.goto('/')
    // Tópico "Tecnologia" deve aparecer como cabeçalho de seção
    const topicHeader = page.locator('text=Tecnologia').first()
    await expect(topicHeader).toBeVisible({ timeout: 10_000 })
  })
})
