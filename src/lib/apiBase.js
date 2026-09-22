export function apiUrl(path) {
  const base = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
  return `${base}${path}`
}
