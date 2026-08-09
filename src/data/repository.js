import { generateId } from '../lib/id.js'
import { normalizeName } from '../lib/normalize.js'
import { slugify } from '../lib/slug.js'

const STORAGE_KEY = 'gdjesjedim:db'
const DEFAULT_TABLE_POSITIONS = [
  { x: 28, y: 22 },
  { x: 72, y: 22 },
  { x: 28, y: 50 },
  { x: 72, y: 50 },
  { x: 28, y: 78 },
  { x: 72, y: 78 }
]

function emptyDb() {
  return { events: [], scheduleItems: [], tables: [], guests: [] }
}

function loadDb(storage) {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return emptyDb()
  try {
    return { ...emptyDb(), ...JSON.parse(raw) }
  } catch {
    return emptyDb()
  }
}

function saveDb(storage, db) {
  storage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function createLocalRepository(storage) {
  const store = storage ?? (() => {
    const mem = new Map()
    return { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v) }
  })()

  function withDb(fn) {
    const db = loadDb(store)
    const result = fn(db)
    saveDb(store, db)
    return result
  }

  function uniqueSlug(db, title) {
    const base = slugify(title)
    let candidate = base
    let n = 2
    while (db.events.some((e) => e.slug === candidate)) {
      candidate = `${base}-${n}`
      n += 1
    }
    return candidate
  }

  return {
    async createEvent({ title, type, date, invitationKey, invitationName, invitationType }) {
      return withDb((db) => {
        const event = {
          id: generateId(),
          slug: uniqueSlug(db, title),
          title,
          type,
          date,
          invitationUrl: undefined,
          invitationKey,
          invitationName,
          invitationType,
          published: false
        }
        db.events.push(event)
        return event
      })
    },

    async getEvent(id) {
      return withDb((db) => db.events.find((e) => e.id === id))
    },

    async getEventBySlug(slug) {
      return withDb((db) => {
        const event = db.events.find((e) => e.slug === slug)
        if (!event || event.published !== true) return undefined
        return event
      })
    },

    async updateEvent(id, patch) {
      return withDb((db) => {
        const event = db.events.find((e) => e.id === id)
        if (!event) throw new Error(`Event not found: ${id}`)
        Object.assign(event, patch)
        return event
      })
    },

    async addScheduleItems(eventId, items) {
      return withDb((db) => {
        const created = items.map((item) => ({ id: generateId(), eventId, ...item }))
        db.scheduleItems.push(...created)
        return created
      })
    },

    async getScheduleItems(eventId) {
      return withDb((db) => db.scheduleItems.filter((s) => s.eventId === eventId))
    },

    async addTables(eventId, tables) {
      return withDb((db) => {
        const existingCount = db.tables.filter((table) => table.eventId === eventId).length
        const created = tables.map((t, index) => ({
          ...(DEFAULT_TABLE_POSITIONS[existingCount + index] ?? { x: 20 + ((existingCount + index) % 4) * 20, y: 50 }),
          id: generateId(),
          eventId,
          name: t.name ?? `Stol ${existingCount + index + 1}`,
          capacity: t.capacity ?? 8,
          shape: t.shape ?? 'round',
          x: t.x ?? DEFAULT_TABLE_POSITIONS[existingCount + index]?.x ?? 20 + ((existingCount + index) % 4) * 20,
          y: t.y ?? DEFAULT_TABLE_POSITIONS[existingCount + index]?.y ?? 50,
          ...t
        }))
        db.tables.push(...created)
        return created
      })
    },

    async getTables(eventId) {
      return withDb((db) => db.tables.filter((t) => t.eventId === eventId))
    },

    async updateTable(id, patch) {
      return withDb((db) => {
        const table = db.tables.find((t) => t.id === id)
        if (!table) throw new Error(`Table not found: ${id}`)
        Object.assign(table, patch)
        return table
      })
    },

    async removeTable(id) {
      return withDb((db) => {
        db.tables = db.tables.filter((t) => t.id !== id)
        db.guests.forEach((guest) => {
          if (guest.tableId === id) guest.tableId = undefined
        })
      })
    },

    async addGuests(eventId, names, tableId) {
      return withDb((db) => {
        if (tableId && !db.tables.some((table) => table.id === tableId && table.eventId === eventId)) {
          throw new Error('Odabrani stol nije valjan.')
        }
        const created = names.map((name) => ({
          id: generateId(),
          eventId,
          name,
          normalizedName: normalizeName(name),
          tableId: tableId ?? undefined
        }))
        db.guests.push(...created)
        return created
      })
    },

    async getGuests(eventId) {
      return withDb((db) => db.guests.filter((g) => g.eventId === eventId))
    },

    async updateGuest(id, patch) {
      return withDb((db) => {
        const guest = db.guests.find((g) => g.id === id)
        if (!guest) throw new Error(`Guest not found: ${id}`)
        Object.assign(guest, patch)
        return guest
      })
    },

    async removeGuest(id) {
      return withDb((db) => {
        db.guests = db.guests.filter((g) => g.id !== id)
      })
    },

    async assignGuestToTable(guestId, tableId) {
      return withDb((db) => {
        const guest = db.guests.find((g) => g.id === guestId)
        if (!guest) throw new Error(`Guest not found: ${guestId}`)
        guest.tableId = tableId ?? undefined
        return guest
      })
    },

    async publishEvent(id) {
      return withDb((db) => {
        const event = db.events.find((e) => e.id === id)
        if (!event) throw new Error(`Event not found: ${id}`)
        event.published = true
        return event
      })
    },

    async searchGuest(slug, query) {
      return withDb((db) => {
        const event = db.events.find((e) => e.slug === slug)
        if (!event || event.published !== true) return null
        const q = normalizeName(query)
        if (!q) return null
        const guest = db.guests.find((g) => g.eventId === event.id && g.normalizedName.includes(q))
        if (!guest) return null
        const table = db.tables.find((t) => t.id === guest.tableId)
        return { guest, table }
      })
    },

    async getPublishedLayout(slug) {
      return withDb((db) => {
        const event = db.events.find((e) => e.slug === slug)
        if (!event || event.published !== true) return null
        const tables = db.tables
          .filter((table) => table.eventId === event.id)
          .map((table) => ({
            id: table.id,
            name: table.name,
            capacity: table.capacity,
            shape: table.shape ?? 'round',
            x: table.x ?? 14,
            y: table.y ?? 18,
            guests: db.guests
              .filter((guest) => guest.eventId === event.id && guest.tableId === table.id)
              .map((guest) => ({ id: guest.id, name: guest.name }))
          }))
        return { event, tables }
      })
    },

    async unlockAdmin(slug, password) {
      if (password !== 'Mari') throw new Error('Šifra nije točna. Pokušaj ponovno.')
      return withDb((db) => {
        const event = db.events.find((candidate) => candidate.slug === slug && candidate.published === true)
        if (!event) throw new Error('Događaj nije pronađen.')
        return event
      })
    }
  }
}
