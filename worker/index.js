const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const CORS_METHODS = 'GET, HEAD, POST, PATCH, DELETE, OPTIONS'
const CORS_HEADERS = 'Authorization, Content-Type, X-File-Name'
const DEFAULT_TABLE_POSITIONS = [
  { x: 28, y: 22 },
  { x: 72, y: 22 },
  { x: 28, y: 50 },
  { x: 72, y: 50 },
  { x: 28, y: 78 },
  { x: 72, y: 78 }
]

function allowedCorsOrigin(request) {
  const origin = request.headers.get('Origin')
  if (!origin) return null
  try {
    const { hostname, protocol } = new URL(origin)
    const isPagesApp = protocol === 'https:' && (
      hostname === 'gdjesjedim.pages.dev' || hostname.endsWith('.gdjesjedim.pages.dev')
    )
    const isLocal = protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')
    return isPagesApp || isLocal ? origin : null
  } catch {
    return null
  }
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': CORS_METHODS,
    'Access-Control-Allow-Headers': CORS_HEADERS,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  }
}

function withCors(response, origin) {
  if (!origin) return response
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(corsHeaders(origin))) headers.set(name, value)
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers }
  })
}

function error(message, status = 400) {
  return json({ error: message }, status)
}

function normalizeName(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('hr').trim().replace(/\s+/g, ' ')
}

function slugify(value = '') {
  return normalizeName(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'dogadaj'
}

function eventFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    date: row.date,
    invitationName: row.invitation_name ?? undefined,
    invitationType: row.invitation_type ?? undefined,
    published: Boolean(row.published)
  }
}

function tableFromRow(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    capacity: row.capacity,
    shape: row.shape,
    x: row.x,
    y: row.y
  }
}

function guestFromRow(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    normalizedName: row.normalized_name,
    tableId: row.table_id ?? undefined
  }
}

function scheduleFromRow(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    time: row.time,
    locationName: row.location_name ?? undefined,
    address: row.address ?? undefined
  }
}

async function boundedJson(request) {
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > 128 * 1024) throw new Error('Zahtjev je prevelik.')
  return request.json()
}

async function safeEqual(provided, expected) {
  const encoder = new TextEncoder()
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(provided ?? '')),
    crypto.subtle.digest('SHA-256', encoder.encode(expected ?? ''))
  ])
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash)
}

function bearerToken(request) {
  const authorization = request.headers.get('authorization') ?? ''
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
}

async function eventRowById(env, id) {
  return env.DB.prepare('SELECT * FROM events WHERE id = ?1').bind(id).first()
}

async function eventRowBySlug(env, slug) {
  return env.DB.prepare('SELECT * FROM events WHERE slug = ?1').bind(slug).first()
}

async function requireEventAdmin(request, env, eventId) {
  const row = await env.DB.prepare('SELECT admin_token FROM events WHERE id = ?1').bind(eventId).first()
  if (!row) return false
  return safeEqual(bearerToken(request), row.admin_token)
}

async function requireTableAdmin(request, env, resourceId) {
  const row = await env.DB.prepare(
    'SELECT events.admin_token FROM tables JOIN events ON events.id = tables.event_id WHERE tables.id = ?1'
  ).bind(resourceId).first()
  if (!row) return false
  return safeEqual(bearerToken(request), row.admin_token)
}

async function requireGuestAdmin(request, env, resourceId) {
  const row = await env.DB.prepare(
    'SELECT events.admin_token FROM guests JOIN events ON events.id = guests.event_id WHERE guests.id = ?1'
  ).bind(resourceId).first()
  if (!row) return false
  return safeEqual(bearerToken(request), row.admin_token)
}

async function uniqueSlug(env, title) {
  const base = slugify(title)
  let candidate = base
  let suffix = 2
  while (await env.DB.prepare('SELECT 1 FROM events WHERE slug = ?1').bind(candidate).first()) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  return candidate
}

