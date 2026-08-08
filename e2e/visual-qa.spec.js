import { test } from '@playwright/test'
import fs from 'node:fs'

// Output directory can be overridden via SCREENSHOT_DIR env var so the same spec can be
// re-run at different viewports without overwriting the primary 390x844 captures, e.g.:
//   SCREENSHOT_DIR=screenshots/375 npx playwright test e2e/visual-qa.spec.js --use='{"viewport":{"width":375,"height":812}}'
const outDir = process.env.SCREENSHOT_DIR || 'screenshots'

test.beforeAll(() => {
  fs.mkdirSync(outDir, { recursive: true })
})

test('capture all 8 primary screens', async ({ page }) => {
  await page.goto('/')
  await page.screenshot({ path: `${outDir}/01-landing.png` })

  await page.getByRole('button', { name: 'Krštenje' }).click()
  await page.getByRole('button', { name: 'Napravi besplatno' }).click()
  await page.waitForURL(/\/create\/upload/)
  await page.getByRole('button', { name: /Učitaj pozivnicu/ }).waitFor()
  await page.screenshot({ path: `${outDir}/02-upload.png` })

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /Učitaj pozivnicu/ }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({ name: 'invite.png', mimeType: 'image/png', buffer: Buffer.from('fake') })
  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()

  await page.locator('#guest-list').fill('Ivan Gorupić\nAna Gorupić\nMarko Horvat\nIvana Horvat\nPetar Marić')
  await page.getByRole('button', { name: /Dodaj 5 gostiju/ }).click()
  await page.screenshot({ path: `${outDir}/03-guests.png` })
  await page.getByRole('button', { name: 'Nastavi na stolove' }).click()

  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Dodaj stol' }).click()
  }
  await page.getByRole('button', { name: 'Ivan Gorupić' }).click()
  await page.getByRole('dialog', { name: 'Odaberi stol' }).getByText('Stol 3').click()
  await page.screenshot({ path: `${outDir}/04-tables.png` })
  await page.getByRole('button', { name: 'Nastavi na objavu' }).click()

  await page.waitForURL(/\/create\/publish/)
  await page.getByRole('button', { name: 'Objavi stranicu' }).waitFor()
  await page.screenshot({ path: `${outDir}/05-publish.png` })
  await page.getByRole('button', { name: 'Objavi stranicu' }).click()
  await page.waitForURL(/\/create\/share/)
  const slugLocator = page.getByText(/\/marijino-krstenje/)
  await slugLocator.waitFor()
  await page.screenshot({ path: `${outDir}/06-share.png` })

  const slugText = await slugLocator.textContent()
  const slug = slugText.trim().split('/').pop()

  await page.goto(`/e/${slug}`)
  await page.screenshot({ path: `${outDir}/07-guest-search.png` })
  await page.getByLabel('Upiši svoje ime').fill('Ivan Gorupić')
  await page.getByRole('button', { name: 'Pronađi moj stol' }).click()
  await page.getByText('STOL 3').waitFor()
  await page.waitForTimeout(400) // let the 0.3s framer-motion fade-in settle before capture
  await page.screenshot({ path: `${outDir}/08-guest-result.png` })
})
