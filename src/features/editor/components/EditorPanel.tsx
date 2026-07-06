import { useState } from 'react'
import type { OnMount } from '@monaco-editor/react'
import { JsonEditor } from '@/features/editor/components/JsonEditor'
import { EditorToolbar } from '@/features/editor/components/EditorToolbar'
import { EditorStatusBar } from '@/features/editor/components/EditorStatusBar'
import { useEditorController } from '@/features/editor/EditorControllerContext'
import { useActiveDocument } from '@/hooks/useActiveDocument'

/**
 * The editor surface: toolbar, Monaco, and status bar composed together and
 * bound to the active document. Owns cursor state (kept local so cursor moves
 * don't re-render the rest of the app).
 */
export function EditorPanel() {
  const controller = useEditorController()
  const { document, setContent } = useActiveDocument()
  const [cursor, setCursor] = useState({ line: 1, column: 1 })

  const handleMount: OnMount = (editor, monacoApi) => {
    controller.attach(editor, monacoApi)
    editor.onDidChangeCursorPosition((event) =>
      setCursor({
        line: event.position.lineNumber,
        column: event.position.column,
      }),
    )
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <EditorToolbar />
      <div className="min-h-0 flex-1">
        <JsonEditor
          value={document.content}
          onChange={setContent}
          onMount={handleMount}
          path={`${document.id}.json`}
        />
      </div>
      <EditorStatusBar line={cursor.line} column={cursor.column} />
    </div>
  )
}
