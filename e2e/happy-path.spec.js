import { test, expect } from '@playwright/test'

async function publishMarijinoKrstenje(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Krštenje' }).click()
  await page.getByRole('button', { name: 'Napravi besplatno' }).click()

  await expect(page).toHaveURL(/\/create\/upload/)
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /Učitaj pozivnicu/ }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({ name: 'invite.png', mimeType: 'image/png', buffer: Buffer.from('fake') })

  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
  await expect(page).toHaveURL(/\/create\/confirm/)
  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()

  await expect(page).toHaveURL(/\/create\/guests/)
  await page.locator('#guest-list').fill('Ivan Gorupić\nAna Gorupić\nMarko Horvat\nIvana Horvat\nPetar Marić')
  await page.getByRole('button', { name: /Dodaj 5 gostiju/ }).click()
  await expect(page.getByText('Ivan Gorupić')).toBeVisible()
  await page.getByRole('button', { name: 'Nastavi na stolove' }).click()

  await expect(page).toHaveURL(/\/create\/tables/)
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Dodaj stol' }).click()
  }
  await page.getByRole('button', { name: 'Ivan Gorupić' }).click()
  await page.getByRole('dialog', { name: 'Odaberi stol' }).getByText('Stol 3').click()
  await expect(page.locator('li').filter({ hasText: 'Ivan Gorupić' }).getByText('Stol 3')).toBeVisible()
  await page.getByRole('button', { name: 'Nastavi na objavu' }).click()

  await expect(page).toHaveURL(/\/create\/publish/)
  await page.getByRole('button', { name: 'Objavi stranicu' }).click()

  await expect(page).toHaveURL(/\/create\/share/)
  const linkText = await page.getByText(/marijino-krstenje/).textContent()
  return linkText.trim()
}

test('organizer happy path: create event, assign table, publish, guest finds table', async ({ page }) => {
  await publishMarijinoKrstenje(page)

  await page.goto('/e/marijino-krstenje')
  await expect(page.getByRole('heading', { name: 'Marijino krštenje' })).toBeVisible()

  await page.getByLabel('Upiši svoje ime').fill('Ivan Gorupić')
  await page.getByRole('button', { name: 'Pronađi moj stol' }).click()

  await expect(page.getByText('STOL 3')).toBeVisible()
})
