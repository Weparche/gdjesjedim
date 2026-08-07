import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeName } from './normalize.js'

test('lowercases and trims', () => {
  assert.equal(normalizeName('  Ivan Gorupić  '), 'ivan gorupic')
})

test('strips Croatian diacritics', () => {
  assert.equal(normalizeName('Šime Đurić Čvrsti Žan'), 'sime duric cvrsti zan')
})

test('collapses internal whitespace', () => {
  assert.equal(normalizeName('Ana   Marija'), 'ana marija')
})

test('handles uppercase input', () => {
  assert.equal(normalizeName('IVAN GORUPIĆ'), 'ivan gorupic')
})
