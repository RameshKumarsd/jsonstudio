import { useMemo, useState } from 'react'
import { DiffEditor, type DiffOnMount } from '@monaco-editor/react'
import { ArrowLeftRight, FileInput } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RouteLoader } from '@/components/common/RouteLoader'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'
import { MONACO_DARK, MONACO_LIGHT } from '@/lib/monaco/themes'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import {
  formatDiffPath,
  structuralDiff,
} from '@/features/diff/lib/structuralDiff'
import { cn } from '@/lib/utils'

const CHANGE_STYLES = {
  CREATE: { label: 'added', className: 'text-success' },
  REMOVE: { label: 'removed', className: 'text-destructive' },
  CHANGE: { label: 'changed', className: 'text-warning' },
} as const

function preview(value: unknown): string {
  const text = JSON.stringify(value)
  if (text === undefined) return 'undefined'
  return text.length > 40 ? `${text.slice(0, 40)}…` : text
}

/**
 * Side-by-side Monaco diff of two documents plus a structural change summary.
 * Both sides are editable; the left seeds from the active document.
 */
export function DiffView() {
  const resolvedTheme = useResolvedTheme()
  const activeContent = () => {
    const { documents, activeId } = useWorkspaceStore.getState()
    return documents[activeId]?.content ?? ''
  }

  const [left, setLeft] = useState(activeContent)
  const [right, setRight] = useState('')

  const result = useMemo(() => structuralDiff(left, right), [left, right])

  const handleMount: DiffOnMount = (editor) => {
    const original = editor.getOriginalEditor()
    const modified = editor.getModifiedEditor()
    original.onDidChangeModelContent(() => setLeft(original.getValue()))
    modified.onDidChangeModelContent(() => setRight(modified.getValue()))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b px-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLeft(activeContent())}
        >
          <FileInput /> Load active → left
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setRight(activeContent())}
        >
          <FileInput /> Load active → right
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setLeft(right)
            setRight(left)
          }}
        >
          <ArrowLeftRight /> Swap
        </Button>

        <div className="ml-auto flex items-center gap-3 text-xs">
          {result.ok ? (
            <>
              <span className="text-success">+{result.summary.created}</span>
              <span className="text-destructive">
                −{result.summary.removed}
              </span>
              <span className="text-warning">~{result.summary.changed}</span>
            </>
          ) : (
            <span className="text-destructive">
              Invalid JSON ({result.side})
            </span>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <DiffEditor
          language="json"
          original={left}
          modified={right}
          onMount={handleMount}
          theme={resolvedTheme === 'dark' ? MONACO_DARK : MONACO_LIGHT}
          loading={<RouteLoader />}
          options={{
            originalEditable: true,
            renderSideBySide: true,
            automaticLayout: true,
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <div className="h-40 shrink-0 overflow-auto border-t">
        {result.ok ? (
          result.summary.changes.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">
              No structural differences.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {result.summary.changes.map((change, index) => {
                const style = CHANGE_STYLES[change.type]
                return (
                  <li
                    key={`${change.type}-${change.path.join('.')}-${index}`}
                    className="flex items-start gap-2 px-3 py-1.5 text-xs"
                  >
                    <span
                      className={cn(
                        'w-16 shrink-0 font-medium',
                        style.className,
                      )}
                    >
                      {style.label}
                    </span>
                    <span className="font-mono">
                      {formatDiffPath(change.path)}
                      {change.type === 'CHANGE' && (
                        <span className="text-muted-foreground">
                          {' '}
                          {preview(change.oldValue)} → {preview(change.value)}
                        </span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          )
        ) : (
          <p className="p-3 text-xs text-destructive">{result.error}</p>
        )}
      </div>
    </div>
  )
}
