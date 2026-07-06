import Editor, { type OnMount } from '@monaco-editor/react'
import { useSettingsStore } from '@/stores/settingsStore'
import { RouteLoader } from '@/components/common/RouteLoader'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  onMount?: OnMount
  /** Stable model path; distinct paths keep separate undo stacks. */
  path?: string
  readOnly?: boolean
}

/**
 * Thin, controlled wrapper around Monaco configured for JSON editing:
 * highlighting, completion (JSON worker), minimap, line numbers, word wrap, and
 * font size all driven by user settings. VS Code-style keybindings come for
 * free from Monaco.
 */
export function JsonEditor({
  value,
  onChange,
  onMount,
  path = 'active.json',
  readOnly = false,
}: JsonEditorProps) {
  const prefs = useSettingsStore((s) => s.editor)

  return (
    <Editor
      language="json"
      path={path}
      value={value}
      onChange={(next) => onChange(next ?? '')}
      onMount={onMount}
      loading={<RouteLoader />}
      options={{
        readOnly,
        fontSize: prefs.fontSize,
        tabSize: prefs.tabSize,
        insertSpaces: true,
        wordWrap: prefs.wordWrap ? 'on' : 'off',
        minimap: { enabled: prefs.minimap },
        lineNumbers: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        formatOnPaste: true,
        fixedOverflowWidgets: true,
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        renderWhitespace: 'selection',
        tabCompletion: 'on',
        quickSuggestions: true,
        padding: { top: 8 },
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      }}
    />
  )
}
