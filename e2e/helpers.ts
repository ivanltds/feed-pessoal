import { Page } from '@playwright/test'
import { E2E_USER_ID } from './global-setup'

/**
 * Injeta o cookie de usuário E2E na página, simulando usuário já autenticado.
 * Chame antes de qualquer navegação que precise do userId.
 */
export async function loginAsE2EUser(page: Page) {
  await page.context().addCookies([
    {
      name: 'userId',
      value: E2E_USER_ID,
      domain: 'localhost',
      path: '/',
    },
  ])
}
