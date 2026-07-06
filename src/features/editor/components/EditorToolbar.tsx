import {
  ClipboardPaste,
  Copy,
  Download,
  FileCheck2,
  Minimize2,
  Redo2,
  Sparkles,
  Undo2,
  Upload,
} from 'lucide-react'
import { ToolbarButton } from '@/components/common/ToolbarButton'
import { Separator } from '@/components/ui/separator'
import { useEditorActions } from '@/features/editor/hooks/useEditorActions'

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const mod = isMac ? '⌘' : 'Ctrl+'

/**
 * Primary editor actions. Behaviour lives in useEditorActions; this component
 * is purely the control surface.
 */
export function EditorToolbar() {
  const actions = useEditorActions()

  return (
    <div className="flex h-10 shrink-0 items-center gap-0.5 border-b px-2">
      <ToolbarButton label="Format" shortcut={`⇧⌥F`} onClick={actions.format}>
        <Sparkles />
      </ToolbarButton>
      <ToolbarButton label="Minify" onClick={actions.minify}>
        <Minimize2 />
      </ToolbarButton>
      <ToolbarButton label="Validate" onClick={actions.validate}>
        <FileCheck2 />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton label="Undo" shortcut={`${mod}Z`} onClick={actions.undo}>
        <Undo2 />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        shortcut={isMac ? '⇧⌘Z' : 'Ctrl+Y'}
        onClick={actions.redo}
      >
        <Redo2 />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        label="Copy"
        shortcut={`${mod}C`}
        onClick={() => void actions.copy()}
      >
        <Copy />
      </ToolbarButton>
      <ToolbarButton
        label="Paste"
        shortcut={`${mod}V`}
        onClick={() => void actions.paste()}
      >
        <ClipboardPaste />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton label="Download" onClick={actions.download}>
        <Download />
      </ToolbarButton>
      <ToolbarButton label="Upload" onClick={() => void actions.upload()}>
        <Upload />
      </ToolbarButton>
    </div>
  )
}
