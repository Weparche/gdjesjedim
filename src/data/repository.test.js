import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createLocalRepository } from './repository.js'

function freshRepo() {
  const store = new Map()
  return createLocalRepository({
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, v)
  })
}

test('createEvent assigns id, unique slug, and published=false', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Marijino krštenje', type: 'christening', date: '2026-09-26' })
  assert.ok(event.id)
  assert.equal(event.slug, 'marijino-krstenje')
  assert.equal(event.published, false)
})

test('createEvent de-duplicates slugs', async () => {
  const repo = freshRepo()
  const first = await repo.createEvent({ title: 'Rođendan', type: 'birthday', date: '2026-01-01' })
  const second = await repo.createEvent({ title: 'Rođendan', type: 'birthday', date: '2026-02-02' })
  assert.equal(first.slug, 'rodendan')
  assert.equal(second.slug, 'rodendan-2')
})

test('getEventBySlug finds the created event once published', async () => {
  const repo = freshRepo()
  const created = await repo.createEvent({ title: 'Vjenčanje', type: 'wedding', date: '2026-05-05' })
  await repo.publishEvent(created.id)
  const found = await repo.getEventBySlug('vjencanje')
  assert.equal(found.id, created.id)
})

test('getEventBySlug returns undefined for an unpublished event', async () => {
  const repo = freshRepo()
  await repo.createEvent({ title: 'Vjenčanje', type: 'wedding', date: '2026-05-05' })
  const found = await repo.getEventBySlug('vjencanje')
  assert.equal(found, undefined)
})

test('addGuests computes normalizedName and assignGuestToTable links a table', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  const [guest] = await repo.addGuests(event.id, ['Ivan Gorupić'])
  assert.equal(guest.normalizedName, 'ivan gorupic')
  const [table] = await repo.addTables(event.id, [{ name: 'Stol 3', capacity: 10 }])
  const updated = await repo.assignGuestToTable(guest.id, table.id)
  assert.equal(updated.tableId, table.id)
})

test('addGuests can place new guests directly at a selected table', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  const [table] = await repo.addTables(event.id, [{ name: 'Obiteljski stol', capacity: 8 }])

  const [guest] = await repo.addGuests(event.id, ['Novi Gost'], table.id)
  const storedGuests = await repo.getGuests(event.id)

  assert.equal(guest.tableId, table.id)
  assert.equal(storedGuests[0].tableId, table.id)
})

test('tables retain shape, capacity, and editable position', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'VjenÄanje', type: 'wedding', date: '2026-05-05' })
  const [table] = await repo.addTables(event.id, [{ name: 'Mladenci', capacity: 12, shape: 'square', x: 42, y: 58 }])
  assert.equal(table.shape, 'square')
  assert.equal(table.capacity, 12)
  assert.equal(table.x, 42)
  assert.equal(table.y, 58)

  const updated = await repo.updateTable(table.id, { capacity: 10, shape: 'round', x: 55, y: 30 })
  assert.deepEqual(
    { capacity: updated.capacity, shape: updated.shape, x: updated.x, y: updated.y },
    { capacity: 10, shape: 'round', x: 55, y: 30 }
  )
})

test('published layout groups public guest names by table', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'KrÅ¡tenje', type: 'christening', date: '2026-09-26' })
  const [guest] = await repo.addGuests(event.id, ['Ivan GorupiÄ‡'])
  const [table] = await repo.addTables(event.id, [{ name: 'Stol 2', capacity: 8, shape: 'square', x: 24, y: 36 }])
  await repo.assignGuestToTable(guest.id, table.id)
  const beforePublish = await repo.getPublishedLayout(event.slug)
  assert.equal(beforePublish, null)
  await repo.publishEvent(event.id)

  const layout = await repo.getPublishedLayout(event.slug)
  assert.equal(layout.event.title, 'KrÅ¡tenje')
  assert.deepEqual(layout.tables[0], {
    id: table.id,
    name: 'Stol 2',
    capacity: 8,
    shape: 'square',
    x: 24,
    y: 36,
    guests: [{ id: guest.id, name: 'Ivan GorupiÄ‡' }]
  })
})

test('removeGuest deletes the guest', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  const [guest] = await repo.addGuests(event.id, ['Ivan Gorupić'])
  await repo.removeGuest(guest.id)
  const remaining = await repo.getGuests(event.id)
  assert.equal(remaining.length, 0)
})

test('searchGuest tolerates case, diacritics, and partial name', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  const [guest] = await repo.addGuests(event.id, ['Ivan Gorupić'])
  const [table] = await repo.addTables(event.id, [{ name: 'Stol 3', capacity: 10 }])
  await repo.assignGuestToTable(guest.id, table.id)
  await repo.publishEvent(event.id)

  for (const query of ['ivan gorupić', 'IVAN GORUPIĆ', 'Ivan']) {
    const result = await repo.searchGuest(event.slug, query)
    assert.equal(result.guest.id, guest.id)
    assert.equal(result.table.name, 'Stol 3')
  }
})

test('searchGuest returns null when nobody matches', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  await repo.addGuests(event.id, ['Ivan Gorupić'])
  await repo.publishEvent(event.id)
  const result = await repo.searchGuest(event.slug, 'Nepostojeći Gost')
  assert.equal(result, null)
})

test('searchGuest returns null for an unpublished event even when a guest matches', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  await repo.addGuests(event.id, ['Ivan Gorupić'])
  const result = await repo.searchGuest(event.slug, 'Ivan')
  assert.equal(result, null)
})

test('publishEvent sets published true', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  const published = await repo.publishEvent(event.id)
  assert.equal(published.published, true)
})
