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
