import { useEffect, useRef, useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import BottomSheet from '../common/BottomSheet.jsx'
import PrimaryButton from '../buttons/PrimaryButton.jsx'

export default function AdminUnlockSheet({ open, eventTitle, onClose, onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setPassword('')
      setError('')
      setBusy(false)
      return
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 280)
    return () => window.clearTimeout(focusTimer)
  }, [open])

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onUnlock(password)
    } catch (caught) {
      setError(caught.message || 'Šifra nije točna. Pokušaj ponovno.')
      inputRef.current?.focus()
      inputRef.current?.select()
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Admin pristup"
      subtitle={eventTitle}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-5 flex items-start gap-3 rounded-lg bg-cream p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-white text-gold-deep">
            <LockKeyhole size={18} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <p className="pt-0.5 font-ui text-sm leading-relaxed text-charcoal-soft">
            Upiši administratorsku šifru za uređivanje stolova i gostiju.
          </p>
        </div>

        <label htmlFor="admin-password" className="font-ui text-sm font-semibold text-charcoal">
          Administratorska šifra
        </label>
        <input
          ref={inputRef}
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (error) setError('')
          }}
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'admin-password-error' : undefined}
          className={`mt-2 min-h-[52px] w-full rounded-md border bg-white px-4 font-ui text-base text-charcoal outline-none transition-[border-color,box-shadow] focus:ring-4 ${
            error
              ? 'border-terracotta focus:border-terracotta focus:ring-terracotta/15'
              : 'border-gold/40 focus:border-gold-deep focus:ring-gold/20'
          }`}
        />
        {error && (
          <p id="admin-password-error" role="alert" className="mt-2 font-ui text-sm font-semibold text-terracotta">
            {error}
          </p>
        )}

        <PrimaryButton type="submit" className="mt-5" disabled={!password || busy}>
          {busy ? 'Provjeravam…' : 'Otključaj admin'}
        </PrimaryButton>
      </form>
    </BottomSheet>
  )
}
