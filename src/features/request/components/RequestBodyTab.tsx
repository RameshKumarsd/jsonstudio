import Editor from '@monaco-editor/react'
import { RouteLoader } from '@/components/common/RouteLoader'
import { Button } from '@/components/ui/button'
import {
  selectActiveDocument,
  useWorkspaceStore,
} from '@/stores/workspaceStore'
import { useSettingsStore } from '@/stores/settingsStore'

interface RequestBodyTabProps {
  body: string
  enabled: boolean
  onBodyChange: (body: string) => void
  onEnabledChange: (enabled: boolean) => void
}

/** JSON body editor for the request, with a one-click "use active document". */
export function RequestBodyTab({
  body,
  enabled,
  onBodyChange,
  onEnabledChange,
}: RequestBodyTabProps) {
  const activeDocument = useWorkspaceStore(selectActiveDocument)
  const prefs = useSettingsStore((s) => s.editor)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-2">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
          />
          Send body
        </label>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            onEnabledChange(true)
            onBodyChange(activeDocument.content)
          }}
        >
          Use active document
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          language="json"
          value={body}
          onChange={(next) => onBodyChange(next ?? '')}
          loading={<RouteLoader />}
          options={{
            fontSize: prefs.fontSize,
            tabSize: prefs.tabSize,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            readOnly: !enabled,
          }}
        />
      </div>
    </div>
  )
}
