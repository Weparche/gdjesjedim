# GdjeSjedim.hr MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the GdjeSjedim.hr mobile-first PWA MVP: organizer wizard (upload invitation → confirm → guests → tables → publish → share) plus a public guest page where a guest types their name and finds their table, matching the visual direction in `flow.png`.

**Architecture:** Vite + React 19 SPA, `react-router-dom` for routing, a `LocalRepository` (localStorage-backed) implementing an `EventsRepository` interface so persistence can later swap to Cloudflare D1/R2 without UI changes. Wizard state lives in a React Context reducer (`EventDraftContext`) that writes through to the repository as each step completes. No backend calls anywhere in this plan.

**Tech Stack:** Vite, React 19, JavaScript (no TS), Tailwind v4 (`@tailwindcss/vite`), `react-router-dom`, `framer-motion`, `lucide-react`, `qrcode`, `vite-plugin-pwa`, Playwright (`@playwright/test`), Node's built-in `node:test` runner for pure-logic unit tests (no new test-framework dependency).

## Global Constraints

- Design tokens (colors, radii, shadows, fonts) are fixed in Task 1 and must be reused via Tailwind utilities everywhere — no ad-hoc hex values in component files.
- Colors: ivory `#FAF4EA`, cream `#F3E9D9`, gold `#C79A4B`, gold-deep `#A87F3A`, charcoal `#2B2420`, charcoal-soft `#6B5F55`, blush `#E7A9AE`, blush-soft `#F7E3E1`, whatsapp `#25D366`.
- Fonts: `"DM Serif Display"` for display/headings, `"Inter"` for UI — no more than these two families.
- Radii: sm 10px, md 16px, lg 22px, pill 999px.
- All interactive elements ≥44px touch target; visible focus rings; `prefers-reduced-motion` respected; no horizontal scroll at 375/390/430px widths.
- All UI copy is Croatian and must match the exact strings quoted in the design spec (`docs/superpowers/specs/2026-08-07-gdjesjedim-mvp-design.md`).
- No ImageGen-produced assets — the demo invitation is a hand-built SVG/HTML composition.
- Every screen must be reachable and the full happy path completable with zero network/backend calls.
- Commit after every task with a message prefixed `feat:`, `test:`, `chore:`, or `fix:` as appropriate.

---

### Task 1: Project scaffold & design tokens

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`
- Create: `src/main.jsx`, `src/App.jsx`, `src/styles/index.css`
- Create: `.gitignore`

**Interfaces:**
- Produces: Tailwind utility classes `bg-ivory`, `bg-cream`, `text-charcoal`, `text-charcoal-soft`, `bg-gold`, `bg-gold-deep`, `bg-blush`, `bg-blush-soft`, `bg-whatsapp`, `font-display`, `font-ui`, `rounded-sm|md|lg|pill`, `shadow-card`, `shadow-elevated`.
- Produces: `<App />` rendering a `BrowserRouter` with one route `/` → inline "GdjeSjedim.hr" placeholder text (replaced with the real Landing page in Task 8).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "gdjesjedim",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test:unit": "node --test src",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.2.4",
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.11.0",
    "qrcode": "^1.5.4",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-router-dom": "^7.14.2",
    "tailwindcss": "^4.2.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0",
    "@vitejs/plugin-react": "^6.0.1",
    "playwright": "^1.60.0",
    "vite": "^8.0.10",
    "vite-plugin-pwa": "^1.0.3"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: lockfile generated, no errors.

- [ ] **Step 3: Create `.gitignore`**

```
node_modules
dist
dev-dist
test-results
playwright-report
screenshots
```

- [ ] **Step 4: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'GdjeSjedim.hr',
        short_name: 'GdjeSjedim',
        description: 'Jedan link za svaku proslavu',
        theme_color: '#C79A4B',
        background_color: '#FAF4EA',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  server: { port: 5173 }
})
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="hr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#C79A4B" />
    <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>GdjeSjedim.hr — Jedan link za svaku proslavu</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/styles/index.css`**

```css
@import "tailwindcss";

@theme {
  --color-ivory: #FAF4EA;
  --color-cream: #F3E9D9;
  --color-gold: #C79A4B;
  --color-gold-deep: #A87F3A;
  --color-charcoal: #2B2420;
  --color-charcoal-soft: #6B5F55;
  --color-blush: #E7A9AE;
  --color-blush-soft: #F7E3E1;
  --color-whatsapp: #25D366;

  --font-display: "DM Serif Display", serif;
  --font-ui: "Inter", system-ui, sans-serif;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-pill: 999px;

  --shadow-card: 0 2px 10px rgba(43, 36, 32, 0.06);
  --shadow-elevated: 0 8px 24px rgba(43, 36, 32, 0.10);
}

html, body, #root {
  height: 100%;
}

body {
  background-color: var(--color-ivory);
  color: var(--color-charcoal);
  font-family: var(--font-ui);
  overflow-x: hidden;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

:focus-visible {
  outline: 2px solid var(--color-gold-deep);
  outline-offset: 2px;
}
```

- [ ] **Step 7: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 8: Create `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function LandingPlaceholder() {
  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center">
      <h1 className="font-display text-2xl text-charcoal">GdjeSjedim.hr</h1>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto max-w-[480px] min-h-screen bg-ivory">
        <Routes>
          <Route path="/" element={<LandingPlaceholder />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
```

- [ ] **Step 9: Verify dev server and build**

Run: `npm run dev` (then Ctrl+C after confirming it starts), then `npm run build`
Expected: dev server starts on port 5173 with no errors; build completes and emits `dist/`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite+React+Tailwind v4 project with design tokens"
```

---

### Task 2: Core utilities (id, normalize, slug, guest parsing)

**Files:**
- Create: `src/lib/id.js`
- Create: `src/lib/normalize.js`
- Create: `src/lib/slug.js`
- Create: `src/lib/guestParse.js`
- Test: `src/lib/normalize.test.js`, `src/lib/slug.test.js`, `src/lib/guestParse.test.js`, `src/lib/id.test.js`

**Interfaces:**
- Produces: `generateId(): string`
- Produces: `normalizeName(name: string): string` — lowercase, diacritics stripped, whitespace collapsed/trimmed.
- Produces: `slugify(title: string): string` — lowercase, diacritics stripped, non-alphanumerics → `-`, no leading/trailing/duplicate `-`.
- Produces: `parseGuestList(text: string): string[]` — one trimmed non-empty name per line, blank lines dropped.

- [ ] **Step 1: Write failing tests for `normalizeName`**

```js
// src/lib/normalize.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeName } from './normalize.js'

test('lowercases and trims', () => {
  assert.equal(normalizeName('  Ivan Gorupić  '), 'ivan gorupic')
})

test('strips Croatian diacritics', () => {
  assert.equal(normalizeName('Šime Đurić Čvrsti Žan'), 'sime duric cvrsti zan')
})

test('collapses internal whitespace', () => {
  assert.equal(normalizeName('Ana   Marija'), 'ana marija')
})

