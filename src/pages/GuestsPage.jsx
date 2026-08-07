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
