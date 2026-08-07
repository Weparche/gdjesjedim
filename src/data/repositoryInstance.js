import { createLocalRepository } from './repository.js'

const repository = createLocalRepository(window.localStorage)

export default repository
