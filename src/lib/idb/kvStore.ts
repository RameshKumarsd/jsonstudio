import { openDB, type IDBPDatabase } from 'idb'
import { IDB } from '@/config/constants'

const STORE = 'keyval'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(IDB.name, IDB.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE)
        }
      },
    })
  }
  return dbPromise
}

/** Minimal async key/value access over IndexedDB, used by the persist adapter. */
export async function idbGet(key: string): Promise<string | null> {
  const value = await (await getDb()).get(STORE, key)
  return (value as string | undefined) ?? null
}

export async function idbSet(key: string, value: string): Promise<void> {
  await (await getDb()).put(STORE, value, key)
}

export async function idbDelete(key: string): Promise<void> {
  await (await getDb()).delete(STORE, key)
}