async function handleEvents(request, env, url) {
  if (request.method === 'POST' && url.pathname === '/api/events') {
    const body = await boundedJson(request)
    if (!body.title || !body.type || !body.date) return error('Nedostaju podaci događaja.')
    const id = crypto.randomUUID()
    const adminToken = crypto.randomUUID()
    const slug = await uniqueSlug(env, body.title)
    await env.DB.prepare(
      `INSERT INTO events (id, slug, title, type, date, invitation_name, invitation_type, admin_token)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
    ).bind(id, slug, body.title, body.type, body.date, body.invitationName ?? null, body.invitationType ?? null, adminToken).run()
    return json({ event: { id, slug, title: body.title, type: body.type, date: body.date, invitationName: body.invitationName, invitationType: body.invitationType, published: false }, adminToken }, 201)
  }

  const eventMatch = url.pathname.match(/^\/api\/events\/([^/]+)$/)
  if (eventMatch) {
    const eventId = decodeURIComponent(eventMatch[1])
    const row = await eventRowById(env, eventId)
    if (!row) return error('Događaj nije pronađen.', 404)
    if (request.method === 'GET') {
      if (!row.published && !(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
      return json(eventFromRow(row))
    }
    if (request.method === 'PATCH') {
      if (!(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
      const body = await boundedJson(request)
      const next = { ...row, ...body }
      await env.DB.prepare(
        'UPDATE events SET title = ?1, type = ?2, date = ?3, invitation_name = ?4, invitation_type = ?5 WHERE id = ?6'
      ).bind(next.title, next.type, next.date, next.invitationName ?? next.invitation_name ?? null, next.invitationType ?? next.invitation_type ?? null, eventId).run()
      return json(eventFromRow(await eventRowById(env, eventId)))
    }
  }

  const publishMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/publish$/)
  if (publishMatch && request.method === 'POST') {
    const eventId = decodeURIComponent(publishMatch[1])
    if (!(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
    await env.DB.prepare('UPDATE events SET published = 1 WHERE id = ?1').bind(eventId).run()
    return json(eventFromRow(await eventRowById(env, eventId)))
  }

  const scheduleMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/schedule$/)
  if (scheduleMatch) {
    const eventId = decodeURIComponent(scheduleMatch[1])
    const row = await eventRowById(env, eventId)
    if (!row) return error('Događaj nije pronađen.', 404)
    if (request.method === 'GET') {
      if (!row.published && !(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
      const rows = await env.DB.prepare('SELECT * FROM schedule_items WHERE event_id = ?1 ORDER BY position, time').bind(eventId).all()
      return json(rows.results.map(scheduleFromRow))
    }
    if (request.method === 'POST') {
      if (!(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
      const body = await boundedJson(request)
      const items = Array.isArray(body.items) ? body.items : []
      const created = items.map((item, index) => ({
        id: crypto.randomUUID(), eventId, title: item.title, time: item.time,
        locationName: item.locationName ?? null, address: item.address ?? null, position: index
      }))
      if (created.length) {
        await env.DB.batch(created.map((item) => env.DB.prepare(
          'INSERT INTO schedule_items (id, event_id, title, time, location_name, address, position) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)'
        ).bind(item.id, item.eventId, item.title, item.time, item.locationName, item.address, item.position)))
      }
      return json(created.map(({ position, ...item }) => item), 201)
    }
  }

  return null
}

async function handleTables(request, env, url) {
  const collectionMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/tables$/)
  if (collectionMatch) {
    const eventId = decodeURIComponent(collectionMatch[1])
    const event = await eventRowById(env, eventId)
    if (!event) return error('Događaj nije pronađen.', 404)
    if (request.method === 'GET') {
      if (!event.published && !(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
      const rows = await env.DB.prepare('SELECT * FROM tables WHERE event_id = ?1 ORDER BY rowid').bind(eventId).all()
      return json(rows.results.map(tableFromRow))
    }
    if (request.method === 'POST') {
      if (!(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
      const body = await boundedJson(request)
      const input = Array.isArray(body.tables) ? body.tables : []
      const countRow = await env.DB.prepare('SELECT COUNT(*) AS count FROM tables WHERE event_id = ?1').bind(eventId).first()
      const existingCount = Number(countRow?.count ?? 0)
      const created = input.map((table, index) => {
        const offset = existingCount + index
        const position = DEFAULT_TABLE_POSITIONS[offset] ?? { x: 20 + (offset % 4) * 20, y: 50 }
        return {
          id: crypto.randomUUID(), eventId,
          name: table.name ?? `Stol ${offset + 1}`,
          capacity: Number(table.capacity ?? 8),
          shape: table.shape === 'square' ? 'square' : 'round',
          x: Number(table.x ?? position.x), y: Number(table.y ?? position.y)
        }
      })
      if (created.length) {
        await env.DB.batch(created.map((table) => env.DB.prepare(
          'INSERT INTO tables (id, event_id, name, capacity, shape, x, y) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)'
        ).bind(table.id, table.eventId, table.name, table.capacity, table.shape, table.x, table.y)))
      }
      return json(created, 201)
    }
  }

  const itemMatch = url.pathname.match(/^\/api\/tables\/([^/]+)$/)
  if (itemMatch) {
    const id = decodeURIComponent(itemMatch[1])
    if (!(await requireTableAdmin(request, env, id))) return error('Nedopušten pristup.', 401)
    const row = await env.DB.prepare('SELECT * FROM tables WHERE id = ?1').bind(id).first()
    if (!row) return error('Stol nije pronađen.', 404)
    if (request.method === 'PATCH') {
      const body = await boundedJson(request)
      const next = {
        name: body.name ?? row.name,
        capacity: Number(body.capacity ?? row.capacity),
        shape: body.shape === 'square' ? 'square' : body.shape === 'round' ? 'round' : row.shape,
        x: Number(body.x ?? row.x), y: Number(body.y ?? row.y)
      }
      await env.DB.prepare('UPDATE tables SET name = ?1, capacity = ?2, shape = ?3, x = ?4, y = ?5 WHERE id = ?6')
        .bind(next.name, next.capacity, next.shape, next.x, next.y, id).run()
      return json(tableFromRow(await env.DB.prepare('SELECT * FROM tables WHERE id = ?1').bind(id).first()))
    }
    if (request.method === 'DELETE') {
      await env.DB.batch([
        env.DB.prepare('UPDATE guests SET table_id = NULL WHERE table_id = ?1').bind(id),
        env.DB.prepare('DELETE FROM tables WHERE id = ?1').bind(id)
      ])
      return new Response(null, { status: 204 })
    }
  }
  return null
}

async function handleGuests(request, env, url) {
  const collectionMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/guests$/)
  if (collectionMatch) {
    const eventId = decodeURIComponent(collectionMatch[1])
    const event = await eventRowById(env, eventId)
    if (!event) return error('Događaj nije pronađen.', 404)
    if (request.method === 'GET') {
      if (!event.published && !(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
      const rows = await env.DB.prepare('SELECT * FROM guests WHERE event_id = ?1 ORDER BY rowid').bind(eventId).all()
      return json(rows.results.map(guestFromRow))
    }
    if (request.method === 'POST') {
      if (!(await requireEventAdmin(request, env, eventId))) return error('Nedopušten pristup.', 401)
      const body = await boundedJson(request)
      const names = Array.isArray(body.names) ? body.names.filter((name) => typeof name === 'string' && name.trim()) : []
      const tableRows = body.tableId
        ? (await env.DB.prepare(
          `SELECT tables.id, tables.capacity, COUNT(guests.id) AS occupied
           FROM tables LEFT JOIN guests ON guests.table_id = tables.id
           WHERE tables.event_id = ?1 GROUP BY tables.id ORDER BY tables.rowid`
        ).bind(eventId).all()).results
        : []
      const preferredIndex = tableRows.findIndex((table) => table.id === body.tableId)
      if (body.tableId && preferredIndex < 0) return error('Odabrani stol nije valjan.', 400)
      const orderedTables = preferredIndex < 0
        ? []
        : [...tableRows.slice(preferredIndex), ...tableRows.slice(0, preferredIndex)]
      const occupied = new Map(tableRows.map((table) => [table.id, Number(table.occupied ?? 0)]))
      const created = names.map((name) => {
        const target = orderedTables.find((table) => (occupied.get(table.id) ?? 0) < Number(table.capacity ?? 0))
        if (target) occupied.set(target.id, (occupied.get(target.id) ?? 0) + 1)
        return {
          id: crypto.randomUUID(), eventId, name: name.trim(), normalizedName: normalizeName(name), tableId: target?.id
        }
      })
      if (created.length) {
        await env.DB.batch(created.map((guest) => env.DB.prepare(
          'INSERT INTO guests (id, event_id, name, normalized_name, table_id) VALUES (?1, ?2, ?3, ?4, ?5)'
        ).bind(guest.id, guest.eventId, guest.name, guest.normalizedName, guest.tableId ?? null)))
      }
      return json(created, 201)
    }
  }

  const swapMatch = url.pathname.match(/^\/api\/guests\/([^/]+)\/swap$/)
  if (swapMatch && request.method === 'POST') {
    const id = decodeURIComponent(swapMatch[1])
    if (!(await requireGuestAdmin(request, env, id))) return error('Nedopušten pristup.', 401)
    const body = await boundedJson(request)
    const [guest, otherGuest] = await Promise.all([
      env.DB.prepare('SELECT * FROM guests WHERE id = ?1').bind(id).first(),
      env.DB.prepare('SELECT * FROM guests WHERE id = ?1').bind(body.otherGuestId ?? '').first()
    ])
    if (!guest || !otherGuest || guest.id === otherGuest.id || guest.event_id !== otherGuest.event_id) {
      return error('Gosti za zamjenu nisu valjani.', 400)
    }
    await env.DB.batch([
      env.DB.prepare('UPDATE guests SET table_id = ?1 WHERE id = ?2').bind(otherGuest.table_id ?? null, guest.id),
      env.DB.prepare('UPDATE guests SET table_id = ?1 WHERE id = ?2').bind(guest.table_id ?? null, otherGuest.id)
    ])
    const [updatedGuest, updatedOtherGuest] = await Promise.all([
      env.DB.prepare('SELECT * FROM guests WHERE id = ?1').bind(guest.id).first(),
      env.DB.prepare('SELECT * FROM guests WHERE id = ?1').bind(otherGuest.id).first()
    ])
    return json({ guest: guestFromRow(updatedGuest), otherGuest: guestFromRow(updatedOtherGuest) })
  }

  const assignMatch = url.pathname.match(/^\/api\/guests\/([^/]+)\/assign$/)
  if (assignMatch && request.method === 'POST') {
    const id = decodeURIComponent(assignMatch[1])
    if (!(await requireGuestAdmin(request, env, id))) return error('Nedopušten pristup.', 401)
    const guest = await env.DB.prepare('SELECT * FROM guests WHERE id = ?1').bind(id).first()
    if (!guest) return error('Gost nije pronađen.', 404)
    const body = await boundedJson(request)
    if (body.tableId) {
      const table = await env.DB.prepare(
        'SELECT tables.event_id, tables.capacity, COUNT(guests.id) AS occupied FROM tables LEFT JOIN guests ON guests.table_id = tables.id WHERE tables.id = ?1 GROUP BY tables.id'
      ).bind(body.tableId).first()
      if (!table || table.event_id !== guest.event_id) return error('Stol nije valjan.', 400)
      if (guest.table_id !== body.tableId && Number(table.occupied ?? 0) >= Number(table.capacity ?? 0)) {
        return error('Stol je pun. Odaberi gosta za zamjenu.', 409)
      }
    }
    await env.DB.prepare('UPDATE guests SET table_id = ?1 WHERE id = ?2').bind(body.tableId ?? null, id).run()
    return json(guestFromRow(await env.DB.prepare('SELECT * FROM guests WHERE id = ?1').bind(id).first()))
  }

  const itemMatch = url.pathname.match(/^\/api\/guests\/([^/]+)$/)
  if (itemMatch) {
    const id = decodeURIComponent(itemMatch[1])
    if (!(await requireGuestAdmin(request, env, id))) return error('Nedopušten pristup.', 401)
    const row = await env.DB.prepare('SELECT * FROM guests WHERE id = ?1').bind(id).first()
    if (!row) return error('Gost nije pronađen.', 404)
    if (request.method === 'PATCH') {
      const body = await boundedJson(request)
      const name = typeof body.name === 'string' ? body.name.trim() : row.name
      const tableId = Object.hasOwn(body, 'tableId') ? body.tableId : row.table_id
      await env.DB.prepare('UPDATE guests SET name = ?1, normalized_name = ?2, table_id = ?3 WHERE id = ?4')
        .bind(name, normalizeName(name), tableId ?? null, id).run()
      return json(guestFromRow(await env.DB.prepare('SELECT * FROM guests WHERE id = ?1').bind(id).first()))
    }
    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM guests WHERE id = ?1').bind(id).run()
      return new Response(null, { status: 204 })
    }
  }
  return null
}

async function getPublishedLayout(env, slug) {
  const eventRow = await eventRowBySlug(env, slug)
  if (!eventRow?.published) return null
  const [tableRows, guestRows] = await Promise.all([
    env.DB.prepare('SELECT * FROM tables WHERE event_id = ?1 ORDER BY rowid').bind(eventRow.id).all(),
    env.DB.prepare('SELECT id, name, table_id FROM guests WHERE event_id = ?1 ORDER BY rowid').bind(eventRow.id).all()
  ])
  const tables = tableRows.results.map((row) => ({
    ...tableFromRow(row),
    guests: guestRows.results.filter((guest) => guest.table_id === row.id).map((guest) => ({ id: guest.id, name: guest.name }))
  }))
  return { event: eventFromRow(eventRow), tables }
}

function photoFromRow(row) {
  return {
    id: row.id,
    originalName: row.original_name ?? undefined,
    width: row.width,
    height: row.height,
    byteSize: row.byte_size,
    createdAt: row.created_at,
    url: `/media/${row.id}`,
    thumbnailUrl: `/media/${row.id}/thumbnail`
  }
}

async function handlePublic(request, env, url) {
  const layoutMatch = url.pathname.match(/^\/api\/public\/([^/]+)\/layout$/)
  if (layoutMatch && request.method === 'GET') {
    const layout = await getPublishedLayout(env, decodeURIComponent(layoutMatch[1]))
    return layout ? json(layout) : error('Događaj nije pronađen.', 404)
  }

  const searchMatch = url.pathname.match(/^\/api\/public\/([^/]+)\/search$/)
  if (searchMatch && request.method === 'GET') {
    const event = await eventRowBySlug(env, decodeURIComponent(searchMatch[1]))
    if (!event?.published) return json(null)
    const query = normalizeName(url.searchParams.get('q') ?? '')
    if (!query) return json(null)
    const guest = await env.DB.prepare('SELECT * FROM guests WHERE event_id = ?1 AND normalized_name LIKE ?2 ORDER BY rowid LIMIT 1')
      .bind(event.id, `%${query}%`).first()
    if (!guest) return json(null)
    const table = guest.table_id ? await env.DB.prepare('SELECT * FROM tables WHERE id = ?1').bind(guest.table_id).first() : null
    return json({ guest: guestFromRow(guest), table: table ? tableFromRow(table) : undefined })
  }

  const unlockMatch = url.pathname.match(/^\/api\/public\/([^/]+)\/admin-unlock$/)
  if (unlockMatch && request.method === 'POST') {
    const body = await boundedJson(request)
    if (!(await safeEqual(body.password, env.ADMIN_PASSWORD))) return error('Šifra nije točna. Pokušaj ponovno.', 401)
    const event = await eventRowBySlug(env, decodeURIComponent(unlockMatch[1]))
    if (!event?.published) return error('Događaj nije pronađen.', 404)
    return json({ event: eventFromRow(event), adminToken: event.admin_token })
  }

  return null
}

function streamFromBytes(bytes) {
  return new Blob([bytes]).stream()
}

async function handleGallery(request, env, url) {
  const match = url.pathname.match(/^\/api\/events\/([^/]+)\/photos$/)
  if (!match) return null
  const slug = decodeURIComponent(match[1])
  const event = await eventRowBySlug(env, slug)
  if (!event?.published) return error('Događaj nije pronađen.', 404)

  if (request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM photos WHERE event_id = ?1 ORDER BY created_at DESC, rowid DESC').bind(event.id).all()
    return json(rows.results.map(photoFromRow), 200, { 'Cache-Control': 'public, max-age=5, stale-while-revalidate=30' })
  }

  if (request.method === 'POST') {
    const length = Number(request.headers.get('content-length') ?? 0)
    if (length > MAX_IMAGE_BYTES) return error('Fotografija može imati najviše 20 MB.', 413)
    if (!request.headers.get('content-type')?.startsWith('image/')) return error('Odabrana datoteka nije fotografija.', 415)
    if (!request.body) return error('Fotografija nije poslana.')

    const inputBytes = await request.arrayBuffer()
    if (!inputBytes.byteLength || inputBytes.byteLength > MAX_IMAGE_BYTES) return error('Fotografija može imati najviše 20 MB.', 413)

    const info = await env.IMAGES.info(streamFromBytes(inputBytes))
    if (!('width' in info) || !('height' in info)) return error('Format fotografije nije podržan.', 415)

    const [mainResult, thumbResult] = await Promise.all([
      env.IMAGES.input(streamFromBytes(inputBytes)).transform({ width: 2048, height: 2048, fit: 'scale-down' }).output({ format: 'image/webp', quality: 82, anim: false }),
      env.IMAGES.input(streamFromBytes(inputBytes)).transform({ width: 640, height: 640, fit: 'scale-down' }).output({ format: 'image/webp', quality: 76, anim: false })
    ])

    const id = crypto.randomUUID()
    const objectKey = `events/${event.id}/${id}.webp`
    const thumbKey = `events/${event.id}/${id}-thumb.webp`
    const [mainObject] = await Promise.all([
      env.PHOTOS.put(objectKey, mainResult.image(), { httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' } }),
      env.PHOTOS.put(thumbKey, thumbResult.image(), { httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' } })
    ])

    let originalName = request.headers.get('x-file-name') ?? ''
    try { originalName = decodeURIComponent(originalName) } catch { originalName = '' }

    try {
      await env.DB.prepare(
        `INSERT INTO photos (id, event_id, object_key, thumb_key, original_name, width, height, byte_size)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
      ).bind(id, event.id, objectKey, thumbKey, originalName || null, info.width, info.height, mainObject?.size ?? 0).run()
    } catch (databaseError) {
      await Promise.all([env.PHOTOS.delete(objectKey), env.PHOTOS.delete(thumbKey)])
      throw databaseError
    }

    const row = await env.DB.prepare('SELECT * FROM photos WHERE id = ?1').bind(id).first()
    return json(photoFromRow(row), 201)
  }

  return error('Metoda nije podržana.', 405)
}

