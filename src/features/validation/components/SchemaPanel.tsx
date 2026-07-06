import Editor from '@monaco-editor/react'
import { Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useActiveDocument } from '@/hooks/useActiveDocument'
import { useSettingsStore } from '@/stores/settingsStore'
import { useValidationStore } from '@/features/validation/validationStore'
import { parseJson } from '@/lib/json/parse'
import { generateSchema } from '@/features/validation/lib/generateSchema'
import { RouteLoader } from '@/components/common/RouteLoader'

/**
 * Editor for the JSON Schema attached to the active document, with one-click
 * schema generation from the current data. Editing here drives real-time
 * validation via the document's schema field.
 */
export function SchemaPanel() {
  const { document, setSchema } = useActiveDocument()
  const prefs = useSettingsStore((s) => s.editor)
  const schemaError = useValidationStore((s) => s.schemaError)

  const generate = () => {
    const parsed = parseJson(document.content)
    if (!parsed.ok) {
      toast.error('Fix JSON errors before generating a schema')
      return
    }
    setSchema(JSON.stringify(generateSchema(parsed.value), null, prefs.tabSize))
    toast.success('Schema generated from document')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b px-2">
        <Button size="sm" variant="secondary" onClick={generate}>
          <Sparkles /> Generate
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSchema(null)}
          disabled={!document.schema}
        >
          <Trash2 /> Clear
        </Button>
      </div>

      {schemaError && (
        <p className="border-b px-3 py-1.5 text-xs text-destructive">
          {schemaError}
        </p>
      )}

      <div className="min-h-0 flex-1">
        <Editor
          language="json"
          path="schema.json"
          value={document.schema ?? ''}
          onChange={(next) => setSchema(next && next.trim() ? next : null)}
          loading={<RouteLoader />}
          options={{
            fontSize: prefs.fontSize,
            tabSize: prefs.tabSize,
            minimap: { enabled: false },
            lineNumbers: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fixedOverflowWidgets: true,
            padding: { top: 8 },
          }}
        />
      </div>
    </div>
  )
}
