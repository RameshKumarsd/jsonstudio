import { useCallback } from 'react'
import { toast } from 'sonner'
import { useEditorController } from '@/features/editor/EditorControllerContext'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { Result } from '@/types/json'
import type { TransformError } from '@/features/tools/lib/transformers'

export type ToolTransform = (
  text: string,
  indent?: number,
) => Result<string, TransformError>

/**
 * Returns an `apply` function that runs a transform against the current
 * document and writes the result through the editor controller (undoable),
 * surfacing failures as toasts.
 */
export function useToolTransforms() {
  const controller = useEditorController()
  const indent = useSettingsStore((s) => s.editor.tabSize)

  return useCallback(
    (label: string, transform: ToolTransform) => {
      const { documents, activeId } = useWorkspaceStore.getState()
      const result = transform(documents[activeId].content, indent)
      if (!result.ok) {
        toast.error(`${label} failed`, { description: result.error.message })
        return
      }
      controller.replaceAll(result.value)
      toast.success(`${label} applied`)
    },
    [controller, indent],
  )
}
