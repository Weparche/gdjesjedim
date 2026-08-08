import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchGuestCard({ onSearch, status, guestName }) {
  const [query, setQuery] = useState('')

  function submit(e) {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <form onSubmit={submit} className="rounded-lg bg-white p-5 text-center shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-cream">
        <Search size={22} strokeWidth={1.5} className="text-gold-deep" aria-hidden="true" />
      </div>
      <h2 className="mt-3 font-display text-2xl text-charcoal">Gdje sjedim?</h2>

      {/* Label is visible, not sr-only: on the guest-facing surface the only
          affordance used to be a low-contrast placeholder that vanished on the
          first keystroke. */}
      <label
        htmlFor="guest-name"
        className="mt-4 block text-left font-ui text-sm font-medium text-charcoal-soft"
      >
        Upiši svoje ime
      </label>

      <div className="relative mt-1">
        <input
          id="guest-name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="name"
          placeholder="npr. Ivan Gorupić"
          className="w-full rounded-md border border-cream bg-ivory py-3 pl-4 pr-12 font-ui text-lg text-charcoal placeholder:text-charcoal-soft focus:border-gold"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Očisti polje"
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill text-charcoal-soft hover:bg-cream"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={!query.trim()}
        className="mt-3 inline-flex min-h-[56px] w-full items-center justify-center rounded-md bg-blush px-6 font-ui text-lg font-semibold text-white transition-colors disabled:bg-cream disabled:text-charcoal-soft disabled:pointer-events-none"
      >
        Pronađi moj stol
      </button>

      {status === 'notFound' && (
        <p role="alert" className="mt-3 font-ui text-base text-charcoal">
          Nismo pronašli to ime. Provjeri je li upisano ispravno, ili pitaj domaćina.
        </p>
      )}

      {status === 'noTable' && (
        <p role="alert" className="mt-3 font-ui text-base text-charcoal">
          {guestName}, tvoj stol još nije određen. Pitaj domaćina.
        </p>
      )}
    </form>
  )
}
