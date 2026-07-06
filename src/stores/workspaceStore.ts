import { create } from 'zustand'
import type { JsonDocument } from '@/types/document'
import { createId } from '@/lib/utils/id'

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

function createDocument(overrides: Partial<JsonDocument> = {}): JsonDocument {
  const now = Date.now()
  return {
    id: createId(),
    name: 'untitled.json',
    content: '',
    schema: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

interface WorkspaceState {
  documents: Record<string, JsonDocument>
  activeId: string
  setContent: (id: string, content: string) => void
  setSchema: (id: string, schema: string | null) => void
  renameDocument: (id: string, name: string) => void
  setActive: (id: string) => void
}

const initialDocument = createDocument({ content: SAMPLE_CONTENT })

/**
 * Holds the workspace's documents. The active document's `content` is the
 * single source of truth every feature (editor, tree, validation, tools) reads
 * from and writes to. Structured as a map so multi-document tabs slot in later
 * without reshaping consumers.
 */
export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  documents: { [initialDocument.id]: initialDocument },
  activeId: initialDocument.id,

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

  setActive: (id) => set({ activeId: id }),
}))

/** Selector: the currently active document (always defined). */
export function selectActiveDocument(state: WorkspaceState): JsonDocument {
  return state.documents[state.activeId]
}
