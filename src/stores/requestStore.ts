import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS, HISTORY_LIMIT } from '@/config/constants'
import { createId } from '@/lib/utils/id'
import { idbJSONStorage } from '@/stores/persist/idbStorage'
import { createEmptyRequest } from '@/features/request/lib/defaults'
import type {
  Collection,
  Environment,
  HistoryEntry,
  HttpRequest,
  HttpResponseMeta,
  KeyValueEntry,
} from '@/features/request/types'

interface RequestState {
  drafts: Record<string, HttpRequest>
  draftOrder: string[]
  activeDraftId: string
  requests: Record<string, HttpRequest>
  collections: Record<string, Collection>
  collectionOrder: string[]
  history: HistoryEntry[]
  proxyPrefix: string
  responses: Record<string, HttpResponseMeta>
  environments: Record<string, Environment>
  environmentOrder: string[]
  activeEnvironmentId: string | null

  updateDraft: (patch: Partial<HttpRequest>) => void
  createDraftTab: () => string
  closeDraftTab: (id: string) => void
  duplicateDraftTab: (id: string) => void
  renameDraftTab: (id: string, name: string) => void
  setActiveDraftTab: (id: string) => void
  loadRequest: (id: string) => void
  saveDraft: (name: string, collectionId: string) => void
  deleteRequest: (id: string) => void

  createCollection: (name: string) => string
  renameCollection: (id: string, name: string) => void
  deleteCollection: (id: string) => void
  /** Create a new collection pre-populated with already-built requests (e.g. a Postman import). */
  importRequests: (name: string, requests: HttpRequest[]) => void

  addHistory: (request: HttpRequest, status: number | null) => void
  loadFromHistory: (id: string) => void
  clearHistory: () => void

  setProxyPrefix: (value: string) => void
  setResponse: (draftId: string, response: HttpResponseMeta) => void

  createEnvironment: (name: string) => string
  renameEnvironment: (id: string, name: string) => void
  deleteEnvironment: (id: string) => void
  setEnvironmentVariables: (id: string, variables: KeyValueEntry[]) => void
  setActiveEnvironment: (id: string | null) => void
}

const initialDraft = createEmptyRequest()

/**
 * The HTTP request client's state: open request tabs (`drafts`, mirroring
 * `workspaceStore`'s document-tabs pattern), saved requests grouped into
 * collections, send history, environments, and the optional CORS proxy
 * prefix. Each tab keeps its own last response (`responses`, keyed by draft
 * id) so switching tabs never shows the wrong response. Persisted to
 * IndexedDB so everything survives reloads.
 */
