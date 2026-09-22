const TOKEN_KEY = 'gdjesjedim:photo-delete-tokens'

function readAll(storage) {
  try {
    return JSON.parse(storage?.getItem(TOKEN_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeAll(storage, value) {
  storage?.setItem(TOKEN_KEY, JSON.stringify(value))
}

export function savePhotoDeleteToken(storage, slug, photoId, token) {
  if (!storage || !slug || !photoId || !token) return
  const all = readAll(storage)
  all[slug] = { ...(all[slug] ?? {}), [photoId]: token }
  writeAll(storage, all)
}

export function getPhotoDeleteToken(storage, slug, photoId) {
  return readAll(storage)[slug]?.[photoId]
}

export function removePhotoDeleteToken(storage, slug, photoId) {
  if (!storage || !slug || !photoId) return
  const all = readAll(storage)
  if (!all[slug]?.[photoId]) return
  const nextSlug = { ...all[slug] }
  delete nextSlug[photoId]
  if (Object.keys(nextSlug).length === 0) delete all[slug]
  else all[slug] = nextSlug
  writeAll(storage, all)
}

export function markDeletablePhotos(storage, slug, photos) {
  const tokens = readAll(storage)[slug] ?? {}
  return photos.map((photo) => ({
    ...photo,
    canDelete: Boolean(tokens[photo.id])
  }))
}
