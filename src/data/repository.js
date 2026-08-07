import { generateId } from '../lib/id.js'
import { normalizeName } from '../lib/normalize.js'
import { slugify } from '../lib/slug.js'

const STORAGE_KEY = 'gdjesjedim:db'

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
    async createEvent({ title, type, date }) {
      return withDb((db) => {
        const event = {
          id: generateId(),
          slug: uniqueSlug(db, title),
          title,
          type,
          date,
          invitationUrl: undefined,
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
      return withDb((db) => db.events.find((e) => e.slug === slug))
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
        const created = tables.map((t) => ({ id: generateId(), eventId, ...t }))
        db.tables.push(...created)
        return created
      })
    },

    async getTables(eventId) {
      return withDb((db) => db.tables.filter((t) => t.eventId === eventId))
    },

    async addGuests(eventId, names) {
      return withDb((db) => {
        const created = names.map((name) => ({
          id: generateId(),
          eventId,
          name,
          normalizedName: normalizeName(name),
          tableId: undefined
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
        if (!event) return null
        const q = normalizeName(query)
        if (!q) return null
        const guest = db.guests.find((g) => g.eventId === event.id && g.normalizedName.includes(q))
        if (!guest) return null
        const table = db.tables.find((t) => t.id === guest.tableId)
        return { guest, table }
      })
    }
  }
}
