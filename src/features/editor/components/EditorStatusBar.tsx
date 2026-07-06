import { useMemo } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useDebouncedParse } from '@/hooks/useDebouncedParse'
import { computeStatistics, formatBytes } from '@/features/tools/lib/statistics'
import { cn } from '@/lib/utils'

interface EditorStatusBarProps {
  line: number
  column: number
}

/**
 * Bottom status strip: cursor position, validity, size, and node count. Derived
 * values come from the shared debounced parse so typing stays smooth.
 */
export function EditorStatusBar({ line, column }: EditorStatusBarProps) {
  const { content, result } = useDebouncedParse()

  const stats = useMemo(
    () => (result.ok ? computeStatistics(result.value, content) : null),
    [result, content],
  )

  return (
    <div className="flex h-6 shrink-0 items-center gap-3 border-t px-3 text-xs text-muted-foreground">
      <span className="tabular-nums">
        Ln {line}, Col {column}
      </span>

      <span
        className={cn(
          'flex items-center gap-1',
          result.ok ? 'text-success' : 'text-destructive',
        )}
      >
        {result.ok ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <XCircle className="size-3.5" />
        )}
        {result.ok ? 'Valid' : 'Invalid'}
      </span>

      <span className="tabular-nums">
        {formatBytes(stats?.fileSizeBytes ?? new Blob([content]).size)}
      </span>

      {stats && (
        <span className="tabular-nums">
          {stats.nodeCount.toLocaleString()} nodes
        </span>
      )}

      <span className="ml-auto">JSON</span>
    </div>
  )
}
