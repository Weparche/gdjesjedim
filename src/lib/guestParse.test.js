import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseGuestList } from './guestParse.js'

test('splits lines into trimmed names', () => {
  const text = 'Ivan Gorupić\nAna Gorupić\nMarko Horvat'
  assert.deepEqual(parseGuestList(text), ['Ivan Gorupić', 'Ana Gorupić', 'Marko Horvat'])
})

test('drops blank lines', () => {
  const text = 'Ivan Gorupić\n\n  \nAna Gorupić\n'
  assert.deepEqual(parseGuestList(text), ['Ivan Gorupić', 'Ana Gorupić'])
})

test('returns empty array for blank input', () => {
  assert.deepEqual(parseGuestList('   \n  '), [])
})
