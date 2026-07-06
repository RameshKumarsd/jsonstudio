import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useEditorController } from '@/features/editor/EditorControllerContext'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { parseJson } from '@/lib/json/parse'
import {
  insertIntoContainer,
  removeAtPath,
  renameKeyAtPath,
  reorderWithinParent,
  setAtPath,
  type JsonPath,
} from '@/lib/json/mutate'
import type { JsonValue } from '@/types/json'

export interface TreeActions {
  setValue: (path: JsonPath, value: JsonValue) => void
  deleteNode: (path: JsonPath) => void
  renameKey: (parentPath: JsonPath, oldKey: string, newKey: string) => void
  addChild: (
    parentPath: JsonPath,
    keyOrIndex: string | number,
    value: JsonValue,
  ) => void
  reorder: (parentPath: JsonPath, fromIndex: number, toIndex: number) => void
}

/**
 * Tree editing operations. Each reads the current document, applies an immutable
 * mutation to the parsed value, re-serializes, and writes back through the
 * editor controller — keeping the tree and Monaco perfectly in sync and every
 * edit undoable. Edits are refused while the JSON is invalid.
 */
export function useTreeActions(): TreeActions {
  const controller = useEditorController()
  const indent = useSettingsStore((s) => s.editor.tabSize)

  const commit = useCallback(
    (mutator: (root: JsonValue) => JsonValue) => {
      const { documents, activeId } = useWorkspaceStore.getState()
      const content = documents[activeId].content
      const parsed = parseJson(content)
      if (!parsed.ok) {
        toast.error('Fix JSON errors before editing the tree')
        return
      }
      const next = mutator(parsed.value)
      controller.replaceAll(JSON.stringify(next, null, indent))
    },
    [controller, indent],
  )

  return useMemo<TreeActions>(
    () => ({
      setValue: (path, value) => commit((root) => setAtPath(root, path, value)),
      deleteNode: (path) => commit((root) => removeAtPath(root, path)),
      renameKey: (parentPath, oldKey, newKey) =>
        commit((root) => renameKeyAtPath(root, parentPath, oldKey, newKey)),
      addChild: (parentPath, keyOrIndex, value) =>
        commit((root) =>
          insertIntoContainer(root, parentPath, keyOrIndex, value),
        ),
      reorder: (parentPath, fromIndex, toIndex) =>
        commit((root) =>
          reorderWithinParent(root, parentPath, fromIndex, toIndex),
        ),
    }),
    [commit],
  )
}
