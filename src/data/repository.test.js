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

test('getEventBySlug finds the created event', async () => {
  const repo = freshRepo()
  const created = await repo.createEvent({ title: 'Vjenčanje', type: 'wedding', date: '2026-05-05' })
  const found = await repo.getEventBySlug('vjencanje')
  assert.equal(found.id, created.id)
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

test('searchGuest tolerates case, diacritics, and partial name', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  const [guest] = await repo.addGuests(event.id, ['Ivan Gorupić'])
  const [table] = await repo.addTables(event.id, [{ name: 'Stol 3', capacity: 10 }])
  await repo.assignGuestToTable(guest.id, table.id)

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
  const result = await repo.searchGuest(event.slug, 'Nepostojeći Gost')
  assert.equal(result, null)
})

test('publishEvent sets published true', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  const published = await repo.publishEvent(event.id)
  assert.equal(published.published, true)
})
