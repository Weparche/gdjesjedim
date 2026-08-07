import { test, expect } from '@playwright/test'

const VARIANTS = ['ivan gorupić', 'IVAN GORUPIĆ', 'Ivan']

for (const query of VARIANTS) {
  test(`guest search tolerates "${query}"`, async ({ page }) => {
    // Reuses the event published by happy-path.spec.js in the same localStorage-backed
    // dev server instance. Playwright's default storageState is shared per browser context
    // within a single run only when tests execute against the same origin/session; to keep
    // this test independently runnable, it re-publishes the event via the UI.
    await page.goto('/')
    await page.getByRole('button', { name: 'Krštenje' }).click()
    await page.getByRole('button', { name: 'Napravi besplatno' }).click()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /Učitaj pozivnicu/ }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({ name: 'invite.png', mimeType: 'image/png', buffer: Buffer.from('fake') })
    await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
    await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
    await page.locator('#guest-list').fill('Ivan Gorupić')
    await page.getByRole('button', { name: /Dodaj 1 gosta/ }).click()
    await page.getByRole('button', { name: 'Nastavi na stolove' }).click()
    await page.getByRole('button', { name: 'Dodaj stol' }).click()
    await page.getByRole('button', { name: 'Ivan Gorupić' }).click()
    await page.getByRole('dialog', { name: 'Odaberi stol' }).getByText('Stol 1').click()
    await page.getByRole('button', { name: 'Nastavi na objavu' }).click()
    await page.getByRole('button', { name: 'Objavi stranicu' }).click()

    const slugText = await page.getByText(/\/marijino-krstenje/).textContent()
    const slug = slugText.trim().split('/').pop()

    await page.goto(`/e/${slug}`)
    await page.getByLabel('Upiši svoje ime').fill(query)
    await page.getByRole('button', { name: 'Pronađi moj stol' }).click()
    await expect(page.getByText('STOL 1')).toBeVisible()
  })
}
