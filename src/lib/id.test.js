import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateId } from './id.js'

test('generates non-empty unique-looking ids', () => {
  const a = generateId()
  const b = generateId()
  assert.ok(typeof a === 'string' && a.length > 0)
  assert.notEqual(a, b)
})