export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      drafts: { [initialDraft.id]: initialDraft },
      draftOrder: [initialDraft.id],
      activeDraftId: initialDraft.id,
      requests: {},
      collections: {},
      collectionOrder: [],
      history: [],
      proxyPrefix: '',
      responses: {},
      environments: {},
      environmentOrder: [],
      activeEnvironmentId: null,

      updateDraft: (patch) =>
        set((state) => {
          const draft = state.drafts[state.activeDraftId]
          if (!draft) return state
          return {
            drafts: {
              ...state.drafts,
              [state.activeDraftId]: { ...draft, ...patch },
            },
          }
        }),

      createDraftTab: () => {
        const draft = createEmptyRequest()
        set((state) => ({
          drafts: { ...state.drafts, [draft.id]: draft },
          draftOrder: [...state.draftOrder, draft.id],
          activeDraftId: draft.id,
        }))
        return draft.id
      },

      closeDraftTab: (id) => {
        const { draftOrder, drafts, activeDraftId, responses } = get()
        const index = draftOrder.indexOf(id)
        if (index === -1) return

        const nextOrder = draftOrder.filter((draftId) => draftId !== id)
        const nextDrafts = { ...drafts }
        delete nextDrafts[id]
        const nextResponses = { ...responses }
        delete nextResponses[id]

        // Never leave the request client with zero tabs.
        if (nextOrder.length === 0) {
          const fresh = createEmptyRequest()
          set({
            drafts: { [fresh.id]: fresh },
            draftOrder: [fresh.id],
            activeDraftId: fresh.id,
            responses: nextResponses,
          })
          return
        }

        const nextActive =
          activeDraftId === id
            ? nextOrder[Math.min(index, nextOrder.length - 1)]
            : activeDraftId

        set({
          drafts: nextDrafts,
          draftOrder: nextOrder,
          activeDraftId: nextActive,
          responses: nextResponses,
        })
      },

      duplicateDraftTab: (id) => {
        const { drafts, draftOrder } = get()
        const source = drafts[id]
        if (!source) return
        const copy: HttpRequest = {
          ...source,
          id: createId(),
          name: `${source.name} copy`,
        }
        const index = draftOrder.indexOf(id)
        const nextOrder = [...draftOrder]
        nextOrder.splice(index + 1, 0, copy.id)
        set((state) => ({
          drafts: { ...state.drafts, [copy.id]: copy },
          draftOrder: nextOrder,
          activeDraftId: copy.id,
        }))
      },

      renameDraftTab: (id, name) =>
        set((state) => {
          const draft = state.drafts[id]
          if (!draft) return state
          return { drafts: { ...state.drafts, [id]: { ...draft, name } } }
        }),

      setActiveDraftTab: (id) => set({ activeDraftId: id }),

      loadRequest: (id) => {
        const { requests, drafts, draftOrder } = get()
        const request = requests[id]
        if (!request) return
        // Already open in a tab — just focus it, don't duplicate the tab.
        if (drafts[id]) {
          set({ activeDraftId: id })
          return
        }
        set({
          drafts: { ...drafts, [id]: { ...request } },
          draftOrder: [...draftOrder, id],
          activeDraftId: id,
        })
      },

      saveDraft: (name, collectionId) => {
        const { drafts, activeDraftId, collections } = get()
        const draft = drafts[activeDraftId]
        if (!draft) return
        const saved: HttpRequest = { ...draft, id: draft.id || createId(), name }
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
            drafts: { ...state.drafts, [state.activeDraftId]: saved },
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

      importRequests: (name, requests) => {
        const id = createId()
        set((state) => ({
          requests: {
            ...state.requests,
            ...Object.fromEntries(requests.map((r) => [r.id, r])),
          },
          collections: {
            ...state.collections,
            [id]: { id, name, requestIds: requests.map((r) => r.id) },
          },
          collectionOrder: [...state.collectionOrder, id],
        }))
      },

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
        if (!entry) return
        const copy: HttpRequest = { ...entry.request, id: createId() }
        set((state) => ({
          drafts: { ...state.drafts, [copy.id]: copy },
          draftOrder: [...state.draftOrder, copy.id],
          activeDraftId: copy.id,
        }))
      },

      clearHistory: () => set({ history: [] }),

      setProxyPrefix: (value) => set({ proxyPrefix: value }),
      setResponse: (draftId, response) =>
        set((state) => ({
          responses: { ...state.responses, [draftId]: response },
        })),

      createEnvironment: (name) => {
        const id = createId()
        set((state) => ({
          environments: {
            ...state.environments,
            [id]: { id, name, variables: [] },
          },
          environmentOrder: [...state.environmentOrder, id],
        }))
        return id
      },

      renameEnvironment: (id, name) =>
        set((state) => {
          const environment = state.environments[id]
          if (!environment) return state
          return {
            environments: {
              ...state.environments,
              [id]: { ...environment, name },
            },
          }
        }),

      deleteEnvironment: (id) =>
        set((state) => {
          const nextEnvironments = { ...state.environments }
          delete nextEnvironments[id]
          return {
            environments: nextEnvironments,
            environmentOrder: state.environmentOrder.filter((e) => e !== id),
            activeEnvironmentId:
              state.activeEnvironmentId === id
                ? null
                : state.activeEnvironmentId,
          }
        }),

      setEnvironmentVariables: (id, variables) =>
        set((state) => {
          const environment = state.environments[id]
          if (!environment) return state
          return {
            environments: {
              ...state.environments,
              [id]: { ...environment, variables },
            },
          }
        }),

      setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),
    }),
    {
      name: STORAGE_KEYS.request,
      version: 1,
      storage: idbJSONStorage,
      // Repair invariants after async hydration from IndexedDB (a stale
      // activeDraftId pointing at a since-removed draft, an empty
      // draftOrder from pre-tabs persisted state, ...).
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (
          state.draftOrder.length === 0 ||
          !state.drafts[state.activeDraftId]
        ) {
          const firstId = state.draftOrder.find((id) => state.drafts[id])
          if (firstId) {
            state.activeDraftId = firstId
          } else {
            const fresh = createEmptyRequest()
            state.drafts = { [fresh.id]: fresh }
            state.draftOrder = [fresh.id]
            state.activeDraftId = fresh.id
          }
        }
      },
    },
  ),
)

/** Selector: the currently active request draft (always defined). */
export function selectActiveDraft(state: RequestState): HttpRequest {
  return state.drafts[state.activeDraftId] ?? Object.values(state.drafts)[0]
}
