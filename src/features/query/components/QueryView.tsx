import { useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SplitPane } from '@/components/layout/SplitPane'
import { RouteLoader } from '@/components/common/RouteLoader'
import {
  selectActiveDocument,
  useWorkspaceStore,
} from '@/stores/workspaceStore'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { parseJson } from '@/lib/json/parse'
import { runJsonPath } from '@/features/query/lib/runJsonPath'

const READONLY_OPTIONS = {
  readOnly: true,
  minimap: { enabled: false },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  fontSize: 13,
  lineNumbers: 'on',
} as const

/**
 * Run JSONPath queries against the active document with live results. The source
 * (read-only) sits on the left; matches render on the right.
 */
export function QueryView() {
  const document = useWorkspaceStore(selectActiveDocument)
  const [path, setPath] = useState('$..*')
  const debouncedPath = useDebouncedValue(path, 200)

  const parsed = useMemo(() => parseJson(document.content), [document.content])

  const result = useMemo(() => {
    if (!parsed.ok) return null
    return runJsonPath(parsed.value, debouncedPath)
  }, [parsed, debouncedPath])

  const resultsText = useMemo(() => {
    if (!result || !result.ok) return ''
    return JSON.stringify(result.matches, null, 2)
  }, [result])

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={path}
            onChange={(event) => setPath(event.target.value)}
            placeholder="JSONPath, e.g. $.contributors[*].name"
            className="pl-8 font-mono"
          />
        </div>
        <span className="w-28 text-right text-xs text-muted-foreground tabular-nums">
          {!parsed.ok
            ? 'invalid JSON'
            : result && !result.ok
              ? 'invalid path'
              : `${result?.matches.length ?? 0} matches`}
        </span>
      </div>

      <div className="min-h-0 flex-1">
        <SplitPane
          defaultLeft={50}
          left={
            <div className="flex h-full flex-col">
              <div className="border-b px-3 py-1 text-xs text-muted-foreground">
                {document.name}
              </div>
              <div className="min-h-0 flex-1">
                <Editor
                  language="json"
                  value={document.content}
                  loading={<RouteLoader />}
                  options={READONLY_OPTIONS}
                />
              </div>
            </div>
          }
          right={
            <div className="flex h-full flex-col">
              <div className="border-b px-3 py-1 text-xs text-muted-foreground">
                Results
              </div>
              <div className="min-h-0 flex-1">
                {result && !result.ok ? (
                  <p className="p-3 text-xs text-destructive">{result.error}</p>
                ) : (
                  <Editor
                    language="json"
                    value={resultsText}
                    loading={<RouteLoader />}
                    options={READONLY_OPTIONS}
                  />
                )}
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}
