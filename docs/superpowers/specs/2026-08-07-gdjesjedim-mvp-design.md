# GdjeSjedim.hr — Mobile-first MVP — Design Spec

Date: 2026-08-07
Status: Approved for implementation planning

## 1. Product principle

GdjeSjedim.hr nije event management platforma. Core promise:

> Učitaj pozivnicu. Dodaj goste. Rasporedi stolove. Pošalji jedan link.

Gost: Otvori link → upiši ime → sazna svoj stol.

V0.1 scope je namjerno malen: invitation + guests + tables + schedule + share
link + find-my-table. Bez accounts/passwords/RSVP/budgeting/vendors/chat/
gallery/music/seat-by-seat chairs/payments/email campaigns/complex
themes/analytics.

## 2. Reference image

`flow.png` (priložen u projektu) je vizualni north star. Prikazuje 5 mobilnih
ekrana: Landing, Upload pozivnice, Gosti i stolovi (kombinirano u referenci,
mi ih dijelimo na dva koraka po tvojoj spec-i u sekcijama 10/11), Guest
search + rezultat, Share/success.

## 3. Design system (izvučen iz reference)

```
colors:
  ivory:        #FAF4EA   background
  cream:        #F3E9D9   secondary surface / input bg
  gold:         #C79A4B   primary accent, CTA
  goldDeep:     #A87F3A   hover/pressed
  charcoal:     #2B2420   primary text
  charcoalSoft: #6B5F55   secondary text
  blush:        #E7A9AE   guest-result accent, search CTA
  blushSoft:    #F7E3E1   guest-result background wash
  white:        #FFFFFF
  success/whatsapp: #25D366 (samo za WhatsApp share pill)

typography:
  display: "DM Serif Display" — H1/H2, "STOL 3", event title, "Gdje sjedim?"
  ui: "Inter" — body, labels, buttons, form inputs
  max 2 font families total.

radii:
  sm: 10px   — chips, small inputs
  md: 16px   — buttons, form fields
  lg: 22px   — cards, upload zona, bottom sheet top corners
  pill: 999px — stepper dots, landing CTA, filter-like chips

spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 (Tailwind default aligns closely)

shadows:
  card:     0 2px 10px rgba(43,36,32,0.06)
  elevated: 0 8px 24px rgba(43,36,32,0.10)

icons: lucide-react, thin stroke (1.5px), gold or charcoal, no filled icons
except inside colored circle badges (e.g. success icon).

motion: 150–300ms ease-out; entrance/press/reveal only; respects
prefers-reduced-motion.
```

Tailwind v4 `@theme` block encodes these tokens directly (no separate JS
theme file needed at this scale).

## 4. Tech stack & architecture

- Vite + React 19 + JavaScript (no TS), Tailwind v4, `react-router-dom`,
  `framer-motion`, `lucide-react`, `qrcode` (client-side QR generation),
  `vite-plugin-pwa`. Matches existing Nepar project conventions.
- Standalone project at `c:\GdjeSjedim`, not nested under Nepar.
- **Repository abstraction** — `src/data/repository.js` defines an
  `EventsRepository` interface: `createEvent`, `getEvent(id)`,
  `getEventBySlug(slug)`, `updateEvent`, `addScheduleItems`, `addTables`,
  `addGuests`, `updateGuest`, `assignGuestToTable`, `publishEvent`,
  `searchGuest(slug, query)`. MVP ships `LocalRepository` (localStorage,
  JSON-serialized). Public guest search still goes through the same
  interface so it can later hit a real Cloudflare Pages Function without UI
  changes. `searchGuest` is the only method the public page may call
  directly — it must never expose the full guest list to guest-facing code.
- Routing: `/` (landing), `/create/:step` (wizard, step = upload | confirm |
  guests | tables | publish | share), `/e/:slug` (public guest page).
- Wizard state: single `EventDraftContext` (reducer) seeded on `/create`
  entry, persisted to the repository incrementally as steps complete, so a
  refresh mid-wizard doesn't lose progress.
- No backend call is required to complete the full happy path in dev/test —
  everything works against `LocalRepository` in the browser. Cloudflare
  D1/R2/Pages Functions integration is a future swap of the repository
  implementation only (out of scope for this spec/plan).

