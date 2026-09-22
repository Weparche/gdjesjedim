const KEY_PREFIX = 'gdjesjedim:public-admin-session:'

export function setPublicAdminSession(storage, eventId) {
  if (!storage || !eventId) return
  storage.setItem(`${KEY_PREFIX}${eventId}`, '1')
}

export function clearPublicAdminSession(storage, eventId) {
  if (!storage || !eventId) return
  storage.removeItem(`${KEY_PREFIX}${eventId}`)
}

export function hasPublicAdminSession(storage, eventId) {
  if (!storage || !eventId) return false
  return storage.getItem(`${KEY_PREFIX}${eventId}`) === '1'
}
