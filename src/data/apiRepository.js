const TOKEN_KEY = 'gdjesjedim:admin-tokens'
const ACTIVE_TOKEN_KEY = 'gdjesjedim:active-admin-token'

function readTokens(storage) {
  try {
    return JSON.parse(storage?.getItem(TOKEN_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeToken(storage, eventId, token) {
  if (!storage || !eventId || !token) return
  const tokens = readTokens(storage)
  tokens[eventId] = token
  storage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  storage.setItem(ACTIVE_TOKEN_KEY, token)
}

export function createApiRepository(storage = window.localStorage) {
  function tokenFor(eventId) {
    return readTokens(storage)[eventId]
  }

  function activateToken(eventId) {
    const token = tokenFor(eventId)
    if (token) storage?.setItem(ACTIVE_TOKEN_KEY, token)
  }

  async function request(path, options = {}, eventId) {
    const headers = new Headers(options.headers)
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    const token = eventId ? tokenFor(eventId) : null
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const response = await fetch(path, { ...options, headers })
    if (response.status === 204) return undefined
    const payload = await response.json().catch(() => null)
    if (!response.ok) throw new Error(payload?.error ?? 'Zahtjev nije uspio.')
    return payload
  }

  return {
    async createEvent(input) {
      const result = await request('/api/events', { method: 'POST', body: JSON.stringify(input) })
      writeToken(storage, result.event.id, result.adminToken)
      return result.event
    },
    getEvent: (id) => request(`/api/events/${encodeURIComponent(id)}`, {}, id),
    async getEventBySlug(slug) {
      const layout = await request(`/api/public/${encodeURIComponent(slug)}/layout`).catch(() => null)
      return layout?.event
    },
    updateEvent: (id, patch) => request(`/api/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }, id),
    addScheduleItems(eventId, items) {
      activateToken(eventId)
      return request(`/api/events/${encodeURIComponent(eventId)}/schedule`, { method: 'POST', body: JSON.stringify({ items }) }, eventId)
    },
    getScheduleItems(eventId) {
      activateToken(eventId)
      return request(`/api/events/${encodeURIComponent(eventId)}/schedule`, {}, eventId)
    },
    addTables(eventId, tables) {
      activateToken(eventId)
      return request(`/api/events/${encodeURIComponent(eventId)}/tables`, { method: 'POST', body: JSON.stringify({ tables }) }, eventId)
    },
    getTables(eventId) {
      activateToken(eventId)
      return request(`/api/events/${encodeURIComponent(eventId)}/tables`, {}, eventId)
    },
    async updateTable(id, patch) {
      const table = await request(`/api/tables/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { Authorization: `Bearer ${findAnyToken()}` } })
      return table
    },
    removeTable: (id) => request(`/api/tables/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${findAnyToken()}` } }),
    addGuests(eventId, names) {
      activateToken(eventId)
      return request(`/api/events/${encodeURIComponent(eventId)}/guests`, { method: 'POST', body: JSON.stringify({ names }) }, eventId)
    },
    getGuests(eventId) {
      activateToken(eventId)
      return request(`/api/events/${encodeURIComponent(eventId)}/guests`, {}, eventId)
    },
    updateGuest: (id, patch) => request(`/api/guests/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { Authorization: `Bearer ${findAnyToken()}` } }),
    removeGuest: (id) => request(`/api/guests/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${findAnyToken()}` } }),
    assignGuestToTable: (guestId, tableId) => request(`/api/guests/${encodeURIComponent(guestId)}/assign`, { method: 'POST', body: JSON.stringify({ tableId }), headers: { Authorization: `Bearer ${findAnyToken()}` } }),
    publishEvent: (id) => request(`/api/events/${encodeURIComponent(id)}/publish`, { method: 'POST' }, id),
    searchGuest: (slug, query) => request(`/api/public/${encodeURIComponent(slug)}/search?q=${encodeURIComponent(query)}`),
    getPublishedLayout: (slug) => request(`/api/public/${encodeURIComponent(slug)}/layout`).catch((caught) => {
      if (/nije pronađen/i.test(caught.message)) return null
      throw caught
    }),
    async unlockAdmin(slug, password) {
      const result = await request(`/api/public/${encodeURIComponent(slug)}/admin-unlock`, { method: 'POST', body: JSON.stringify({ password }) })
      writeToken(storage, result.event.id, result.adminToken)
      return result.event
    }
  }

  function findAnyToken() {
    return storage?.getItem(ACTIVE_TOKEN_KEY) ?? Object.values(readTokens(storage))[0] ?? ''
  }
}