## 5. Data model

```js
// Event
{ id, slug, title, type: "christening"|"wedding"|"birthday"|"communion"|"other",
  date, invitationUrl, published }

// ScheduleItem
{ id, eventId, time, title, locationName, address }

// Table
{ id, eventId, name, capacity }

// Guest
{ id, eventId, name, normalizedName, tableId }
```

`normalizedName`: lowercase + strip Croatian diacritics (č/ć/š/đ/ž → c/c/s/d/z)
for tolerant search (case-insensitive, diacritic-insensitive, partial match).

## 6. Screens (routes)

1. **Landing** (`/`) — logo, hero, description, primary CTA, 4 event-type
   cards, subtle botanical footer motif.
2. **Upload** (`/create/upload`) — step 1/4, upload zone (PNG/JPG/PDF),
   preview after upload (demo invitation is an SVG/HTML composition, not a
   generated image — ImageGen unavailable in this environment).
3. **Confirm extracted data** (`/create/confirm`) — mocked AI-extraction
   result card + "Potvrdi podatke" / "Promijeni".
4. **Guests** (`/create/guests`) — step 2/4, paste-list textarea → parse →
   editable guest list (drag handle, remove/edit), "Nastavi na stolove".
5. **Tables** (`/create/tables`) — step 3/4, add tables, tap-guest →
   bottom-sheet table picker (no native HTML5 drag-and-drop on touch),
   assigned guest shows a table chip.
6. **Publish** (`/create/publish`) — step 4/4, summary, "Objavi stranicu".
7. **Share** (`/create/share`) — success state, public link, copy /
   WhatsApp / QR (client-side generated).
8. **Public guest page** (`/e/:slug`) — event header, "Gdje sjedim?" search
   card, tolerant name search.
9. **Guest result** (same route, post-search state) — "STOL 3" hero reveal
   + event schedule with tap-to-open maps links.

## 7. Components (reused across screens)

`AppShell`, `PageHeader`, `StepIndicator`, `PrimaryButton`, `SecondaryButton`,
`EventTypeCard`, `InvitationUploader`, `InvitationPreview`,
`ExtractedDataCard`, `GuestList`, `GuestRow`, `GuestImportTextarea`,
`TableCard`, `TableSelectorSheet`, `ScheduleItem`, `SearchGuestCard`,
`TableResultCard`, `ShareLinkCard`, `QRCard`, `BottomSheet`, `Toast`.

## 8. Accessibility & quality bar

44px min touch targets, semantic buttons/labels, visible focus rings,
sufficient contrast against ivory background, keyboard operability,
`prefers-reduced-motion` support, no horizontal scroll at 375/390/430px
widths, no console errors.

## 9. Testing & QA plan

- Playwright happy path (landing → create → Krštenje → upload → confirm →
  paste 5 guests → create 3 tables → assign Ivan Gorupić → Stol 3 → publish
  → open `/e/:slug` → search "ivan gorupić" / "IVAN GORUPIĆ" / "Ivan" → each
  verifies "STOL 3").
- Screenshots at 390×844 (primary) + 375×812 + 430×932, saved under
  `screenshots/`: `01-landing.png` … `08-guest-result.png`.
- Iterative reference-comparison loop (Phase C/D from the brief) before and
  after an Impeccable audit pass (Phase E) — not a single-pass build.
- Final Impeccable pass against the checklist in spec section 27
  (landing CTA clarity, upload clarity, 30-guest paste flow, touch table
  assignment, one-tap share, senior-friendly guest search).

## 10. PWA

`vite-plugin-pwa`: manifest (name, short_name "GdjeSjedim", icons,
`theme_color: #C79A4B`, `background_color: #FAF4EA`, `display: standalone`),
generated icon set, basic service worker (precache shell). No aggressive
install prompt.

## 11. Explicitly out of scope (V0.1)

Accounts/auth, RSVP, budgeting, vendors, chat, photo gallery, music,
seat-by-seat chairs, payments, email campaigns, complex themes, analytics
dashboard, real Cloudflare persistence wiring, real AI vision extraction
endpoint (architecture allows a later swap; not built now).
