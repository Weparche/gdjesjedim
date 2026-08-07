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
