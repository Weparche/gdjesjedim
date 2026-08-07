export function parseGuestList(text) {
  return String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
