import Editor from '@monaco-editor/react'
import { RouteLoader } from '@/components/common/RouteLoader'
import { Button } from '@/components/ui/button'
import { KeyValueEditor } from '@/features/request/components/KeyValueEditor'
import {
  selectActiveDocument,
  useWorkspaceStore,
} from '@/stores/workspaceStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { BodyMode, KeyValueEntry } from '@/features/request/types'

interface RequestBodyTabProps {
  body: string
  enabled: boolean
  mode: BodyMode
  fields: KeyValueEntry[]
  onBodyChange: (body: string) => void
  onEnabledChange: (enabled: boolean) => void
  onModeChange: (mode: BodyMode) => void
  onFieldsChange: (fields: KeyValueEntry[]) => void
}

const MODES: { value: BodyMode; label: string }[] = [
  { value: 'raw', label: 'Raw (JSON)' },
  { value: 'urlencoded', label: 'x-www-form-urlencoded' },
  { value: 'form-data', label: 'Form Data' },
]

/** Request body editor: raw JSON (Monaco), or key/value fields for the two
 * form-encoded modes. */
export function RequestBodyTab({
  body,
  enabled,
  mode,
  fields,
  onBodyChange,
  onEnabledChange,
  onModeChange,
  onFieldsChange,
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
        {mode === 'raw' && (
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
        )}
      </div>

      <div className="flex gap-4 border-b px-2 py-2 text-xs">
        {MODES.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2"
          >
            <input
              type="radio"
              name="body-mode"
              checked={mode === option.value}
              onChange={() => onModeChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {mode === 'raw' ? (
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
        ) : (
          <div className="overflow-auto">
            <KeyValueEditor
              entries={fields}
              onChange={onFieldsChange}
              keyPlaceholder="Key"
              valuePlaceholder={
                mode === 'form-data' ? 'Value (text only)' : 'Value'
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
