const WORKER_ORIGIN = 'https://gdjesjedim.ig29007.workers.dev'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

function resolveBackendOrigin() {
  const configuredOrigin = import.meta.env.VITE_API_ORIGIN?.trim().replace(/\/$/, '')
  if (configuredOrigin) return configuredOrigin
  if (LOCAL_HOSTS.has(window.location.hostname)) return window.location.origin
  if (window.location.hostname === 'gdjesjedim.ig29007.workers.dev') return window.location.origin
  return WORKER_ORIGIN
}

export const backendOrigin = resolveBackendOrigin()

export function backendUrl(path) {
  return new URL(path, `${backendOrigin}/`).toString()
}
