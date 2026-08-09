import { test, expect } from '@playwright/test'

const INVITE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
)

async function openTables(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Krštenje' }).click()
  await page.getByRole('button', { name: 'Napravi besplatno' }).click()
  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /Učitaj pozivnicu/ }).click()
  const chooser = await chooserPromise
  await chooser.setFiles({ name: 'layout-test.png', mimeType: 'image/png', buffer: INVITE_PNG })
  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
  await page.getByRole('button', { name: 'Dodaj goste' }).click()
  await page.locator('#guest-list').fill('Ivan Gorupić\nAna Gorupić')
  await page.getByRole('button', { name: /Dodaj 2 gosta/ }).click()
  await page.getByRole('button', { name: 'Dodaj stol' }).click()
  await page.getByRole('button', { name: 'Dodaj stol' }).click()
}

async function seedAssignedGuests(page, count, capacity = count, names = []) {
  await page.evaluate(({ guestCount, tableCapacity, guestNames }) => {
    const draft = JSON.parse(window.localStorage.getItem('gdjesjedim:draft'))
    const db = JSON.parse(window.localStorage.getItem('gdjesjedim:db'))
    const table = db.tables.find((item) => item.eventId === draft.event.id)
    table.capacity = tableCapacity
    db.guests = db.guests.filter((guest) => guest.eventId !== draft.event.id)
    for (let index = 1; index <= guestCount; index += 1) {
      db.guests.push({
        id: `focus-guest-${index}`,
        eventId: draft.event.id,
        name: guestNames[index - 1] ?? `Gost ${index}`,
        normalizedName: (guestNames[index - 1] ?? `Gost ${index}`).toLocaleLowerCase('hr'),
        tableId: table.id
      })
    }
    window.localStorage.setItem('gdjesjedim:db', JSON.stringify(db))
  }, { guestCount: count, tableCapacity: capacity, guestNames: names })
  await page.reload()
}

test('organizer edits a table and assigns a guest on the map', async ({ page }) => {
  await openTables(page)

  const tables = page.locator('[data-table-drop-id]')
  await expect(tables).toHaveCount(2)
  await expect(tables.nth(0)).toHaveCSS('width', '120px')
  await expect(tables.nth(1)).toHaveCSS('width', '120px')
  await tables.nth(0).click()
  await expect(page.getByRole('region', { name: 'Detalji za Stol 1' })).toBeVisible()
  await page.getByRole('button', { name: 'Uredi stol' }).click()

  const dialog = page.getByRole('dialog', { name: 'Uredi stol' })
  await dialog.getByLabel('Broj mjesta').fill('10')
  await dialog.getByRole('button', { name: 'Četvrtasti' }).click()
  await dialog.getByRole('button', { name: 'Zatvori' }).click()

  await page.getByRole('button', { name: 'Ivan Gorupić' }).click()
  await page.getByRole('dialog', { name: 'Odaberi stol' }).getByText('Stol 1').click()

  await expect(page.getByRole('button', { name: '1. Ivan Gorupić, Stol 1' })).toBeVisible()
  await expect(tables.nth(0)).toHaveAttribute('aria-label', /1 od 10 mjesta/)
  await page.getByRole('button', { name: 'Zatvori detalje stola' }).click()
  await expect(page.locator('[data-overview-guest-id]').filter({ hasText: 'Ivan Gorupić' })).toBeVisible()
})

test('mobile map supports zoom controls and drag-to-pan', async ({ page }) => {
  await openTables(page)
  const map = page.getByRole('region', { name: 'Mapa rasporeda stolova' })

  await expect(map).toHaveAttribute('data-zoom', '0.8')
  await page.getByRole('button', { name: 'Povećaj mapu' }).click()
  await expect(map).toHaveAttribute('data-zoom', '1')
  await page.getByRole('button', { name: 'Prikaži cijelu mapu' }).click()
  await expect(map).toHaveAttribute('data-zoom', '0.8')

  await map.hover()
  await page.mouse.wheel(0, -120)
  await expect(map).toHaveAttribute('data-zoom', '0.9')

  const box = await map.boundingBox()
  await page.mouse.move(box.x + box.width - 28, box.y + box.height * 0.52)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - 88, box.y + box.height * 0.62, { steps: 5 })
  await page.mouse.up()

  await expect(map).not.toHaveAttribute('data-pan-x', '0')
  await expect(map).not.toHaveAttribute('data-pan-y', '0')

  const zoomBeforePinch = Number(await map.getAttribute('data-zoom'))
  await map.dispatchEvent('pointerdown', { pointerId: 41, pointerType: 'touch', button: 0, clientX: box.x + 110, clientY: box.y + 210 })
  await map.dispatchEvent('pointerdown', { pointerId: 42, pointerType: 'touch', button: 0, clientX: box.x + 210, clientY: box.y + 210 })
  await map.dispatchEvent('pointermove', { pointerId: 42, pointerType: 'touch', button: 0, clientX: box.x + 270, clientY: box.y + 210 })
  await expect.poll(async () => Number(await map.getAttribute('data-zoom'))).toBeGreaterThan(zoomBeforePinch)
  await map.dispatchEvent('pointerup', { pointerId: 41, pointerType: 'touch', button: 0, clientX: box.x + 110, clientY: box.y + 210 })
  await map.dispatchEvent('pointerup', { pointerId: 42, pointerType: 'touch', button: 0, clientX: box.x + 270, clientY: box.y + 210 })
})

