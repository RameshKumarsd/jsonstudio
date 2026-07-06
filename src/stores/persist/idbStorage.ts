import { createJSONStorage, type StateStorage } from 'zustand/middleware'
import { idbDelete, idbGet, idbSet } from '@/lib/idb/kvStore'

const storage: StateStorage = {
  getItem: (name) => idbGet(name),
  setItem: (name, value) => idbSet(name, value),
  removeItem: (name) => idbDelete(name),
}

/**
 * Zustand persist storage backed by IndexedDB. Documents can be large, so they
 * live in IndexedDB rather than localStorage.
 */
export const idbJSONStorage = createJSONStorage(() => storage)
