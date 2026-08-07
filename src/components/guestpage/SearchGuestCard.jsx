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
