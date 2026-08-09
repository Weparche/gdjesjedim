import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const EventDraftContext = createContext(null)

const DRAFT_KEY = 'gdjesjedim:draft'
const initialDraft = { event: null, extractedData: null, invitation: null, guests: [], tables: [] }

function loadDraft() {
  if (typeof window === 'undefined') return initialDraft
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? 'null')
    return parsed ? { ...initialDraft, ...parsed } : initialDraft
  } catch {
    return initialDraft
  }
}

export function EventDraftProvider({ children }) {
  const [draft, setDraft] = useState(loadDraft)

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // The repository still works if browser storage is disabled.
    }
  }, [draft])

  const value = useMemo(
    () => ({
      draft,
      setEvent: (event) => setDraft((d) => ({ ...d, event })),
      setExtractedData: (extractedData) => setDraft((d) => ({ ...d, extractedData })),
      setInvitation: (invitation) => setDraft((d) => ({ ...d, invitation })),
      setGuests: (guests) => setDraft((d) => ({ ...d, guests })),
      setTables: (tables) => setDraft((d) => ({ ...d, tables })),
      reset: () => {
        setDraft(initialDraft)
        try {
          window.localStorage.removeItem(DRAFT_KEY)
        } catch {
          // Ignore storage failures.
        }
      }
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
