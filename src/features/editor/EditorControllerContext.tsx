import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import type { OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { monaco } from '@/lib/monaco/monaco'
import type { EditorMarker, MarkerSeverity } from '@/features/editor/types'

type CodeEditor = MonacoEditor.IStandaloneCodeEditor

const MARKER_OWNER = 'json-studio'

/**
 * Imperative handle to the live Monaco instance, shared across the editor,
 * toolbar, tree, and validation panels so they can drive one editor without
 * prop drilling.
 */
export interface EditorController {
  /** Wire the Monaco instance; pass to <Editor onMount>. */
  attach: OnMount
  focus: () => void
  undo: () => void
  redo: () => void
  runAction: (actionId: string) => void
  /** Replace the whole document via an undoable edit (keeps cursor history). */
  replaceAll: (text: string) => void
  /** Scroll to and select a character range. */
  revealRange: (startOffset: number, endOffset: number) => void
  /** Publish validation markers to the editor gutter/overview ruler. */
  setMarkers: (markers: EditorMarker[]) => void
  clearMarkers: () => void
}

const EditorControllerContext = createContext<EditorController | null>(null)

function toMonacoSeverity(severity: MarkerSeverity) {
  switch (severity) {
    case 'error':
      return monaco.MarkerSeverity.Error
    case 'warning':
      return monaco.MarkerSeverity.Warning
    default:
      return monaco.MarkerSeverity.Info
  }
}

export function EditorControllerProvider({
  children,
}: {
  children: ReactNode
}) {
  const editorRef = useRef<CodeEditor | null>(null)

  const controller = useMemo<EditorController>(() => {
    const getModel = () => editorRef.current?.getModel() ?? null

    return {
      attach: (editor) => {
        editorRef.current = editor
      },
      focus: () => editorRef.current?.focus(),
      undo: () => editorRef.current?.trigger('json-studio', 'undo', null),
      redo: () => editorRef.current?.trigger('json-studio', 'redo', null),
      runAction: (actionId) => {
        void editorRef.current?.getAction(actionId)?.run()
      },
      replaceAll: (text) => {
        const editor = editorRef.current
        const model = getModel()
        if (!editor || !model) return
        editor.executeEdits(MARKER_OWNER, [
          { range: model.getFullModelRange(), text },
        ])
        editor.pushUndoStop()
      },
      revealRange: (startOffset, endOffset) => {
        const editor = editorRef.current
        const model = getModel()
        if (!editor || !model) return
        const start = model.getPositionAt(startOffset)
        const end = model.getPositionAt(endOffset)
        const range = monaco.Range.fromPositions(start, end)
        editor.revealRangeInCenter(range, monaco.editor.ScrollType.Smooth)
        editor.setSelection(range)
        editor.focus()
      },
      setMarkers: (markers) => {
        const model = getModel()
        if (!model) return
        monaco.editor.setModelMarkers(
          model,
          MARKER_OWNER,
          markers.map((marker) => {
            const start = model.getPositionAt(marker.startOffset)
            const end = model.getPositionAt(marker.endOffset)
            return {
              startLineNumber: start.lineNumber,
              startColumn: start.column,
              endLineNumber: end.lineNumber,
              endColumn: end.column,
              message: marker.message,
              severity: toMonacoSeverity(marker.severity),
            }
          }),
        )
      },
      clearMarkers: () => {
        const model = getModel()
        if (model) monaco.editor.setModelMarkers(model, MARKER_OWNER, [])
      },
    }
  }, [])

  return (
    <EditorControllerContext.Provider value={controller}>
      {children}
    </EditorControllerContext.Provider>
  )
}

export function useEditorController(): EditorController {
  const controller = useContext(EditorControllerContext)
  if (!controller) {
    throw new Error(
      'useEditorController must be used within an EditorControllerProvider',
    )
  }
  return controller
}
