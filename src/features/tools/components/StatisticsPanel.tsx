import { useMemo } from 'react'
import { useDebouncedParse } from '@/hooks/useDebouncedParse'
import { computeStatistics, formatBytes } from '@/features/tools/lib/statistics'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/40 px-3 py-2">
      <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="font-mono text-sm tabular-nums">{value}</div>
    </div>
  )
}

/** Live document statistics derived from the shared debounced parse. */
export function StatisticsPanel() {
  const { content, result } = useDebouncedParse()

  const stats = useMemo(
    () => (result.ok ? computeStatistics(result.value, content) : null),
    [result, content],
  )

  if (!stats) {
    return (
      <p className="px-1 py-2 text-xs text-muted-foreground">
        Statistics are available once the JSON is valid.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat label="File Size" value={formatBytes(stats.fileSizeBytes)} />
      <Stat label="Node Count" value={stats.nodeCount.toLocaleString()} />
      <Stat label="Depth" value={String(stats.depth)} />
      <Stat label="Array Count" value={stats.arrayCount.toLocaleString()} />
      <Stat label="Object Count" value={stats.objectCount.toLocaleString()} />
      <Stat label="Key Count" value={stats.keyCount.toLocaleString()} />
    </div>
  )
}