test('handles uppercase input', () => {
  assert.equal(normalizeName('IVAN GORUPIĆ'), 'ivan gorupic')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/normalize.test.js`
Expected: FAIL — `Cannot find module './normalize.js'`

- [ ] **Step 3: Implement `src/lib/normalize.js`**

```js
const DIACRITIC_MAP = { đ: 'd', Đ: 'd' }

export function normalizeName(name) {
  const mapped = String(name ?? '')
    .split('')
    .map((ch) => DIACRITIC_MAP[ch] ?? ch)
    .join('')

  return mapped
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/normalize.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Write failing tests for `slugify`**

```js
// src/lib/slug.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slugify } from './slug.js'

test('slugifies a Croatian title', () => {
  assert.equal(slugify('Marijino krštenje'), 'marijino-krstenje')
})

test('strips punctuation and collapses dashes', () => {
  assert.equal(slugify('Ana & Marko!!  Vjenčanje'), 'ana-marko-vjencanje')
})

test('trims leading and trailing dashes', () => {
  assert.equal(slugify('  -Rođendan-  '), 'rodendan')
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `node --test src/lib/slug.test.js`
Expected: FAIL — module not found

- [ ] **Step 7: Implement `src/lib/slug.js`**

```js
import { normalizeName } from './normalize.js'

export function slugify(title) {
  const base = normalizeName(title)
  return base
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `node --test src/lib/slug.test.js`
Expected: PASS (3 tests)

- [ ] **Step 9: Write failing tests for `parseGuestList`**

```js
// src/lib/guestParse.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseGuestList } from './guestParse.js'

test('splits lines into trimmed names', () => {
  const text = 'Ivan Gorupić\nAna Gorupić\nMarko Horvat'
  assert.deepEqual(parseGuestList(text), ['Ivan Gorupić', 'Ana Gorupić', 'Marko Horvat'])
})

test('drops blank lines', () => {
  const text = 'Ivan Gorupić\n\n  \nAna Gorupić\n'
  assert.deepEqual(parseGuestList(text), ['Ivan Gorupić', 'Ana Gorupić'])
})

test('returns empty array for blank input', () => {
  assert.deepEqual(parseGuestList('   \n  '), [])
})
```

- [ ] **Step 10: Run test to verify it fails**

Run: `node --test src/lib/guestParse.test.js`
Expected: FAIL — module not found

- [ ] **Step 11: Implement `src/lib/guestParse.js`**

```js
export function parseGuestList(text) {
  return String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
```

- [ ] **Step 12: Run test to verify it passes**

Run: `node --test src/lib/guestParse.test.js`
Expected: PASS (3 tests)

- [ ] **Step 13: Write test and implementation for `generateId`**

```js
// src/lib/id.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateId } from './id.js'

test('generates non-empty unique-looking ids', () => {
  const a = generateId()
  const b = generateId()
  assert.ok(typeof a === 'string' && a.length > 0)
  assert.notEqual(a, b)
})
```

```js
// src/lib/id.js
export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
```

- [ ] **Step 14: Run all unit tests**

Run: `npm run test:unit`
Expected: PASS — 11 tests total across the 4 files.

- [ ] **Step 15: Commit**

```bash
git add src/lib
git commit -m "feat: add id, normalizeName, slugify, parseGuestList utilities"
```

---

### Task 3: Repository layer (`EventsRepository` + `LocalRepository`)

**Files:**
- Create: `src/data/repository.js`
- Test: `src/data/repository.test.js`

**Interfaces:**
- Consumes: `generateId` from `src/lib/id.js`, `normalizeName` from `src/lib/normalize.js`, `slugify` from `src/lib/slug.js`.
- Produces: `createLocalRepository(storage?): EventsRepository` where a default in-memory `storage` (Map-like `getItem/setItem`) is used when none is passed, and the browser app passes `window.localStorage`.
- Produces `EventsRepository` methods (all synchronous, returning plain objects/arrays — no promises needed for localStorage but methods are `async` so a future network-backed implementation is a drop-in swap):
  - `createEvent({ title, type, date }): Promise<Event>` — generates `id`, unique `slug` via `slugify` (+ `-2`, `-3`... suffix on collision), `published: false`.
  - `getEvent(id): Promise<Event | undefined>`
  - `getEventBySlug(slug): Promise<Event | undefined>`
  - `updateEvent(id, patch): Promise<Event>`
  - `addScheduleItems(eventId, items: {time, title, locationName, address?}[]): Promise<ScheduleItem[]>`
  - `getScheduleItems(eventId): Promise<ScheduleItem[]>`
  - `addTables(eventId, tables: {name, capacity?}[]): Promise<Table[]>`
  - `getTables(eventId): Promise<Table[]>`
  - `addGuests(eventId, names: string[]): Promise<Guest[]>` — computes `normalizedName` per guest.
  - `updateGuest(id, patch): Promise<Guest>`
  - `getGuests(eventId): Promise<Guest[]>`
  - `assignGuestToTable(guestId, tableId | null): Promise<Guest>`
  - `publishEvent(id): Promise<Event>` — sets `published: true`.
  - `searchGuest(slug, query): Promise<{ guest: Guest, table: Table | undefined } | null>` — only method the public guest page may call; normalizes `query`, matches by `normalizedName` containing the normalized query (partial match), returns the first match or `null`. Never returns the full guest list.

- [ ] **Step 1: Write failing tests**

```js
// src/data/repository.test.js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/data/repository.test.js`
Expected: FAIL — `Cannot find module './repository.js'`

- [ ] **Step 3: Implement `src/data/repository.js`**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test src/data/repository.test.js`
Expected: PASS (7 tests)

- [ ] **Step 5: Run full unit suite**

Run: `npm run test:unit`
Expected: PASS — 18 tests total.

- [ ] **Step 6: Commit**

```bash
git add src/data
git commit -m "feat: add EventsRepository interface with LocalRepository implementation"
```

---

### Task 4: `EventDraftContext` (wizard state)

**Files:**
- Create: `src/context/EventDraftContext.jsx`
- Create: `src/data/repositoryInstance.js`

**Interfaces:**
- Consumes: `createLocalRepository` from `src/data/repository.js`.
- Produces: `repository` singleton (default export from `repositoryInstance.js`) constructed with `window.localStorage`.
- Produces: `EventDraftProvider` component and `useEventDraft()` hook returning `{ draft, setEvent(event), setExtractedData(data), setGuests(guests), setTables(tables), reset() }` where `draft` is `{ event, extractedData, guests, tables }` (all start `null`/`[]`). This is in-memory UI convenience state only — the source of truth after each wizard step is the repository (written directly by each page's step handler, per Task 5-9's implementations, not by this context).

- [ ] **Step 1: Create `src/data/repositoryInstance.js`**

```js
import { createLocalRepository } from './repository.js'

const repository = createLocalRepository(window.localStorage)

export default repository
```

- [ ] **Step 2: Create `src/context/EventDraftContext.jsx`**

```jsx
import { createContext, useContext, useMemo, useState } from 'react'

const EventDraftContext = createContext(null)

const initialDraft = { event: null, extractedData: null, guests: [], tables: [] }

export function EventDraftProvider({ children }) {
  const [draft, setDraft] = useState(initialDraft)

  const value = useMemo(
    () => ({
      draft,
      setEvent: (event) => setDraft((d) => ({ ...d, event })),
      setExtractedData: (extractedData) => setDraft((d) => ({ ...d, extractedData })),
      setGuests: (guests) => setDraft((d) => ({ ...d, guests })),
      setTables: (tables) => setDraft((d) => ({ ...d, tables })),
      reset: () => setDraft(initialDraft)
    }),
    [draft]
  )

  return <EventDraftContext.Provider value={value}>{children}</EventDraftContext.Provider>
}

export function useEventDraft() {
  const ctx = useContext(EventDraftContext)
  if (!ctx) throw new Error('useEventDraft must be used within EventDraftProvider')
  return ctx
}
```

- [ ] **Step 3: Wrap the app in the provider — modify `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EventDraftProvider } from './context/EventDraftContext.jsx'

function LandingPlaceholder() {
  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center">
      <h1 className="font-display text-2xl text-charcoal">GdjeSjedim.hr</h1>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <EventDraftProvider>
        <div className="mx-auto max-w-[480px] min-h-screen bg-ivory">
          <Routes>
            <Route path="/" element={<LandingPlaceholder />} />
          </Routes>
        </div>
      </EventDraftProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/context src/data/repositoryInstance.js src/App.jsx
git commit -m "feat: add EventDraftContext and repository singleton"
```

---

### Task 5: Shared button primitives

**Files:**
- Create: `src/components/buttons/PrimaryButton.jsx`
- Create: `src/components/buttons/SecondaryButton.jsx`

**Interfaces:**
- Produces: `<PrimaryButton onClick? type? disabled? className?>{children}</PrimaryButton>` — solid gold pill/rounded-md button, white text, min-height 52px, press micro-interaction via `framer-motion` `whileTap`.
- Produces: `<SecondaryButton onClick? type? disabled? className?>{children}</SecondaryButton>` — text-only or outline button, charcoal text, min-height 44px.

- [ ] **Step 1: Implement `src/components/buttons/PrimaryButton.jsx`**

```jsx
import { motion } from 'framer-motion'

export default function PrimaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-gold px-6 font-ui text-base font-semibold text-white shadow-card transition-colors hover:bg-gold-deep disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

- [ ] **Step 2: Implement `src/components/buttons/SecondaryButton.jsx`**

```jsx
import { motion } from 'framer-motion'

export default function SecondaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-transparent px-6 font-ui text-base font-medium text-charcoal-soft transition-colors hover:text-charcoal disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/buttons
git commit -m "feat: add PrimaryButton and SecondaryButton primitives"
```

---

### Task 6: Layout primitives — `AppShell`, `PageHeader`, `StepIndicator`

**Files:**
- Create: `src/components/layout/AppShell.jsx`
- Create: `src/components/layout/PageHeader.jsx`
- Create: `src/components/layout/StepIndicator.jsx`

**Interfaces:**
- Produces: `<AppShell>{children}</AppShell>` — full-height ivory background wrapper with consistent horizontal padding (`px-5 pb-8`) used by every page.
- Produces: `<PageHeader title onBack? step? totalSteps? />` — optional back chevron (lucide `ChevronLeft`) + title (font-ui, semibold) + optional `<StepIndicator step totalSteps />` beneath.
- Produces: `<StepIndicator step totalSteps />` — row of numbered pill dots (1–2–3–4), current step filled gold, completed steps gold outline, future steps cream, connected by thin lines.

- [ ] **Step 1: Implement `src/components/layout/AppShell.jsx`**

```jsx
export default function AppShell({ children, className = '' }) {
  return (
    <main className={`min-h-screen bg-ivory px-5 pb-10 pt-6 ${className}`}>
      {children}
    </main>
  )
}
```

- [ ] **Step 2: Implement `src/components/layout/StepIndicator.jsx`**

```jsx
export default function StepIndicator({ step, totalSteps }) {
  return (
    <ol className="mt-4 flex items-center" aria-label={`Korak ${step} od ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n, i) => (
        <li key={n} className="flex items-center">
          <span
            aria-current={n === step ? 'step' : undefined}
            className={`flex h-7 w-7 items-center justify-center rounded-pill font-ui text-sm font-semibold ${
              n === step
                ? 'bg-gold text-white'
                : n < step
                ? 'border-2 border-gold text-gold'
                : 'bg-cream text-charcoal-soft'
            }`}
          >
            {n}
          </span>
          {i < totalSteps - 1 && (
            <span className={`mx-1.5 h-px w-6 ${n < step ? 'bg-gold' : 'bg-cream'}`} aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  )
}
```

- [ ] **Step 3: Implement `src/components/layout/PageHeader.jsx`**

```jsx
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StepIndicator from './StepIndicator.jsx'

export default function PageHeader({ title, onBack, step, totalSteps }) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <header>
      <div className="flex items-center gap-3">
        {onBack !== null && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Natrag"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-charcoal hover:bg-cream"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
        )}
        <h1 className="font-ui text-lg font-semibold text-charcoal">{title}</h1>
      </div>
      {step && totalSteps && <StepIndicator step={step} totalSteps={totalSteps} />}
    </header>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout
git commit -m "feat: add AppShell, PageHeader, StepIndicator layout primitives"
```

---

### Task 7: `Toast` and `BottomSheet`

**Files:**
- Create: `src/components/common/Toast.jsx`
- Create: `src/components/common/BottomSheet.jsx`

**Interfaces:**
- Produces: `ToastProvider` (wraps app) + `useToast()` returning `showToast(message: string)`. Toast renders bottom-centered, auto-dismisses after 2500ms, `role="status"` `aria-live="polite"`.
- Produces: `<BottomSheet open onClose title children />` — fixed overlay + sheet sliding from bottom (`framer-motion`), `rounded-t-lg`, closes on backdrop click or Escape, traps focus is out of scope for MVP but sheet content starts with a visible close button (44px target).

- [ ] **Step 1: Implement `src/components/common/Toast.jsx`**

```jsx
import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null)

  const showToast = useCallback((msg) => {
    setMessage(msg)
    window.setTimeout(() => setMessage(null), 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-5">
        <AnimatePresence>
          {message && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto rounded-md bg-charcoal px-4 py-3 font-ui text-sm text-white shadow-elevated"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
```

- [ ] **Step 2: Implement `src/components/common/BottomSheet.jsx`**

```jsx
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.button
            type="button"
            aria-label="Zatvori"
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-[480px] rounded-t-lg bg-white px-5 pb-8 pt-4 shadow-elevated"
          >
            <div className="flex items-center justify-between pb-3">
              <h2 className="font-ui text-base font-semibold text-charcoal">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Zatvori"
                className="flex h-11 w-11 items-center justify-center rounded-md text-charcoal-soft hover:bg-cream"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Wire `ToastProvider` into `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EventDraftProvider } from './context/EventDraftContext.jsx'
import { ToastProvider } from './components/common/Toast.jsx'

function LandingPlaceholder() {
  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center">
      <h1 className="font-display text-2xl text-charcoal">GdjeSjedim.hr</h1>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <EventDraftProvider>
          <div className="mx-auto max-w-[480px] min-h-screen bg-ivory">
            <Routes>
              <Route path="/" element={<LandingPlaceholder />} />
            </Routes>
          </div>
        </EventDraftProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/common src/App.jsx
git commit -m "feat: add Toast and BottomSheet common overlays"
```

---

### Task 8: Landing page

**Files:**
- Create: `src/pages/LandingPage.jsx`
- Create: `src/components/landing/EventTypeCard.jsx`
- Create: `src/components/landing/BotanicalDivider.jsx`
- Modify: `src/App.jsx` (replace placeholder route with `LandingPage`)

**Interfaces:**
- Consumes: `PrimaryButton`, `AppShell`, `useEventDraft`.
- Produces: route `/` renders `LandingPage`; clicking an event-type card or the primary CTA calls `useNavigate()` to `/create/upload`, storing the chosen `type` (default `"other"` if CTA clicked without a card) via `setEvent({ type })` on the draft context (full event isn't created in the repository until Task 9's upload step).

- [ ] **Step 1: Implement `src/components/landing/EventTypeCard.jsx`**

```jsx
import { motion } from 'framer-motion'

export default function EventTypeCard({ icon: Icon, label, selected, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-lg border bg-white px-3 py-4 shadow-card transition-colors ${
        selected ? 'border-gold' : 'border-cream'
      }`}
    >
      <Icon size={24} strokeWidth={1.5} className="text-gold" />
      <span className="font-ui text-sm font-medium text-charcoal">{label}</span>
    </motion.button>
  )
}
```

- [ ] **Step 2: Implement `src/components/landing/BotanicalDivider.jsx`**

```jsx
export default function BotanicalDivider() {
  return (
    <svg
      viewBox="0 0 200 40"
      className="mx-auto mt-10 h-8 w-40 text-gold opacity-60"
      fill="none"
      aria-hidden="true"
    >
      <path d="M100 20 C 70 5, 40 5, 20 20" stroke="currentColor" strokeWidth="1.2" />
      <path d="M100 20 C 130 5, 160 5, 180 20" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="100" cy="20" r="3" fill="currentColor" />
      <path d="M60 14 q4 -6 8 0 q-4 6 -8 0 Z" fill="currentColor" opacity="0.5" />
      <path d="M132 14 q4 -6 8 0 q-4 6 -8 0 Z" fill="currentColor" opacity="0.5" />
    </svg>
  )
}
```

- [ ] **Step 3: Implement `src/pages/LandingPage.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { Church, Gem, Cake, Wine, ArrowRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import EventTypeCard from '../components/landing/EventTypeCard.jsx'
import BotanicalDivider from '../components/landing/BotanicalDivider.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'

const EVENT_TYPES = [
  { type: 'christening', label: 'Krštenje', icon: Church },
  { type: 'wedding', label: 'Vjenčanje', icon: Gem },
  { type: 'birthday', label: 'Rođendan', icon: Cake },
  { type: 'communion', label: 'Pričest / Krizma', icon: Wine }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { draft, setEvent } = useEventDraft()

  function selectType(type) {
    setEvent({ ...draft.event, type })
  }

  function goToCreate() {
    if (!draft.event?.type) setEvent({ ...draft.event, type: 'other' })
    navigate('/create/upload')
  }

  return (
    <AppShell>
      <div className="flex items-center gap-2 pt-2">
        <span className="font-display text-lg text-gold" aria-hidden="true">
          🪑
        </span>
        <span className="font-display text-lg text-charcoal">GdjeSjedim.hr</span>
      </div>

      <h1 className="mt-8 font-display text-4xl leading-tight text-charcoal">
        Jedan link za
        <br />
        svaku proslavu
      </h1>

      <p className="mt-4 font-ui text-base leading-relaxed text-charcoal-soft">
        Učitaj pozivnicu, rasporedi goste i pošalji gostima link gdje vide svoj stol i raspored
        događaja.
      </p>

      <div className="mt-6">
        <PrimaryButton onClick={goToCreate}>
          Napravi besplatno
          <ArrowRight size={18} strokeWidth={2} />
        </PrimaryButton>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {EVENT_TYPES.map(({ type, label, icon }) => (
          <EventTypeCard
            key={type}
            icon={icon}
            label={label}
            selected={draft.event?.type === type}
            onClick={() => selectType(type)}
          />
        ))}
      </div>

      <BotanicalDivider />
    </AppShell>
  )
}
```

- [ ] **Step 4: Wire route in `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EventDraftProvider } from './context/EventDraftContext.jsx'
import { ToastProvider } from './components/common/Toast.jsx'
import LandingPage from './pages/LandingPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <EventDraftProvider>
          <div className="mx-auto max-w-[480px] min-h-screen bg-ivory">
            <Routes>
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </div>
        </EventDraftProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Verify in browser**

Run: `npm run dev`, open `http://localhost:5173/`
Expected: Landing renders with logo, hero, description, CTA, 4 event-type cards, botanical divider; tapping a card highlights it in gold; tapping CTA navigates to `/create/upload` (blank route until Task 9 — a blank page is expected here).

- [ ] **Step 6: Commit**

```bash
git add src/pages/LandingPage.jsx src/components/landing src/App.jsx
git commit -m "feat: implement Landing page"
```

---

### Task 9: Upload page (`InvitationUploader`, `InvitationPreview`, mocked extraction)

**Files:**
- Create: `src/components/upload/InvitationUploader.jsx`
- Create: `src/components/upload/InvitationPreview.jsx`
- Create: `src/lib/mockExtraction.js`
- Create: `src/pages/UploadPage.jsx`
- Modify: `src/App.jsx` (add route `/create/upload`)

**Interfaces:**
- Consumes: `AppShell`, `PageHeader`, `PrimaryButton`, `useEventDraft`, `repository` (default export from `src/data/repositoryInstance.js`).
- Produces: `mockExtractedData(): { title, date, scheduleItems: {time, title, locationName}[] }` — fixed demo payload for "Marijino krštenje" (26.9.2026., 12:00 Crkva Sv. Mati Slobode, 13:00 Lido).
- Produces: `<InvitationUploader onFileSelected(file) />` — dashed-border upload zone, hidden `<input type="file" accept=".png,.jpg,.jpeg,.pdf">`, label "Učitaj pozivnicu" + helper text "PNG, JPG ili PDF".
- Produces: `<InvitationPreview />` — SVG/HTML composition of the demo invitation (ivory card, blush flower motif, gold rule, serif "Marijino krštenje" text) — always renders this fixed demo visual once a file is selected, regardless of the actual uploaded file content (MVP has no real image processing).
- Produces: route `/create/upload` renders `UploadPage`; after "upload" (any file selection) shows `InvitationPreview` + "✨ AI je pročitao podatke" panel with the mocked fields; "Potvrdi podatke" calls `setExtractedData(mockExtractedData())` then navigates to `/create/confirm`; "Promijeni" resets the uploaded-file state so the upload zone reappears.

- [ ] **Step 1: Implement `src/lib/mockExtraction.js`**

```js
export function mockExtractedData() {
  return {
    title: 'Marijino krštenje',
    date: '2026-09-26',
    scheduleItems: [
      { time: '12:00', title: 'Krštenje', locationName: 'Crkva Sv. Mati Slobode' },
      { time: '13:00', title: 'Ručak', locationName: 'Lido' }
    ]
  }
}
```

- [ ] **Step 2: Implement `src/components/upload/InvitationUploader.jsx`**

```jsx
import { useRef } from 'react'
import { UploadCloud } from 'lucide-react'

export default function InvitationUploader({ onFileSelected }) {
  const inputRef = useRef(null)

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gold/50 bg-white px-6 py-10 text-center shadow-card"
      >
        <UploadCloud size={32} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
        <span className="font-ui text-base font-semibold text-charcoal">Učitaj pozivnicu</span>
        <span className="font-ui text-sm text-charcoal-soft">PNG, JPG ili PDF</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelected(file)
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Implement `src/components/upload/InvitationPreview.jsx`**

```jsx
export default function InvitationPreview() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card">
      <svg viewBox="0 0 320 360" className="w-full" role="img" aria-label="Pozivnica za Marijino krštenje">
        <rect width="320" height="360" fill="#FFFDF9" />
        <g stroke="#E7A9AE" strokeWidth="1.4" fill="none" opacity="0.7">
          <path d="M30 40 C 50 20, 70 20, 90 40" />
          <path d="M230 40 C 250 20, 270 20, 290 40" />
          <path d="M30 320 C 50 340, 70 340, 90 320" />
          <path d="M230 320 C 250 340, 270 340, 290 320" />
        </g>
        <g fill="#E7A9AE" opacity="0.6">
          <circle cx="45" cy="30" r="5" />
          <circle cx="65" cy="24" r="4" />
          <circle cx="275" cy="30" r="5" />
          <circle cx="255" cy="24" r="4" />
        </g>
        <path d="M160 70 L160 100 M148 82 L172 82" stroke="#C79A4B" strokeWidth="2" />
        <text x="160" y="150" textAnchor="middle" fontFamily="'DM Serif Display', serif" fontSize="14" fill="#6B5F55">
          Pozivamo vas na
        </text>
        <text x="160" y="195" textAnchor="middle" fontFamily="'DM Serif Display', serif" fontSize="30" fill="#2B2420">
          Marijino
        </text>
        <text x="160" y="228" textAnchor="middle" fontFamily="'DM Serif Display', serif" fontSize="30" fill="#2B2420">
          krštenje
        </text>
        <line x1="120" y1="250" x2="200" y2="250" stroke="#C79A4B" strokeWidth="1" />
        <text x="160" y="278" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="#6B5F55">
          26. rujna 2026.
        </text>
        <text x="160" y="304" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#6B5F55">
          12:00 · Crkva Sv. Mati Slobode
        </text>
        <text x="160" y="322" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#6B5F55">
          13:00 · Lido
        </text>
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/pages/UploadPage.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, User, Calendar, MapPin, Utensils } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import SecondaryButton from '../components/buttons/SecondaryButton.jsx'
import InvitationUploader from '../components/upload/InvitationUploader.jsx'
import InvitationPreview from '../components/upload/InvitationPreview.jsx'
import { mockExtractedData } from '../lib/mockExtraction.js'
import { useEventDraft } from '../context/EventDraftContext.jsx'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setExtractedData } = useEventDraft()
  const [uploaded, setUploaded] = useState(false)
  const data = mockExtractedData()

  function confirm() {
    setExtractedData(data)
    navigate('/create/confirm')
  }

  return (
    <AppShell>
      <PageHeader title="1. Učitaj pozivnicu" step={1} totalSteps={4} />

      <div className="mt-6">
        {!uploaded ? (
          <InvitationUploader onFileSelected={() => setUploaded(true)} />
        ) : (
          <div className="space-y-4">
            <InvitationPreview />

            <div className="rounded-lg bg-white p-4 shadow-card">
              <p className="flex items-center gap-2 font-ui text-sm font-semibold text-gold">
                <Sparkles size={16} strokeWidth={1.5} aria-hidden="true" />
                AI je pročitao podatke
              </p>
              <dl className="mt-3 space-y-2 font-ui text-sm text-charcoal">
                <div className="flex items-center gap-2">
                  <User size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>{data.title}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>26.9.2026.</dd>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>12:00 · Crkva Sv. Mati Slobode</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>13:00 · Lido</dd>
                </div>
              </dl>
            </div>

            <PrimaryButton onClick={confirm}>Potvrdi podatke</PrimaryButton>
            <SecondaryButton onClick={() => setUploaded(false)}>Promijeni</SecondaryButton>
          </div>
        )}
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 5: Wire route in `src/App.jsx`**

Add import `import UploadPage from './pages/UploadPage.jsx'` and route:

```jsx
<Route path="/create/upload" element={<UploadPage />} />
```

- [ ] **Step 6: Verify in browser**

Run: `npm run dev`, navigate `/` → tap "Napravi besplatno" → tap upload zone → select any file
Expected: preview + extraction panel with the fixed Marijino krštenje data appear; "Potvrdi podatke" navigates to `/create/confirm` (blank until Task 10); "Promijeni" returns to the empty upload zone.

- [ ] **Step 7: Commit**

```bash
git add src/components/upload src/lib/mockExtraction.js src/pages/UploadPage.jsx src/App.jsx
git commit -m "feat: implement Upload page with mocked AI extraction"
```

---

### Task 10: Confirm page (`ExtractedDataCard`) — creates the event in the repository

**Files:**
- Create: `src/components/upload/ExtractedDataCard.jsx`
- Create: `src/pages/ConfirmPage.jsx`
- Modify: `src/App.jsx` (add route `/create/confirm`)

**Interfaces:**
- Consumes: `useEventDraft`, `repository.createEvent`, `repository.addScheduleItems`.
- Produces: `<ExtractedDataCard data title date scheduleItems />` — read-only summary card matching the design spec's confirm-state fields.
- Produces: route `/create/confirm`; if `draft.extractedData` is missing (direct navigation), redirects to `/create/upload`. "Potvrdi podatke" creates the event via `repository.createEvent({ title, type: draft.event.type, date })`, adds schedule items via `repository.addScheduleItems`, stores the created event in the draft (`setEvent`), then navigates to `/create/guests`.

- [ ] **Step 1: Implement `src/components/upload/ExtractedDataCard.jsx`**

```jsx
export default function ExtractedDataCard({ title, date, scheduleItems }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-card">
      <p className="font-display text-xl text-charcoal">{title}</p>
      <p className="mt-1 font-ui text-sm text-charcoal-soft">{date}</p>
      <ul className="mt-4 space-y-2">
        {scheduleItems.map((item) => (
          <li key={item.time} className="font-ui text-sm text-charcoal">
            <span className="font-semibold">{item.time}</span> — {item.locationName}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Implement `src/pages/ConfirmPage.jsx`**

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import SecondaryButton from '../components/buttons/SecondaryButton.jsx'
import ExtractedDataCard from '../components/upload/ExtractedDataCard.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function ConfirmPage() {
  const navigate = useNavigate()
  const { draft, setEvent } = useEventDraft()

  useEffect(() => {
    if (!draft.extractedData) navigate('/create/upload', { replace: true })
  }, [draft.extractedData, navigate])

  if (!draft.extractedData) return null

  const { title, date, scheduleItems } = draft.extractedData
  const displayDate = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(date)
  )

  async function confirm() {
    const event = await repository.createEvent({ title, type: draft.event?.type ?? 'other', date })
    await repository.addScheduleItems(
      event.id,
      scheduleItems.map((item) => ({ time: item.time, title: item.title, locationName: item.locationName }))
    )
    setEvent(event)
    navigate('/create/guests')
  }

  return (
    <AppShell>
      <PageHeader title="1. Učitaj pozivnicu" step={1} totalSteps={4} />
      <div className="mt-6 space-y-4">
        <ExtractedDataCard title={title} date={displayDate} scheduleItems={scheduleItems} />
        <PrimaryButton onClick={confirm}>Potvrdi podatke</PrimaryButton>
        <SecondaryButton onClick={() => navigate('/create/upload')}>Promijeni</SecondaryButton>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 3: Wire route in `src/App.jsx`**

Add import and route:

```jsx
<Route path="/create/confirm" element={<ConfirmPage />} />
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`, complete Upload step, tap "Potvrdi podatke"
Expected: navigates to `/create/confirm`, shows the summary card, tapping "Potvrdi podatke" creates the event (check `localStorage['gdjesjedim:db']` contains an event with slug `marijino-krstenje`) and navigates to `/create/guests` (blank until Task 11).

- [ ] **Step 5: Commit**

```bash
git add src/components/upload/ExtractedDataCard.jsx src/pages/ConfirmPage.jsx src/App.jsx
git commit -m "feat: implement Confirm page and event creation"
```

---

### Task 11: Guests page

**Files:**
- Create: `src/components/guests/GuestImportTextarea.jsx`
- Create: `src/components/guests/GuestRow.jsx`
- Create: `src/components/guests/GuestList.jsx`
- Create: `src/pages/GuestsPage.jsx`
- Modify: `src/App.jsx` (add route `/create/guests`)

**Interfaces:**
- Consumes: `parseGuestList`, `repository.addGuests`, `repository.getGuests`, `repository.updateGuest`, `useEventDraft`.
- Produces: `<GuestImportTextarea onImport(names: string[]) />` — textarea + "Dodaj N gostiju" button (N = live count of non-empty lines, disabled when 0).
- Produces: `<GuestRow guest onRemove(id) onRename(id, name) />` — drag-handle icon (visual only in this task, no reordering logic — reordering is out of MVP scope beyond the visual affordance), name (inline-editable on tap), remove button (lucide `X`, 44px target).
- Produces: `<GuestList guests onRemove onRename />` — maps `GuestRow`.
- Produces: route `/create/guests`; imported names call `repository.addGuests(event.id, names)` then refresh the on-page list from `repository.getGuests(event.id)`; remove calls `repository.updateGuest`-adjacent removal (see Step note below — repository has no `removeGuest`, so removal is modeled as filtering the page-local list only is insufficient; this task adds `removeGuest(id)` to the repository as a small extension). "Nastavi na stolove" navigates to `/create/tables`.

- [ ] **Step 1: Extend repository with `removeGuest` — modify `src/data/repository.js`**

Add this method inside the returned object, after `updateGuest`:

```js
    async removeGuest(id) {
      return withDb((db) => {
        db.guests = db.guests.filter((g) => g.id !== id)
      })
    },
```

- [ ] **Step 2: Add a test for `removeGuest` — modify `src/data/repository.test.js`**

Add after the `assignGuestToTable` test:

```js
test('removeGuest deletes the guest', async () => {
  const repo = freshRepo()
  const event = await repo.createEvent({ title: 'Krštenje', type: 'christening', date: '2026-09-26' })
  const [guest] = await repo.addGuests(event.id, ['Ivan Gorupić'])
  await repo.removeGuest(guest.id)
  const remaining = await repo.getGuests(event.id)
  assert.equal(remaining.length, 0)
})
```

- [ ] **Step 3: Run tests to verify pass**

Run: `node --test src/data/repository.test.js`
Expected: PASS (8 tests)

- [ ] **Step 4: Implement `src/components/guests/GuestImportTextarea.jsx`**

```jsx
import { useState } from 'react'
import PrimaryButton from '../buttons/PrimaryButton.jsx'
import { parseGuestList } from '../../lib/guestParse.js'

export default function GuestImportTextarea({ onImport }) {
  const [text, setText] = useState('')
  const names = parseGuestList(text)

  return (
    <div className="rounded-lg bg-white p-4 shadow-card">
      <label htmlFor="guest-list" className="font-ui text-sm font-semibold text-charcoal">
        Zalijepi popis gostiju
      </label>
      <textarea
        id="guest-list"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={'Ivan Gorupić\nAna Gorupić\nMarko Horvat\nIvana Horvat\nPetar Marić'}
        className="mt-2 w-full rounded-md border border-cream bg-ivory p-3 font-ui text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-gold"
      />
      <div className="mt-3">
        <PrimaryButton
          disabled={names.length === 0}
          onClick={() => {
            onImport(names)
            setText('')
          }}
        >
          Dodaj {names.length} {names.length === 1 ? 'gosta' : 'gostiju'}
        </PrimaryButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement `src/components/guests/GuestRow.jsx`**

```jsx
import { useState } from 'react'
import { GripVertical, X } from 'lucide-react'

export default function GuestRow({ guest, onRemove, onRename }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(guest.name)

  function commit() {
    setEditing(false)
    if (value.trim() && value.trim() !== guest.name) onRename(guest.id, value.trim())
    else setValue(guest.name)
  }

  return (
    <li className="flex items-center gap-2 border-b border-cream py-2 last:border-b-0">
      <GripVertical size={18} strokeWidth={1.5} className="text-charcoal-soft/50" aria-hidden="true" />
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className="min-h-[44px] flex-1 rounded-md border border-gold px-2 font-ui text-sm text-charcoal"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-h-[44px] flex-1 truncate text-left font-ui text-sm text-charcoal"
        >
          {guest.name}
        </button>
      )}
      <button
        type="button"
        onClick={() => onRemove(guest.id)}
        aria-label={`Ukloni ${guest.name}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-charcoal-soft hover:bg-cream"
      >
        <X size={18} strokeWidth={1.5} />
      </button>
    </li>
  )
}
```

- [ ] **Step 6: Implement `src/components/guests/GuestList.jsx`**

```jsx
import GuestRow from './GuestRow.jsx'

export default function GuestList({ guests, onRemove, onRename }) {
  if (guests.length === 0) {
    return <p className="mt-4 font-ui text-sm text-charcoal-soft">Još nema dodanih gostiju.</p>
  }

  return (
    <ul className="mt-4 rounded-lg bg-white px-4 shadow-card">
      {guests.map((guest) => (
        <GuestRow key={guest.id} guest={guest} onRemove={onRemove} onRename={onRename} />
      ))}
    </ul>
  )
}
```

- [ ] **Step 7: Implement `src/pages/GuestsPage.jsx`**

```jsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import GuestImportTextarea from '../components/guests/GuestImportTextarea.jsx'
import GuestList from '../components/guests/GuestList.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function GuestsPage() {
  const navigate = useNavigate()
  const { draft } = useEventDraft()
  const [guests, setGuests] = useState([])

  const refresh = useCallback(async () => {
    if (!draft.event) return
    setGuests(await repository.getGuests(draft.event.id))
  }, [draft.event])

  useEffect(() => {
    if (!draft.event) {
      navigate('/create/upload', { replace: true })
      return
    }
    refresh()
  }, [draft.event, navigate, refresh])

  if (!draft.event) return null

  async function handleImport(names) {
    await repository.addGuests(draft.event.id, names)
    refresh()
  }

  async function handleRemove(id) {
    await repository.removeGuest(id)
    refresh()
  }

  async function handleRename(id, name) {
    await repository.updateGuest(id, { name })
    refresh()
  }

  return (
    <AppShell>
      <PageHeader title="2. Gosti" step={2} totalSteps={4} onBack={() => navigate('/create/confirm')} />
      <div className="mt-6 space-y-4">
        <GuestImportTextarea onImport={handleImport} />
        <GuestList guests={guests} onRemove={handleRemove} onRename={handleRename} />
        <PrimaryButton disabled={guests.length === 0} onClick={() => navigate('/create/tables')}>
          Nastavi na stolove
        </PrimaryButton>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 8: Wire route in `src/App.jsx`**

Add import and route:

```jsx
<Route path="/create/guests" element={<GuestsPage />} />
```

- [ ] **Step 9: Verify in browser**

Run: `npm run dev`, complete Upload+Confirm, on Guests page paste the 5 example names, tap "Dodaj 5 gostiju"
Expected: list of 5 guests appears; renaming and removing work; "Nastavi na stolove" disabled until ≥1 guest, then navigates to `/create/tables` (blank until Task 12).

- [ ] **Step 10: Commit**

```bash
git add src/data/repository.js src/data/repository.test.js src/components/guests src/pages/GuestsPage.jsx src/App.jsx
git commit -m "feat: implement Guests page with paste-import and inline edit/remove"
```

---

### Task 12: Tables page (`TableCard`, `TableSelectorSheet`)

**Files:**
- Create: `src/components/tables/TableCard.jsx`
- Create: `src/components/tables/TableSelectorSheet.jsx`
- Create: `src/pages/TablesPage.jsx`
- Modify: `src/App.jsx` (add route `/create/tables`)

**Interfaces:**
- Consumes: `repository.addTables`, `repository.getTables`, `repository.getGuests`, `repository.assignGuestToTable`, `BottomSheet`.
- Produces: `<TableCard table assignedCount onClick />` — "Stol N" + "`assignedCount` / `capacity`" occupancy, gold border when full, tap opens nothing itself (selection happens from the guest side per the spec's mobile pattern).
- Produces: `<TableSelectorSheet open guests currentGuest onSelect(tableId) onClose />` — `BottomSheet` listing tables as tappable rows; selecting one calls `onSelect` and closes.
- Produces: route `/create/tables`; guest rows (rendered here, not `GuestRow`, since this list shows a table-assignment chip instead of remove/rename) — tapping a guest opens `TableSelectorSheet`; "+ Dodaj stol" adds a table named `Stol N` (N = next sequential number) with default capacity 8; "Objavi stranicu" is NOT this page's CTA — per the spec, Publish is its own step (Task 13); this page's CTA is "Nastavi na objavu".

- [ ] **Step 1: Implement `src/components/tables/TableCard.jsx`**

```jsx
export default function TableCard({ table, assignedCount }) {
  const full = table.capacity != null && assignedCount >= table.capacity
  return (
    <div className={`rounded-lg bg-white p-4 text-center shadow-card ${full ? 'border-2 border-gold' : 'border border-cream'}`}>
      <p className="font-ui text-sm font-semibold text-charcoal">{table.name}</p>
      <p className="mt-1 font-display text-lg text-gold">
        {assignedCount}
        {table.capacity != null && <span className="text-charcoal-soft"> / {table.capacity}</span>}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Implement `src/components/tables/TableSelectorSheet.jsx`**

```jsx
import BottomSheet from '../common/BottomSheet.jsx'

export default function TableSelectorSheet({ open, onClose, tables, onSelect }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Odaberi stol">
      <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
        {tables.map((table) => (
          <li key={table.id}>
            <button
              type="button"
              onClick={() => onSelect(table.id)}
              className="flex min-h-[52px] w-full items-center justify-between rounded-md px-3 text-left font-ui text-sm text-charcoal hover:bg-cream"
            >
              <span>{table.name}</span>
              {table.capacity != null && <span className="text-charcoal-soft">kapacitet {table.capacity}</span>}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
```

- [ ] **Step 3: Implement `src/pages/TablesPage.jsx`**

```jsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import SecondaryButton from '../components/buttons/SecondaryButton.jsx'
import TableCard from '../components/tables/TableCard.jsx'
import TableSelectorSheet from '../components/tables/TableSelectorSheet.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function TablesPage() {
  const navigate = useNavigate()
  const { draft } = useEventDraft()
  const [tables, setTables] = useState([])
  const [guests, setGuests] = useState([])
  const [activeGuestId, setActiveGuestId] = useState(null)

  const refresh = useCallback(async () => {
    if (!draft.event) return
    const [t, g] = await Promise.all([repository.getTables(draft.event.id), repository.getGuests(draft.event.id)])
    setTables(t)
    setGuests(g)
  }, [draft.event])

  useEffect(() => {
    if (!draft.event) {
      navigate('/create/guests', { replace: true })
      return
    }
    refresh()
  }, [draft.event, navigate, refresh])

  if (!draft.event) return null

  async function addTable() {
    await repository.addTables(draft.event.id, [{ name: `Stol ${tables.length + 1}`, capacity: 8 }])
    refresh()
  }

  async function assign(tableId) {
    await repository.assignGuestToTable(activeGuestId, tableId)
    setActiveGuestId(null)
    refresh()
  }

  function countAt(tableId) {
    return guests.filter((g) => g.tableId === tableId).length
  }

  return (
    <AppShell>
      <PageHeader title="3. Stolovi" step={3} totalSteps={4} onBack={() => navigate('/create/guests')} />

      <div className="mt-6">
        <p className="font-ui text-sm font-semibold text-charcoal-soft">Stolovi</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} assignedCount={countAt(table.id)} />
          ))}
        </div>
        <div className="mt-3">
          <SecondaryButton onClick={addTable} className="!min-h-[44px] justify-start gap-2">
            <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
            Dodaj stol
          </SecondaryButton>
        </div>
      </div>

      <div className="mt-6">
        <p className="font-ui text-sm font-semibold text-charcoal-soft">Gosti</p>
        <ul className="mt-2 rounded-lg bg-white px-4 shadow-card">
          {guests.map((guest) => {
            const table = tables.find((t) => t.id === guest.tableId)
            return (
              <li key={guest.id} className="flex items-center justify-between border-b border-cream py-1 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setActiveGuestId(guest.id)}
                  className="min-h-[44px] flex-1 text-left font-ui text-sm text-charcoal"
                >
                  {guest.name}
                </button>
                {table && (
                  <span className="rounded-pill bg-cream px-3 py-1 font-ui text-xs font-semibold text-gold-deep">
                    {table.name}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-6">
        <PrimaryButton disabled={tables.length === 0} onClick={() => navigate('/create/publish')}>
          Nastavi na objavu
        </PrimaryButton>
      </div>

      <TableSelectorSheet
        open={activeGuestId != null}
        onClose={() => setActiveGuestId(null)}
        tables={tables}
        onSelect={assign}
      />
    </AppShell>
  )
}
```

- [ ] **Step 4: Wire route in `src/App.jsx`**

Add import and route:

```jsx
<Route path="/create/tables" element={<TablesPage />} />
```

- [ ] **Step 5: Verify in browser**

Run: `npm run dev`, complete prior steps, on Tables page tap "Dodaj stol" three times, tap a guest name, select a table in the sheet
Expected: table occupancy count increments; guest row shows a table-name chip; sheet closes on selection; "Nastavi na objavu" navigates to `/create/publish` (blank until Task 13).

- [ ] **Step 6: Commit**

```bash
git add src/components/tables src/pages/TablesPage.jsx src/App.jsx
git commit -m "feat: implement Tables page with bottom-sheet guest assignment"
```

---

### Task 13: Publish page

**Files:**
- Create: `src/pages/PublishPage.jsx`
- Modify: `src/App.jsx` (add route `/create/publish`)

**Interfaces:**
- Consumes: `repository.getGuests`, `repository.getTables`, `repository.getScheduleItems`, `repository.publishEvent`.
- Produces: route `/create/publish` renders event summary (title, formatted date, guest count, table count, distinct location count derived from `scheduleItems`). "Objavi stranicu" calls `repository.publishEvent(event.id)`, updates draft event, then navigates to `/create/share`.

- [ ] **Step 1: Implement `src/pages/PublishPage.jsx`**

```jsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function PublishPage() {
  const navigate = useNavigate()
  const { draft, setEvent } = useEventDraft()
  const [summary, setSummary] = useState(null)

  const refresh = useCallback(async () => {
    if (!draft.event) return
    const [guests, tables, scheduleItems] = await Promise.all([
      repository.getGuests(draft.event.id),
      repository.getTables(draft.event.id),
      repository.getScheduleItems(draft.event.id)
    ])
    const locations = new Set(scheduleItems.map((s) => s.locationName))
    setSummary({ guestCount: guests.length, tableCount: tables.length, locationCount: locations.size })
  }, [draft.event])

  useEffect(() => {
    if (!draft.event) {
      navigate('/create/tables', { replace: true })
      return
    }
    refresh()
  }, [draft.event, navigate, refresh])

  if (!draft.event || !summary) return null

  const displayDate = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(draft.event.date)
  )

  async function publish() {
    const updated = await repository.publishEvent(draft.event.id)
    setEvent(updated)
    navigate('/create/share')
  }

  return (
    <AppShell>
      <PageHeader title="4. Objavi" step={4} totalSteps={4} onBack={() => navigate('/create/tables')} />

      <div className="mt-6 rounded-lg bg-white p-5 shadow-card">
        <p className="font-display text-xl text-charcoal">{draft.event.title}</p>
        <p className="mt-1 font-ui text-sm text-charcoal-soft">{displayDate}</p>
        <dl className="mt-4 space-y-1 font-ui text-sm text-charcoal">
          <div>{summary.guestCount} gosta</div>
          <div>{summary.tableCount} stola</div>
          <div>{summary.locationCount} lokacije</div>
        </dl>
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={publish}>Objavi stranicu</PrimaryButton>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 2: Wire route in `src/App.jsx`**

Add import and route:

```jsx
<Route path="/create/publish" element={<PublishPage />} />
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`, complete prior steps, verify summary numbers match what was entered, tap "Objavi stranicu"
Expected: `localStorage` event's `published` becomes `true`; navigates to `/create/share` (blank until Task 14).

- [ ] **Step 4: Commit**

```bash
git add src/pages/PublishPage.jsx src/App.jsx
git commit -m "feat: implement Publish page with event summary"
```

---

### Task 14: Share page (`ShareLinkCard`, `QRCard`)

**Files:**
- Create: `src/components/share/ShareLinkCard.jsx`
- Create: `src/components/share/QRCard.jsx`
- Create: `src/pages/SharePage.jsx`
- Modify: `src/App.jsx` (add route `/create/share`)

**Interfaces:**
- Consumes: `qrcode` npm package (`QRCode.toDataURL`), `useToast`.
- Produces: `<ShareLinkCard url />` — displays the public URL, "Kopiraj link" (clipboard API + toast "Link kopiran"), "Pošalji na WhatsApp" (`https://wa.me/?text=` deep link opened in a new tab).
- Produces: `<QRCard url />` — renders a client-side generated QR `<img>` (data URL) + "Preuzmi QR" download link (`download` attribute).
- Produces: route `/create/share` renders success icon, headline "Stranica je spremna", description, `ShareLinkCard`, `QRCard`; the public URL is `${window.location.origin}/e/${draft.event.slug}`.

- [ ] **Step 1: Implement `src/components/share/ShareLinkCard.jsx`**

```jsx
import { Copy, MessageCircle } from 'lucide-react'
import { useToast } from '../common/Toast.jsx'

export default function ShareLinkCard({ url }) {
  const { showToast } = useToast()

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    showToast('Link kopiran')
  }

  const waHref = `https://wa.me/?text=${encodeURIComponent(url)}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-card">
        <span className="truncate font-ui text-sm text-charcoal">{url.replace(/^https?:\/\//, '')}</span>
      </div>

      <button
        type="button"
        onClick={copyLink}
        className="flex min-h-[52px] w-full items-center gap-3 rounded-md bg-cream px-4 font-ui text-sm font-semibold text-charcoal"
      >
        <Copy size={18} strokeWidth={1.5} aria-hidden="true" />
        Kopiraj link
      </button>

      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-[52px] w-full items-center gap-3 rounded-md bg-whatsapp/15 px-4 font-ui text-sm font-semibold text-charcoal"
      >
        <MessageCircle size={18} strokeWidth={1.5} className="text-whatsapp" aria-hidden="true" />
        Pošalji na WhatsApp
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Implement `src/components/share/QRCard.jsx`**

```jsx
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { QrCode } from 'lucide-react'

export default function QRCard({ url }) {
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, { margin: 1, width: 480, color: { dark: '#2B2420', light: '#FFFFFF' } }).then((d) => {
      if (!cancelled) setDataUrl(d)
    })
    return () => {
      cancelled = true
    }
  }, [url])

  return (
    <div className="rounded-lg bg-white p-4 text-center shadow-card">
      {dataUrl ? (
        <img src={dataUrl} alt="QR kod za stranicu događaja" className="mx-auto w-48" />
      ) : (
        <div className="mx-auto h-48 w-48 animate-pulse rounded-md bg-cream" />
      )}
      {dataUrl && (
        <a
          href={dataUrl}
          download="gdjesjedim-qr.png"
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 font-ui text-sm font-semibold text-gold-deep"
        >
          <QrCode size={18} strokeWidth={1.5} aria-hidden="true" />
          Preuzmi QR
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement `src/pages/SharePage.jsx`**

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import ShareLinkCard from '../components/share/ShareLinkCard.jsx'
import QRCard from '../components/share/QRCard.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'

export default function SharePage() {
  const navigate = useNavigate()
  const { draft } = useEventDraft()

  useEffect(() => {
    if (!draft.event?.published) navigate('/create/publish', { replace: true })
  }, [draft.event, navigate])

  if (!draft.event?.published) return null

  const url = `${window.location.origin}/e/${draft.event.slug}`

  return (
    <AppShell>
      <div className="flex flex-col items-center pt-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-pill bg-blush-soft">
          <PartyPopper size={28} strokeWidth={1.5} className="text-blush" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl text-charcoal">Stranica je spremna</h1>
        <p className="mt-2 font-ui text-sm leading-relaxed text-charcoal-soft">
          Podijelite link s gostima kako bi mogli pronaći svoj stol i raspored.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <ShareLinkCard url={url} />
        <QRCard url={url} />
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 4: Wire route in `src/App.jsx`**

Add import and route:

```jsx
<Route path="/create/share" element={<SharePage />} />
```

- [ ] **Step 5: Verify in browser**

Run: `npm run dev`, complete Publish step
Expected: Share page shows success icon, headline, public URL, working "Kopiraj link" (toast appears), WhatsApp link opens `wa.me` in a new tab, QR image renders and "Preuzmi QR" downloads a PNG.

- [ ] **Step 6: Commit**

```bash
git add src/components/share src/pages/SharePage.jsx src/App.jsx
git commit -m "feat: implement Share page with copy link, WhatsApp, and QR"
```

---

### Task 15: Public guest page (search + result + schedule)

**Files:**
- Create: `src/components/guestpage/SearchGuestCard.jsx`
- Create: `src/components/guestpage/TableResultCard.jsx`
- Create: `src/components/guestpage/ScheduleRow.jsx`
- Create: `src/pages/PublicEventPage.jsx`
- Modify: `src/App.jsx` (add route `/e/:slug`)

**Interfaces:**
- Consumes: `repository.getEventBySlug`, `repository.getScheduleItems`, `repository.searchGuest`.
- Produces: `<SearchGuestCard onSearch(query) result loading />` — "Gdje sjedim?" heading, name input (label "Upiši svoje ime"), "Pronađi moj stol" button (blush background per spec), shows "Gost nije pronađen. Provjeri je li ime upisano ispravno." when a search returns no match.
- Produces: `<TableResultCard tableName />` — large serif "STOL {N}" reveal with a `framer-motion` entrance animation, subtle static confetti dots (CSS, not JS-animated) around it, celebratory copy.
- Produces: `<ScheduleRow time title locationName address? />` — row with time/title/location + a maps link/icon button (opens `https://www.google.com/maps/search/?api=1&query=` + encoded `address ?? locationName` in a new tab).
- Produces: route `/e/:slug`; loads the event by slug (404-style "Stranica nije pronađena" message if missing); renders header (title + formatted date), `SearchGuestCard`; on search, calls `repository.searchGuest(slug, query)`; on a match, renders `TableResultCard` + "Raspored događaja" list of `ScheduleRow` (loaded once via `repository.getScheduleItems(event.id)`, this is public schedule data, not guest data, so it's safe to fetch upfront).

- [ ] **Step 1: Implement `src/components/guestpage/ScheduleRow.jsx`**

```jsx
import { MapPin } from 'lucide-react'

export default function ScheduleRow({ time, title, locationName, address }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? locationName)}`

  return (
    <li className="flex items-center justify-between border-b border-cream py-3 last:border-b-0">
      <div>
        <p className="font-ui text-sm font-semibold text-charcoal">
          {time} · {title}
        </p>
        <p className="font-ui text-sm text-charcoal-soft">{locationName}</p>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Otvori lokaciju ${locationName} na karti`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gold hover:bg-cream"
      >
        <MapPin size={20} strokeWidth={1.5} />
      </a>
    </li>
  )
}
```

- [ ] **Step 2: Implement `src/components/guestpage/TableResultCard.jsx`**

```jsx
import { motion } from 'framer-motion'

const CONFETTI = [
  { top: '8%', left: '12%', color: '#E7A9AE' },
  { top: '15%', left: '78%', color: '#C79A4B' },
  { top: '75%', left: '18%', color: '#C79A4B' },
  { top: '80%', left: '82%', color: '#E7A9AE' },
  { top: '10%', left: '45%', color: '#C79A4B' }
]

export default function TableResultCard({ tableName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-lg bg-blush-soft p-6 text-center shadow-elevated"
    >
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ top: c.top, left: c.left, backgroundColor: c.color }}
          className="absolute h-2 w-2 rounded-pill opacity-70"
        />
      ))}
      <p className="relative font-ui text-sm text-charcoal-soft">Tvoje mjesto je:</p>
      <p className="relative mt-1 font-display text-5xl text-gold-deep">{tableName.toUpperCase()}</p>
      <p className="relative mt-2 font-ui text-sm text-charcoal">Vidimo se na proslavi! 🎉</p>
    </motion.div>
  )
}
```

- [ ] **Step 3: Implement `src/components/guestpage/SearchGuestCard.jsx`**

```jsx
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchGuestCard({ onSearch, notFound }) {
  const [query, setQuery] = useState('')

  function submit(e) {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <form onSubmit={submit} className="rounded-lg bg-white p-5 text-center shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-cream">
        <Search size={22} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
      </div>
      <h2 className="mt-3 font-display text-2xl text-charcoal">Gdje sjedim?</h2>

      <label htmlFor="guest-name" className="sr-only">
        Upiši svoje ime
      </label>
      <input
        id="guest-name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Upiši svoje ime"
        className="mt-4 w-full rounded-md border border-cream bg-ivory px-4 py-3 text-center font-ui text-base text-charcoal placeholder:text-charcoal-soft/70 focus:border-gold"
      />

      <button
        type="submit"
        className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-md bg-blush px-6 font-ui text-base font-semibold text-white"
      >
        Pronađi moj stol
      </button>

      {notFound && (
        <p role="alert" className="mt-3 font-ui text-sm text-charcoal-soft">
          Gost nije pronađen. Provjeri je li ime upisano ispravno.
        </p>
      )}
    </form>
  )
}
```

- [ ] **Step 4: Implement `src/pages/PublicEventPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import SearchGuestCard from '../components/guestpage/SearchGuestCard.jsx'
import TableResultCard from '../components/guestpage/TableResultCard.jsx'
import ScheduleRow from '../components/guestpage/ScheduleRow.jsx'
import repository from '../data/repositoryInstance.js'

export default function PublicEventPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(undefined)
  const [scheduleItems, setScheduleItems] = useState([])
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const found = await repository.getEventBySlug(slug)
      setEvent(found ?? null)
      if (found) setScheduleItems(await repository.getScheduleItems(found.id))
    }
    load()
  }, [slug])

  async function handleSearch(query) {
    const found = await repository.searchGuest(slug, query)
    if (found && found.table) {
      setResult(found)
      setNotFound(false)
    } else {
      setResult(null)
      setNotFound(true)
    }
  }

  if (event === undefined) return null

  if (event === null) {
    return (
      <AppShell>
        <p className="mt-10 text-center font-ui text-base text-charcoal-soft">Stranica nije pronađena.</p>
      </AppShell>
    )
  }

  const displayDate = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(event.date)
  )

  return (
    <AppShell>
      <div className="text-center">
        <h1 className="font-display text-2xl text-charcoal">{event.title}</h1>
        <p className="mt-1 font-ui text-sm text-charcoal-soft">{displayDate}</p>
      </div>

      <div className="mt-6">
        <SearchGuestCard onSearch={handleSearch} notFound={notFound} />
      </div>

      {result && (
        <div className="mt-6">
          <TableResultCard tableName={result.table.name} />
        </div>
      )}

      {scheduleItems.length > 0 && (
        <div className="mt-6">
          <p className="font-ui text-sm font-semibold text-charcoal-soft">Raspored događaja</p>
          <ul className="mt-2 rounded-lg bg-white px-4 shadow-card">
            {scheduleItems.map((item) => (
              <ScheduleRow key={item.id} {...item} />
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  )
}
```

- [ ] **Step 5: Wire route in `src/App.jsx`**

Add import and route:

```jsx
<Route path="/e/:slug" element={<PublicEventPage />} />
```

- [ ] **Step 6: Verify in browser**

Run: `npm run dev`, after publishing an event, open `/e/marijino-krstenje` directly, search "ivan gorupić" (lowercase), "IVAN GORUPIĆ", and "Ivan"
Expected: all three return the same guest's assigned table in a `TableResultCard`; an unmatched name shows the not-found message; schedule rows render below with working maps links; a nonexistent slug shows "Stranica nije pronađena."

- [ ] **Step 7: Commit**

```bash
git add src/components/guestpage src/pages/PublicEventPage.jsx src/App.jsx
git commit -m "feat: implement public guest page with tolerant search and table result"
```

---

### Task 16: PWA icons, manifest wiring, and service worker verification

**Files:**
- Create: `scripts/generate-pwa-icons.mjs`
- Create (generated by script, then committed): `public/icons/icon.svg`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`

**Interfaces:**
- Produces: a dependency-free Node script that writes a flat gold-circle-on-ivory PNG icon at 192×192 and 512×512 (plus a maskable variant with extra padding) using only `node:zlib` for the PNG IDAT deflate — no image libraries, no ImageGen.
- Produces: `public/icons/icon.svg` — simple inline SVG (gold circle + simplified chair glyph) matching `index.html`'s `<link rel="icon">`.

- [ ] **Step 1: Create `public/icons/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#FAF4EA" />
  <circle cx="32" cy="32" r="22" fill="#C79A4B" />
  <path d="M22 20 h20 v14 a10 10 0 0 1 -20 0 Z M22 40 v10 M42 40 v10" stroke="#FAF4EA" stroke-width="3" fill="none" stroke-linecap="round" />
</svg>
```

- [ ] **Step 2: Create `scripts/generate-pwa-icons.mjs`**

```js
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

function crc32(buf) {
  let c
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[n] = c
    }
    return t
  })())
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function buildPng(size, padding) {
  const ivory = [0xfa, 0xf4, 0xea]
  const gold = [0xc7, 0x9a, 0x4b]
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - padding

  const raw = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 3 + 1)
    raw[rowStart] = 0
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const inCircle = dx * dx + dy * dy <= r * r
      const [rr, gg, bb] = inCircle ? gold : ivory
      const px = rowStart + 1 + x * 3
      raw[px] = rr
      raw[px + 1] = gg
      raw[px + 2] = bb
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const idat = deflateSync(raw)

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', buildPng(192, 20))
writeFileSync('public/icons/icon-512.png', buildPng(512, 54))
writeFileSync('public/icons/icon-maskable-512.png', buildPng(512, 100))

console.log('Generated PWA icons in public/icons/')
```

- [ ] **Step 3: Run the script**

Run: `node scripts/generate-pwa-icons.mjs`
Expected: `Generated PWA icons in public/icons/` printed; three PNG files exist in `public/icons/`.

- [ ] **Step 4: Verify PNGs are valid**

Run: `node -e "const fs=require('fs'); const b=fs.readFileSync('public/icons/icon-192.png'); console.log(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))"`
Expected: prints `true`.

- [ ] **Step 5: Verify PWA build output**

Run: `npm run build`
Expected: build succeeds; `dist/manifest.webmanifest` (or equivalent generated manifest) references the three icon files; a service worker file is emitted in `dist/`.

- [ ] **Step 6: Commit**

```bash
git add public/icons scripts/generate-pwa-icons.mjs
git commit -m "feat: generate dependency-free PWA icons and verify manifest build"
```

---

### Task 17: Playwright config and happy-path e2e test

**Files:**
- Create: `playwright.config.js`
- Create: `e2e/happy-path.spec.js`
- Create: `e2e/guest-search-variants.spec.js`

**Interfaces:**
- Consumes: all pages/routes from Tasks 8–15.
- Produces: `playwright.config.js` — `testDir: 'e2e'`, `webServer` running `npm run dev` on port 5173, default viewport 390×844 (`devices` not required — set `viewport` directly), `baseURL: 'http://localhost:5173'`.
- Produces: `e2e/happy-path.spec.js` — full flow from the design spec section 25, asserting "STOL 3" is visible at the end.
- Produces: `e2e/guest-search-variants.spec.js` — same publish setup, three searches (`ivan gorupić`, `IVAN GORUPIĆ`, `Ivan`) each asserting "STOL 3".

- [ ] **Step 1: Create `playwright.config.js`**

```js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 390, height: 844 },
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 30000
  }
})
```

- [ ] **Step 2: Write `e2e/happy-path.spec.js`**

```js
import { test, expect } from '@playwright/test'

async function publishMarijinoKrstenje(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Napravi besplatno' }).click()
  // Navigate back to landing to pick a type explicitly, then continue.
  await page.goto('/')
  await page.getByRole('button', { name: 'Krštenje' }).click()
  await page.getByRole('button', { name: 'Napravi besplatno' }).click()

  await expect(page).toHaveURL(/\/create\/upload/)
  await page.getByRole('button', { name: 'Učitaj pozivnicu' }).click()
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByText('PNG, JPG ili PDF').click()
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
  await expect(page.getByText('Stol 3')).toBeVisible()
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
```

- [ ] **Step 3: Write `e2e/guest-search-variants.spec.js`**

```js
import { test, expect } from '@playwright/test'

const VARIANTS = ['ivan gorupić', 'IVAN GORUPIĆ', 'Ivan']

for (const query of VARIANTS) {
  test(`guest search tolerates "${query}"`, async ({ page }) => {
    // Reuses the event published by happy-path.spec.js in the same localStorage-backed
    // dev server instance. Playwright's default storageState is shared per browser context
    // within a single run only when tests execute against the same origin/session; to keep
    // this test independently runnable, it re-publishes the event via the UI.
    await page.goto('/')
    await page.getByRole('button', { name: 'Krštenje' }).click()
    await page.getByRole('button', { name: 'Napravi besplatno' }).click()
    await page.getByRole('button', { name: 'Učitaj pozivnicu' }).click()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByText('PNG, JPG ili PDF').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({ name: 'invite.png', mimeType: 'image/png', buffer: Buffer.from('fake') })
    await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
    await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
    await page.locator('#guest-list').fill('Ivan Gorupić')
    await page.getByRole('button', { name: /Dodaj 1 gosta/ }).click()
    await page.getByRole('button', { name: 'Nastavi na stolove' }).click()
    await page.getByRole('button', { name: 'Dodaj stol' }).click()
    await page.getByRole('button', { name: 'Ivan Gorupić' }).click()
    await page.getByRole('dialog', { name: 'Odaberi stol' }).getByText('Stol 1').click()
    await page.getByRole('button', { name: 'Nastavi na objavu' }).click()
    await page.getByRole('button', { name: 'Objavi stranicu' }).click()

    const slugText = await page.getByText(/\/marijino-krstenje/).textContent()
    const slug = slugText.trim().split('/').pop()

    await page.goto(`/e/${slug}`)
    await page.getByLabel('Upiši svoje ime').fill(query)
    await page.getByRole('button', { name: 'Pronađi moj stol' }).click()
    await expect(page.getByText('STOL 1')).toBeVisible()
  })
}
```

- [ ] **Step 4: Run the e2e suite**

Run: `npm run test:e2e`
Expected: all tests pass. If a selector mismatch surfaces (e.g. accessible name differs from what a component actually renders), fix the component's markup or the test's selector — do not weaken the assertion.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.js e2e
git commit -m "test: add Playwright happy-path and guest-search-variant e2e tests"
```

---

### Task 18: Visual QA screenshots across viewports

**Files:**
- Create: `e2e/visual-qa.spec.js`

**Interfaces:**
- Consumes: same page flow as Task 17.
- Produces: `screenshots/01-landing.png` through `screenshots/08-guest-result.png` at 390×844 (primary), plus a second pass reusing the same spec with `--project` viewport overrides for 375×812 and 430×932 (see Step 3).

- [ ] **Step 1: Write `e2e/visual-qa.spec.js`**

```js
import { test } from '@playwright/test'

test('capture all 8 primary screens', async ({ page }) => {
  await page.goto('/')
  await page.screenshot({ path: 'screenshots/01-landing.png' })

  await page.getByRole('button', { name: 'Krštenje' }).click()
  await page.getByRole('button', { name: 'Napravi besplatno' }).click()
  await page.screenshot({ path: 'screenshots/02-upload.png' })

  await page.getByRole('button', { name: 'Učitaj pozivnicu' }).click()
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByText('PNG, JPG ili PDF').click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({ name: 'invite.png', mimeType: 'image/png', buffer: Buffer.from('fake') })
  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()
  await page.getByRole('button', { name: 'Potvrdi podatke' }).click()

  await page.locator('#guest-list').fill('Ivan Gorupić\nAna Gorupić\nMarko Horvat\nIvana Horvat\nPetar Marić')
  await page.getByRole('button', { name: /Dodaj 5 gostiju/ }).click()
  await page.screenshot({ path: 'screenshots/03-guests.png' })
  await page.getByRole('button', { name: 'Nastavi na stolove' }).click()

  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Dodaj stol' }).click()
  await page.getByRole('button', { name: 'Ivan Gorupić' }).click()
  await page.getByRole('dialog', { name: 'Odaberi stol' }).getByText('Stol 3').click()
  await page.screenshot({ path: 'screenshots/04-tables.png' })
  await page.getByRole('button', { name: 'Nastavi na objavu' }).click()

  await page.screenshot({ path: 'screenshots/05-publish.png' })
  await page.getByRole('button', { name: 'Objavi stranicu' }).click()
  await page.screenshot({ path: 'screenshots/06-share.png' })

  const slugText = await page.getByText(/\/marijino-krstenje/).textContent()
  const slug = slugText.trim().split('/').pop()

  await page.goto(`/e/${slug}`)
  await page.screenshot({ path: 'screenshots/07-guest-search.png' })
  await page.getByLabel('Upiši svoje ime').fill('Ivan Gorupić')
  await page.getByRole('button', { name: 'Pronađi moj stol' }).click()
  await page.screenshot({ path: 'screenshots/08-guest-result.png' })
})
```

- [ ] **Step 2: Run at the primary 390×844 viewport**

Run: `npx playwright test e2e/visual-qa.spec.js`
Expected: 8 PNG files created under `screenshots/`, test passes.

- [ ] **Step 3: Re-run at 375×812 and 430×932 for responsive spot-checks**

Run:
```bash
npx playwright test e2e/visual-qa.spec.js --use='{"viewport":{"width":375,"height":812}}'
npx playwright test e2e/visual-qa.spec.js --use='{"viewport":{"width":430,"height":932}}'
```
Expected: both runs pass with no horizontal-scroll layout breaks (visually confirm no clipped content in the resulting screenshots — Playwright overwrites the same filenames, so inspect each run's output before the next overwrites it, or temporarily redirect to `screenshots/375/` and `screenshots/430/` subfolders by editing the paths for this manual check only).

- [ ] **Step 4: Manually review all 8 screenshots against `flow.png`**

Open `screenshots/01-landing.png` through `screenshots/08-guest-result.png` side by side with `flow.png` and check: proportions, whitespace, typography weight, CTA prominence, card styling, background tone, corner radii, shadow strength, overall visual density. Note concrete deltas (e.g., "CTA gold is too pale", "cards need more spacing between them") — these become fix-up commits before Task 19.

- [ ] **Step 5: Apply any deltas found and re-run Step 2**

If Step 4 found deltas, fix the relevant component/token file, re-run Step 2 (or the whole `npm run test:e2e` suite if a fix touched shared components), and re-review the regenerated screenshots. Repeat until no meaningful delta remains against `flow.png`.

- [ ] **Step 6: Commit**

```bash
git add e2e/visual-qa.spec.js
git commit -m "test: add Playwright visual QA screenshot capture across all 8 screens"
```

(Screenshots themselves are gitignored per Task 1's `.gitignore` — they're a QA artifact, not a build output. If the reviewer wants them archived, `git add -f screenshots/` before committing.)

---

### Task 19: Impeccable UI/UX audit pass

**Files:**
- Modify: any component/page file flagged by the audit (exact files depend on findings — see Step 2).

**Interfaces:**
- Consumes: the running dev server (`npm run dev`) and the screenshots from Task 18.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (leave running)

- [ ] **Step 2: Invoke the Impeccable skill against the full flow**

Run the `impeccable` skill against these routes at 390×844, using the checklist from design spec section 27 as the explicit audit brief: `/`, `/create/upload`, `/create/confirm`, `/create/guests`, `/create/tables`, `/create/publish`, `/create/share`, `/e/marijino-krstenje` (both pre-search and post-search states). Ask it to check specifically for: inconsistent spacing, weak visual hierarchy, generic-SaaS appearance, excess borders/cards, sub-44px tap targets, weak typographic hierarchy, inconsistent radii, unnatural shadows, inconsistent icon treatment, and any rough mobile-flow transitions — and to answer the six yes/no questions in spec section 27 (landing CTA obvious in <2s, upload clarity, 30-guest paste flow, touch table-assignment intuitiveness, one-tap share, senior-friendly guest search).

- [ ] **Step 3: Apply every finding that doesn't violate Global Constraints**

For each finding, edit the flagged component/page file directly. Stay within the fixed design tokens (Task 1) — if a finding suggests a new color/radius/shadow value, adjust the token in `src/styles/index.css` instead of hardcoding a one-off value, and update every consumer.

- [ ] **Step 4: Re-run the full verification loop**

Run: `npm run test:unit && npm run test:e2e`
Expected: all tests still pass after the audit fixes (fix any selector breakage caused by copy/markup changes).

- [ ] **Step 5: Re-run visual QA screenshots**

Run: `npx playwright test e2e/visual-qa.spec.js`
Expected: `screenshots/01-landing.png` … `screenshots/08-guest-result.png` regenerated; re-compare against `flow.png` per Task 18 Step 4 — confirm the audit's changes measurably closed the gap.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: apply Impeccable UI/UX audit findings across wizard and guest page"
```

---

### Task 20: Final verification pass (Definition of Done)

**Files:**
- None created; this task only verifies and, if needed, patches issues found.

**Interfaces:**
- Consumes: the entire app.

- [ ] **Step 1: Full automated verification**

Run: `npm run test:unit && npm run test:e2e && npm run build`
Expected: all pass, build succeeds with zero warnings about missing assets.

- [ ] **Step 2: Console error check**

Run: `npm run dev`, then in Playwright or a manual browser pass, visit every route (`/`, all `/create/*` steps, `/e/marijino-krstenje`) and confirm the browser console has zero errors. If any appear, fix the root cause (not a console.error suppression) and re-verify.

- [ ] **Step 3: Horizontal scroll check at all 3 viewports**

For each of 375×812, 390×844, 430×932, confirm `document.documentElement.scrollWidth <= document.documentElement.clientWidth` on every route (can be scripted as a quick Playwright assertion appended temporarily, or checked via DevTools). Fix any overflow found (usually a missing `min-w-0` on a flex child or an un-wrapped long string).

- [ ] **Step 4: Cross-check the Definition of Done list**

Go through design spec section "Final Definition of Done" line by line (end-to-end flow, mobile-first, reference visual direction preserved, Playwright happy path passes, screenshots look polished, Impeccable pass done, PWA works, no console errors, no horizontal scroll, no broken states, correct Croatian text, guest flow needs no login, search returns the right table, UI presentable to a real user). Note any remaining gap explicitly rather than silently marking done.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass for GdjeSjedim.hr MVP"
```

---

## Self-Review Notes

- **Spec coverage:** all 30 spec sections map to a task — design system → Task 1, upload/extraction → Tasks 9–10, guests → Task 11, tables → Task 12, publish/share → Tasks 13–14, public guest page/result/schedule → Task 15, components list → Tasks 5–15 collectively, data model → Task 3, persistence (frontend-only, repository-abstracted) → Task 3, PWA → Task 16, accessibility → enforced as a Global Constraint and spot-checked in Task 20, animation → `framer-motion` usage throughout with 150–300ms durations, ImageGen rule → explicitly deviated per user's approved answer (SVG/CSS composition instead), Playwright acceptance flow → Task 17, visual QA → Task 18, Impeccable final review → Task 19, Definition of Done → Task 20.
- **Type consistency:** `EventsRepository` method names/signatures introduced in Task 3 (`getEventBySlug`, `addGuests`, `assignGuestToTable`, `searchGuest`, etc., plus `removeGuest` added in Task 11) are used identically in every consuming page task (9, 10, 11, 12, 13, 14, 15). `useEventDraft()`'s `draft` shape (`{ event, extractedData, guests, tables }`) and setters (`setEvent`, `setExtractedData`) match between Task 4's definition and every page that calls them.
- **No placeholders:** every step contains complete, runnable code; no "TODO"/"similar to Task N" shortcuts remain other than the intentionally open-ended audit findings in Task 19, which is a legitimate review-and-fix task, not a deferred implementation detail.
