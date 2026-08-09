import { useState } from 'react'
import { motion } from 'framer-motion'
import { parseGuestList } from '../../lib/guestParse.js'
import { pluralizeGosti } from '../../lib/plural.js'

export default function GuestImportTextarea({ onImport }) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const names = parseGuestList(text)
  const empty = names.length === 0

  return (
    <div className="rounded-lg bg-white p-4 shadow-card">
      <label htmlFor="guest-list" className="font-ui text-sm font-semibold text-charcoal">
        Zalijepi popis gostiju
      </label>
      <p className="mt-1 font-ui text-sm text-charcoal-soft">Jedno ime po retku.</p>
      <textarea
        id="guest-list"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={'Ivan Gorupić\nAna Gorupić\nMarko Horvat'}
        className="mt-2 w-full rounded-md border border-cream bg-ivory p-3 font-ui text-sm text-charcoal placeholder:text-charcoal-soft focus:border-gold"
      />
      <div className="mt-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          disabled={empty || saving}
          onClick={async () => {
            setSaving(true)
            setError('')
            try {
              await onImport(names)
              setText('')
            } catch (caught) {
              setError(caught.message || 'Goste nije moguće spremiti. Pokušaj ponovno.')
            } finally {
              setSaving(false)
            }
          }}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-md border border-gold bg-white px-6 font-ui text-base font-semibold text-charcoal transition-colors hover:bg-cream disabled:border-cream disabled:text-charcoal-soft disabled:pointer-events-none"
        >
          {saving ? 'Spremam goste…' : empty ? 'Zalijepi imena za dodavanje' : `Dodaj ${names.length} ${pluralizeGosti(names.length)}`}
        </motion.button>
        {error && <p role="alert" className="mt-2 font-ui text-sm font-semibold text-terracotta">{error}</p>}
      </div>
    </div>
  )
}
