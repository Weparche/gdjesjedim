import { test, expect } from '@playwright/test'

const INVITE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
)

async function publishMarijinoKrstenje(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Krštenje' }).click()
  await page.getByRole('button', { name: 'Napravi besplatno' }).click()

  await expect(page).toHaveURL(/\/create\/upload/)
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /Učitaj pozivnicu/ }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({ name: 'invite.png', mimeType: 'image/png', buffer: INVITE_PNG })
  await expect(page.getByAltText('invite.png')).toBeVisible()
  await page.reload()
  await expect(page.getByAltText('invite.png')).toBeVisible()

  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
  await expect(page).toHaveURL(/\/create\/confirm/)
  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()

  await expect(page).toHaveURL(/\/create\/tables/)
  await page.getByRole('button', { name: 'Dodaj goste' }).click()
  await page.locator('#guest-list').fill('Ivan Gorupić\nAna Gorupić\nMarko Horvat\nIvana Horvat\nJadranka')
  await page.getByRole('button', { name: /Dodaj 5 gostiju/ }).click()
  await expect(page.getByRole('button', { name: 'Ivan Gorupić', exact: true })).toBeVisible()
  await expect(page.getByText('Pregled dodjele')).toBeVisible()
  await expect(page.locator('ol li').filter({ hasText: 'Ivan Gorupić' })).toHaveCount(1)
  await expect(page.getByText('Ukupno gostiju')).toBeVisible()
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Dodaj stol' }).click()
  }
  await page.getByRole('button', { name: 'Jadranka', exact: true }).click()
  await page.getByRole('dialog', { name: 'Odaberi stol' }).getByText('Stol 1').click()
  await page.getByRole('button', { name: 'Ivan Gorupić', exact: true }).click()
  await page.getByRole('dialog', { name: 'Odaberi stol' }).getByText('Stol 3').click()
  const tableThreeReview = page.getByRole('heading', { name: 'Stol 3', exact: true }).locator('..').locator('..')
  await expect(tableThreeReview.getByText('Ivan Gorupić')).toBeVisible()
  await page.getByRole('button', { name: 'Nastavi na objavu' }).click()

  await expect(page).toHaveURL(/\/create\/publish/)
  await page.getByRole('button', { name: 'Objavi stranicu' }).click()

  await expect(page).toHaveURL(/\/create\/share/)
  const linkText = await page.getByText(/marijino-krstenje/).textContent()
  return linkText.trim()
}

