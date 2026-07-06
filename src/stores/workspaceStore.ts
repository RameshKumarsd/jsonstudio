import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { JsonDocument } from '@/types/document'
import { STORAGE_KEYS } from '@/config/constants'
import { createId } from '@/lib/utils/id'
import { idbJSONStorage } from '@/stores/persist/idbStorage'

const SAMPLE_CONTENT = `{
  "name": "JSON Studio",
  "version": "0.1.0",
  "features": ["editor", "tree", "validation", "tools"],
  "settings": {
    "theme": "system",
    "validateOnType": true,
    "tabSize": 2
  },
  "contributors": [
    { "name": "Ada", "commits": 128 },
    { "name": "Grace", "commits": 97 }
  ]
}
`

interface NewDocumentInit {
  name?: string
  content?: string
  schema?: string | null
}

function makeDocument(init: NewDocumentInit = {}): JsonDocument {
  const now = Date.now()
  return {
    id: createId(),
    name: init.name ?? 'untitled.json',
    content: init.content ?? '',
    schema: init.schema ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

interface WorkspaceState {
  documents: Record<string, JsonDocument>
  order: string[]
  activeId: string
  createDocument: (init?: NewDocumentInit) => string
  closeDocument: (id: string) => void
  duplicateDocument: (id: string) => void
  setActive: (id: string) => void
  setContent: (id: string, content: string) => void
  setSchema: (id: string, schema: string | null) => void
  renameDocument: (id: string, name: string) => void
}

const initialDocument = makeDocument({
  name: 'example.json',
  content: SAMPLE_CONTENT,
})

/**
 * The workspace: a map of open documents plus their tab order and the active
 * document. The active document's `content` is the single source of truth every
 * feature reads from and writes to. Persisted to IndexedDB so work survives
 * reloads.
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      documents: { [initialDocument.id]: initialDocument },
      order: [initialDocument.id],
      activeId: initialDocument.id,

      createDocument: (init) => {
        const doc = makeDocument(init)
        set((state) => ({
          documents: { ...state.documents, [doc.id]: doc },
          order: [...state.order, doc.id],
          activeId: doc.id,
        }))
        return doc.id
      },

      closeDocument: (id) => {
        const { order, documents, activeId } = get()
        const index = order.indexOf(id)
        if (index === -1) return

        const nextOrder = order.filter((docId) => docId !== id)
        const nextDocuments = { ...documents }
        delete nextDocuments[id]

        // Never leave the workspace empty.
        if (nextOrder.length === 0) {
          const fresh = makeDocument()
          set({
            documents: { [fresh.id]: fresh },
            order: [fresh.id],
            activeId: fresh.id,
          })
          return
        }

        const nextActive =
          activeId === id
            ? nextOrder[Math.min(index, nextOrder.length - 1)]
            : activeId

        set({
          documents: nextDocuments,
          order: nextOrder,
          activeId: nextActive,
        })
      },

      duplicateDocument: (id) => {
        const { documents, order } = get()
        const source = documents[id]
        if (!source) return
        const copy = makeDocument({
          name: source.name.replace(/(\.json)?$/, ' copy$&'),
          content: source.content,
          schema: source.schema,
        })
        const index = order.indexOf(id)
        const nextOrder = [...order]
        nextOrder.splice(index + 1, 0, copy.id)
        set((state) => ({
          documents: { ...state.documents, [copy.id]: copy },
          order: nextOrder,
          activeId: copy.id,
        }))
      },

      setActive: (id) => set({ activeId: id }),

      setContent: (id, content) =>
        set((state) => {
          const doc = state.documents[id]
          if (!doc || doc.content === content) return state
          return {
            documents: {
              ...state.documents,
              [id]: { ...doc, content, updatedAt: Date.now() },
            },
          }
        }),

      setSchema: (id, schema) =>
        set((state) => {
          const doc = state.documents[id]
          if (!doc) return state
          return {
            documents: {
              ...state.documents,
              [id]: { ...doc, schema, updatedAt: Date.now() },
            },
          }
        }),

      renameDocument: (id, name) =>
        set((state) => {
          const doc = state.documents[id]
          if (!doc) return state
          return {
            documents: { ...state.documents, [id]: { ...doc, name } },
          }
        }),
    }),
    {
      name: STORAGE_KEYS.workspace,
      version: 1,
      storage: idbJSONStorage,
      // Repair invariants after async hydration from IndexedDB.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.order.length === 0 || !state.documents[state.activeId]) {
          const firstId = state.order.find((id) => state.documents[id])
          if (firstId) state.activeId = firstId
        }
      },
    },
  ),
)

/** Selector: the currently active document (always defined). */
export function selectActiveDocument(state: WorkspaceState): JsonDocument {
  return state.documents[state.activeId] ?? Object.values(state.documents)[0]
}