async function handleMedia(request, env, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null
  const match = url.pathname.match(/^\/media\/([^/]+)(?:\/(thumbnail))?$/)
  if (!match) return null
  const id = decodeURIComponent(match[1])
  const row = await env.DB.prepare('SELECT object_key, thumb_key FROM photos WHERE id = ?1').bind(id).first()
  if (!row) return error('Fotografija nije pronađena.', 404)
  const object = await env.PHOTOS.get(match[2] ? row.thumb_key : row.object_key)
  if (!object) return error('Fotografija nije pronađena.', 404)
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Content-Type', 'image/webp')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('ETag', object.httpEtag)
  return new Response(request.method === 'HEAD' ? null : object.body, { headers })
}

async function routeRequest(request, env) {
  const url = new URL(request.url)
  if (url.pathname.startsWith('/media/')) return (await handleMedia(request, env, url)) ?? error('Nije pronađeno.', 404)
  if (!url.pathname.startsWith('/api/')) return error('Nije pronađeno.', 404)

  return (await handleEvents(request, env, url))
    ?? (await handleTables(request, env, url))
    ?? (await handleGuests(request, env, url))
    ?? (await handlePublic(request, env, url))
    ?? (await handleGallery(request, env, url))
    ?? error('Nije pronađeno.', 404)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const corsOrigin = allowedCorsOrigin(request)
    if (request.method === 'OPTIONS' && (url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/'))) {
      if (!corsOrigin) return error('Origin nije dopušten.', 403)
      return new Response(null, { status: 204, headers: corsHeaders(corsOrigin) })
    }
    try {
      return withCors(await routeRequest(request, env), corsOrigin)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      console.error(JSON.stringify({ message: 'request_failed', path: url.pathname, error: message }))
      return withCors(error('Dogodila se neočekivana greška.', 500), corsOrigin)
    }
  }
}