test('organizer happy path: create event, assign table, publish, guest finds table', async ({ page }, testInfo) => {
  const publicLink = await publishMarijinoKrstenje(page)
  const publicPath = publicLink.slice(publicLink.indexOf('/e/'))

  await page.goto(publicPath)
  await expect(page.getByRole('heading', { name: 'Marijino krštenje' })).toBeVisible()
  await expect(page.locator('[data-table-drop-id]')).toHaveCount(3)

  const jadrankaMapCard = page.locator('[aria-label^="Jadranka,"]').locator('span')
  await expect(jadrankaMapCard).toBeVisible()
  expect((await jadrankaMapCard.boundingBox()).height).toBeLessThan(22)

  const tableGuestListToggle = page.getByRole('button', { name: /Popis gostiju po stolovima/ })
  await expect(tableGuestListToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#public-table-guest-list')).toHaveCount(0)
  await tableGuestListToggle.click()
  await expect(tableGuestListToggle).toHaveAttribute('aria-expanded', 'true')
  const publicGuestList = page.locator('#public-table-guest-list')
  await expect(publicGuestList).toBeVisible()
  await expect(publicGuestList.getByRole('heading', { name: 'Stol 1', exact: true })).toBeVisible()
  await expect(publicGuestList.getByText('Jadranka', { exact: true })).toBeVisible()
  expect(await publicGuestList.locator('ol').first().evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(2)
  await tableGuestListToggle.click()
  await expect(tableGuestListToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(publicGuestList).toHaveCount(0)

  const galleryTitle = page.getByRole('heading', { name: 'Galerija' })
  const searchTitle = page.getByRole('heading', { name: 'Gdje sjedim?' })
  await expect(galleryTitle).toBeVisible()
  expect((await galleryTitle.boundingBox()).y).toBeLessThan((await searchTitle.boundingBox()).y)
  await page.getByLabel('Dodaj fotografije iz galerije').setInputFiles({ name: 'trenutak.png', mimeType: 'image/png', buffer: INVITE_PNG })
  await expect(page.getByRole('button', { name: 'Otvori fotografiju 1' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Obriši fotografiju 1' })).toBeVisible()
  await page.getByRole('button', { name: 'Otvori fotografiju 1' }).click()
  await expect(page.getByRole('dialog', { name: 'Pregled fotografije' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Obriši ovu fotografiju' })).toBeVisible()
  await page.getByRole('button', { name: 'Zatvori fotografiju' }).click()
  await page.getByRole('button', { name: 'Obriši fotografiju 1' }).click()
  const deletePhotoDialog = page.getByRole('dialog', { name: 'Obriši fotografiju?' })
  await expect(deletePhotoDialog).toBeVisible()
  await page.waitForTimeout(300)
  await page.screenshot({ path: testInfo.outputPath('photo-delete-confirmation.png') })
  await deletePhotoDialog.getByRole('button', { name: 'Potvrdi brisanje fotografije' }).click()
  await expect(page.getByRole('button', { name: 'Otvori fotografiju 1' })).toHaveCount(0)
  await expect(page.getByText('Prva fotografija čeka vas')).toBeVisible()

  await page.getByLabel('Upiši svoje ime').fill('Ivan Gorupić')
  await page.getByRole('button', { name: 'Pronađi moj stol' }).click()

  await expect(page.getByRole('region', { name: 'Detalji za Stol 3' })).toBeVisible()
  await expect(page.getByLabel('1. Ivan Gorupić, Stol 3')).toBeVisible()
  await expect(page.getByText('STOL 3', { exact: true })).toBeVisible()
})

test('public invitation protects admin mode with the Mari password', async ({ page }) => {
  const publicLink = await publishMarijinoKrstenje(page)
  const publicPath = publicLink.slice(publicLink.indexOf('/e/'))
  await page.goto(publicPath)

  await expect(page.getByRole('button', { name: 'Gost', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Admin' }).click()
  const adminDialog = page.getByRole('dialog', { name: 'Admin pristup' })
  await expect(adminDialog).toBeVisible()

  const password = adminDialog.getByLabel('Administratorska šifra')
  await password.fill('krivo')
  await adminDialog.getByRole('button', { name: 'Otključaj admin' }).click()
  await expect(adminDialog.getByRole('alert')).toHaveText('Šifra nije točna. Pokušaj ponovno.')

  await password.fill('Mari')
  await adminDialog.getByRole('button', { name: 'Otključaj admin' }).click()
  await expect(page).toHaveURL(/\/create\/tables/)
  await expect(page.getByRole('heading', { name: '2. Raspored stolova' })).toBeVisible()

  await page.getByRole('button', { name: 'Dodaj goste' }).click()
  const targetTable = page.getByLabel('Odmah smjesti za stol')
  await expect(targetTable).toHaveValue(/.+/)
  await page.locator('#guest-list').fill('Novi Gost')
  await page.getByRole('button', { name: 'Dodaj 1 gosta' }).click()
  await expect(page.getByRole('region', { name: 'Detalji za Stol 1' })).toBeVisible()
  await expect(page.getByRole('button', { name: /\d+\. Novi Gost, Stol 1/ })).toBeVisible()
  await page.getByRole('button', { name: 'Zatvori detalje stola' }).click()

  await page.locator('[data-table-drop-id]').first().click()
  await page.getByRole('button', { name: 'Uredi stol' }).click()
  const editor = page.getByRole('dialog', { name: 'Uredi stol' })
  await editor.getByLabel('Naziv stola').fill('Glavni stol')
  await editor.getByRole('button', { name: 'Zatvori' }).click()
  await expect(page.locator('[data-table-drop-id]').first()).toHaveAttribute('aria-label', /Glavni stol/)

  await page.goto(publicPath)
  await expect(page.locator('[data-table-drop-id]').first()).toHaveAttribute('aria-label', /Glavni stol/)
  await page.locator('[data-table-drop-id]').first().click()
  await expect(page.getByLabel(/\d+\. Novi Gost, Glavni stol/)).toBeVisible()
})
