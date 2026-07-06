import { useMemo } from 'react'
import { toast } from 'sonner'
import { useEditorController } from '@/features/editor/EditorControllerContext'
import { useActiveDocument } from '@/hooks/useActiveDocument'
import { minify } from '@/features/tools/lib/transformers'
import { parseJson } from '@/lib/json/parse'
import { offsetToLineColumn } from '@/lib/json/position'
import { copyToClipboard, readFromClipboard } from '@/lib/browser/clipboard'
import { downloadText, pickTextFile } from '@/lib/browser/file'

export interface EditorActions {
  format: () => void
  minify: () => void
  validate: () => void
  copy: () => Promise<void>
  paste: () => Promise<void>
  download: () => void
  upload: () => Promise<void>
  undo: () => void
  redo: () => void
}

/**
 * Toolbar behaviour for the editor. Transforms flow through the editor
 * controller (undoable edits) so the editor stays the single write path and
 * everything derived from the document updates automatically.
 */
export function useEditorActions(): EditorActions {
  const controller = useEditorController()
  const { document, setContent } = useActiveDocument()

  return useMemo<EditorActions>(() => {
    const content = () => document.content

    return {
      format: () => controller.runAction('editor.action.formatDocument'),

      minify: () => {
        const result = minify(content())
        if (!result.ok) {
          toast.error('Minify failed', { description: result.error.message })
          return
        }
        controller.replaceAll(result.value)
      },

      validate: () => {
        const result = parseJson(content())
        if (result.ok) {
          toast.success('Valid JSON')
          return
        }
        const { line, column } = offsetToLineColumn(
          content(),
          result.error.offset,
        )
        toast.error(`Invalid JSON (line ${line}:${column})`, {
          description: result.error.message,
        })
        controller.revealRange(
          result.error.offset,
          result.error.offset + Math.max(1, result.error.length),
        )
      },

      copy: async () => {
        await copyToClipboard(content())
        toast.success('Copied to clipboard')
      },

      paste: async () => {
        const text = await readFromClipboard()
        if (text === null) {
          toast.error('Clipboard is unavailable', {
            description: 'Grant clipboard permission or paste into the editor.',
          })
          return
        }
        controller.replaceAll(text)
      },

      download: () => downloadText(content(), document.name),

      upload: async () => {
        const picked = await pickTextFile()
        if (!picked) return
        setContent(picked.content)
        toast.success(`Loaded ${picked.name}`)
      },

      undo: () => controller.undo(),
      redo: () => controller.redo(),
    }
  }, [controller, document.content, document.name, setContent])
}