test('table can be dragged close to the map edge after the page is scrolled', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await openTables(page)

  const map = page.getByRole('region', { name: 'Mapa rasporeda stolova' })
  const firstTable = page.locator('[data-table-drop-id]').first()
  const position = firstTable.locator('..')
  await map.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy({ top: 80, behavior: 'instant' }))
  const mapBox = await map.boundingBox()
  const tableBox = await firstTable.boundingBox()

  await page.mouse.move(tableBox.x + tableBox.width / 2, tableBox.y + tableBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(mapBox.x + 2, mapBox.y + 2, { steps: 8 })
  await page.mouse.up()

  await expect.poll(async () => Number(await position.getAttribute('data-table-position-x'))).toBeLessThanOrEqual(7)
  await expect.poll(async () => Number(await position.getAttribute('data-table-position-y'))).toBeLessThanOrEqual(7)
})

test('nine guests are distributed evenly in one circle around their table', async ({ page }, testInfo) => {
  await openTables(page)
  await seedAssignedGuests(page, 9, 9, [
    'Ivan Gorupić',
    'Ana Gorupić',
    'Marko Horvat',
    'Ivana Horvat',
    'Petar Marić',
    'Lucija Kovač',
    'Tomislav Babić',
    'Ema Novak',
    'Josip Radić'
  ])

  const guestCards = page.locator('[data-overview-guest-id]')
  await expect(guestCards).toHaveCount(9)
  const offsets = await guestCards.evaluateAll((nodes) => nodes.map((node) => ({
    x: Number(node.dataset.seatX),
    y: Number(node.dataset.seatY)
  })))
  const radii = offsets.map(({ x, y }) => Math.hypot(x, y))
  expect(Math.max(...radii) - Math.min(...radii)).toBeLessThan(2)
  expect(Math.max(...radii)).toBeLessThanOrEqual(94)
  expect(Math.min(...radii)).toBeGreaterThanOrEqual(90)
  expect(new Set(offsets.map(({ x, y }) => `${x}:${y}`)).size).toBe(9)
  expect(offsets.some(({ x, y }) => Math.abs(x) < 2 && y < 0)).toBe(false)

  const visualBoxes = await guestCards.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.firstElementChild.getBoundingClientRect()
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
  }))
  for (let first = 0; first < visualBoxes.length; first += 1) {
    for (let second = first + 1; second < visualBoxes.length; second += 1) {
      const overlaps = visualBoxes[first].left < visualBoxes[second].right
        && visualBoxes[first].right > visualBoxes[second].left
        && visualBoxes[first].top < visualBoxes[second].bottom
        && visualBoxes[first].bottom > visualBoxes[second].top
      expect(overlaps, `guest cards ${first + 1} and ${second + 1} overlap: ${JSON.stringify({ first: visualBoxes[first], second: visualBoxes[second] })}`).toBe(false)
    }
  }
  await page.screenshot({ path: testInfo.outputPath('nine-guests.png') })
})

test('six compact tables fit the narrow mobile map without overlap', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await openTables(page)
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: 'Dodaj stol' }).click()
  }

  const tables = page.locator('[data-table-drop-id]')
  await expect(tables).toHaveCount(6)
  const boxes = await tables.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect()
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
  }))

  for (let first = 0; first < boxes.length; first += 1) {
    for (let second = first + 1; second < boxes.length; second += 1) {
      const overlaps = boxes[first].left < boxes[second].right
        && boxes[first].right > boxes[second].left
        && boxes[first].top < boxes[second].bottom
        && boxes[first].bottom > boxes[second].top
      expect(overlaps).toBe(false)
    }
  }

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
})

test('focused table switches to a scrollable two-column roster above ten guests', async ({ page }) => {
  await openTables(page)
  await seedAssignedGuests(page, 11, 12)

  await page.locator('[data-table-drop-id]').first().click()
  const focus = page.getByRole('region', { name: 'Detalji za Stol 1' })
  await expect(focus.locator('ol li')).toHaveCount(11)
  await expect(page.getByRole('button', { name: '11. Gost 11, Stol 1' })).toBeVisible()
  await expect(focus.getByText('11/12 mjesta').first()).toBeVisible()
})
