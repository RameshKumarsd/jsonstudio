import { useCallback } from 'react'
import {
  selectActiveDocument,
  useWorkspaceStore,
} from '@/stores/workspaceStore'
import type { JsonDocument } from '@/types/document'

interface ActiveDocumentApi {
  document: JsonDocument
  setContent: (content: string) => void
  setSchema: (schema: string | null) => void
}

/**
 * Ergonomic access to the active document and the actions that mutate it,
 * pre-bound to the active id. Shared by every feature so they all read and
 * write the same source of truth.
 */
export function useActiveDocument(): ActiveDocumentApi {
  const document = useWorkspaceStore(selectActiveDocument)
  const setContentAction = useWorkspaceStore((s) => s.setContent)
  const setSchemaAction = useWorkspaceStore((s) => s.setSchema)

  const setContent = useCallback(
    (content: string) => setContentAction(document.id, content),
    [setContentAction, document.id],
  )
  const setSchema = useCallback(
    (schema: string | null) => setSchemaAction(document.id, schema),
    [setSchemaAction, document.id],
  )

  return { document, setContent, setSchema }
}
