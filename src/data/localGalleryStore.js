const DB_NAME = 'gdjesjedim-gallery'
const STORE_NAME = 'photos'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      store.createIndex('eventSlug', 'eventSlug')
    }
    request.onsuccess = () => resolve(request.result)
  })
}

function transaction(mode, action) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)
    const result = action(store)
    tx.oncomplete = () => {
      database.close()
      resolve(result?.result)
    }
    tx.onerror = () => {
      database.close()
      reject(tx.error)
    }
  }))
}

function publicPhoto(record) {
  const url = URL.createObjectURL(record.blob)
  return { id: record.id, originalName: record.originalName, width: record.width, height: record.height, createdAt: record.createdAt, url, thumbnailUrl: url }
}

export async function listLocalPhotos(eventSlug) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).index('eventSlug').getAll(eventSlug)
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(publicPhoto))
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => database.close()
  })
}

export async function addLocalPhoto(eventSlug, file, dimensions = {}) {
  const record = {
    id: crypto.randomUUID(),
    eventSlug,
    originalName: file.name,
    blob: file,
    width: dimensions.width ?? 0,
    height: dimensions.height ?? 0,
    createdAt: new Date().toISOString()
  }
  await transaction('readwrite', (store) => store.put(record))
  return publicPhoto(record)
}
