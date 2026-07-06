import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SplitPaneProps {
  left: ReactNode
  right: ReactNode
  /** Initial width of the left pane, in percent. */
  defaultLeft?: number
  minLeft?: number
  minRight?: number
  className?: string
}

/**
 * Horizontal two-pane split with a draggable divider. Dependency-free and fully
 * controlled so behaviour is predictable across the app.
 */
export function SplitPane({
  left,
  right,
  defaultLeft = 62,
  minLeft = 25,
  minRight = 22,
  className,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [leftPct, setLeftPct] = useState(defaultLeft)

  const stopDragging = useCallback(() => {
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((event.clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.max(minLeft, Math.min(100 - minRight, pct)))
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stopDragging)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stopDragging)
    }
  }, [minLeft, minRight, stopDragging])

  return (
    <div ref={containerRef} className={cn('flex h-full w-full', className)}>
      <div style={{ width: `${leftPct}%` }} className="min-w-0">
        {left}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={() => {
          dragging.current = true
          document.body.style.cursor = 'col-resize'
          document.body.style.userSelect = 'none'
        }}
        className="group relative flex w-px shrink-0 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-primary/40"
      >
        <div className="z-10 flex h-5 w-2.5 items-center justify-center rounded-xs border bg-border group-hover:bg-primary/60">
          <GripVertical className="size-2.5 text-muted-foreground" />
        </div>
      </div>

      <div className="min-w-0 flex-1">{right}</div>
    </div>
  )
}
