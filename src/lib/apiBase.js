export function apiUrl(path) {
  const configuredBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
  const onPagesHost = typeof window !== 'undefined' && window.location.hostname.endsWith('.pages.dev')
  const base = onPagesHost ? configuredBase : ''
  return `${base}${path}`
}
