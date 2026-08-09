import { createLocalRepository } from './repository.js'
import { createApiRepository } from './apiRepository.js'

// window.localStorage access can throw (e.g. browsers configured to block
// site data). Fall back to the in-memory storage createLocalRepository
// already defaults to internally when no storage argument is passed, so the
// app still mounts and works for the current session, just without
// persistence across reloads.
let storage
try {
  storage = window.localStorage
} catch {
  storage = undefined
}

const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const repository = isLocal ? createLocalRepository(storage) : createApiRepository(storage)

export default repository
