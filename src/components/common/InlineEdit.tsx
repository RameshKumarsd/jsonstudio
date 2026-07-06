import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  initial: string
  onCommit: (value: string) => void
  onCancel: () => void
  className?: string
  'aria-label'?: string
}

/**
 * Compact inline text field for renaming (keys, values, document tabs). Commits
 * on Enter/blur, cancels on Escape.
 */
export function InlineEdit({
  initial,
  onCommit,
  onCancel,
  className,
  'aria-label': ariaLabel,
}: InlineEditProps) {
  const [value, setValue] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  return (
    <input
      ref={ref}
      value={value}
      aria-label={ariaLabel}
      spellCheck={false}
      onChange={(event) => setValue(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          onCommit(value)
        } else if (event.key === 'Escape') {
          event.preventDefault()
          onCancel()
        }
      }}
      onBlur={() => onCommit(value)}
      className={cn(
        'min-w-16 rounded-sm border border-ring bg-background px-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring/40',
        className,
      )}
    />
  )
}
