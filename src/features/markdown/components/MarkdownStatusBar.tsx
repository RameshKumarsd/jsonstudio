import { useMemo } from 'react'
import { computeMarkdownStats } from '@/features/markdown/lib/stats'

interface MarkdownStatusBarProps {
  content: string
}

/** Word/character count and estimated reading time, mirroring EditorStatusBar. */
export function MarkdownStatusBar({ content }: MarkdownStatusBarProps) {
  const stats = useMemo(() => computeMarkdownStats(content), [content])

  return (
    <div className="flex h-6 shrink-0 items-center gap-3 border-t px-3 text-xs text-muted-foreground">
      <span className="tabular-nums">{stats.words.toLocaleString()} words</span>
      <span className="tabular-nums">
        {stats.characters.toLocaleString()} characters
      </span>
      <span className="tabular-nums">{stats.readingTimeMinutes} min read</span>
      <span className="ml-auto">Markdown</span>
    </div>
  )
}
