import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS, HISTORY_LIMIT } from '@/config/constants'
import { createId } from '@/lib/utils/id'
import { idbJSONStorage } from '@/stores/persist/idbStorage'
import { createEmptyRequest } from '@/features/request/lib/defaults'
import type {
  Collection,
  HistoryEntry,
  HttpRequest,
  HttpResponseMeta,
} from '@/features/request/types'

interface RequestState {
  draft: HttpRequest
  requests: Record<string, HttpRequest>
  collections: Record<string, Collection>
  collectionOrder: string[]
  history: HistoryEntry[]
  proxyPrefix: string
  lastResponse: HttpResponseMeta | null

  updateDraft: (patch: Partial<HttpRequest>) => void
  loadRequest: (id: string) => void
  saveDraft: (name: string, collectionId: string) => void
  deleteRequest: (id: string) => void

  createCollection: (name: string) => string
  renameCollection: (id: string, name: string) => void
  deleteCollection: (id: string) => void

  addHistory: (request: HttpRequest, status: number | null) => void
  loadFromHistory: (id: string) => void
  clearHistory: () => void

  setProxyPrefix: (value: string) => void
  setLastResponse: (response: HttpResponseMeta | null) => void
}

/**
 * The HTTP request client's state: the in-progress draft, saved requests
 * grouped into collections, send history, and the optional CORS proxy
 * prefix. Persisted to IndexedDB (same pattern as workspaceStore) so
 * collections and history survive reloads.
 */
export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      draft: createEmptyRequest(),
      requests: {},
      collections: {},
      collectionOrder: [],
      history: [],
      proxyPrefix: '',
      lastResponse: null,

      updateDraft: (patch) =>
        set((state) => ({ draft: { ...state.draft, ...patch } })),

      loadRequest: (id) => {
        const request = get().requests[id]
        if (request) set({ draft: { ...request } })
      },

      saveDraft: (name, collectionId) => {
        const { draft, collections } = get()
        const saved: HttpRequest = {
          ...draft,
          id: draft.id || createId(),
          name,
        }
        set((state) => {
          const collection = collections[collectionId]
          const nextCollections = collection
            ? {
                ...state.collections,
                [collectionId]: {
                  ...collection,
                  requestIds: collection.requestIds.includes(saved.id)
                    ? collection.requestIds
                    : [...collection.requestIds, saved.id],
                },
              }
            : state.collections
          return {
            requests: { ...state.requests, [saved.id]: saved },
            collections: nextCollections,
            draft: saved,
          }
        })
      },

      deleteRequest: (id) =>
        set((state) => {
          const nextRequests = { ...state.requests }
          delete nextRequests[id]
          const nextCollections = Object.fromEntries(
            Object.entries(state.collections).map(([key, collection]) => [
              key,
              {
                ...collection,
                requestIds: collection.requestIds.filter((r) => r !== id),
              },
            ]),
          )
          return { requests: nextRequests, collections: nextCollections }
        }),

      createCollection: (name) => {
        const id = createId()
        set((state) => ({
          collections: {
            ...state.collections,
            [id]: { id, name, requestIds: [] },
          },
          collectionOrder: [...state.collectionOrder, id],
        }))
        return id
      },

      renameCollection: (id, name) =>
        set((state) => {
          const collection = state.collections[id]
          if (!collection) return state
          return {
            collections: {
              ...state.collections,
              [id]: { ...collection, name },
            },
          }
        }),

      deleteCollection: (id) =>
        set((state) => {
          const nextCollections = { ...state.collections }
          delete nextCollections[id]
          return {
            collections: nextCollections,
            collectionOrder: state.collectionOrder.filter((c) => c !== id),
          }
        }),

      addHistory: (request, status) =>
        set((state) => {
          const entry: HistoryEntry = {
            id: createId(),
            request,
            status,
            timestamp: Date.now(),
          }
          return { history: [entry, ...state.history].slice(0, HISTORY_LIMIT) }
        }),

      loadFromHistory: (id) => {
        const entry = get().history.find((h) => h.id === id)
        if (entry) set({ draft: { ...entry.request, id: createId() } })
      },

      clearHistory: () => set({ history: [] }),

      setProxyPrefix: (value) => set({ proxyPrefix: value }),
      setLastResponse: (response) => set({ lastResponse: response }),
    }),
    {
      name: STORAGE_KEYS.request,
      version: 1,
      storage: idbJSONStorage,
    },
  ),
)
