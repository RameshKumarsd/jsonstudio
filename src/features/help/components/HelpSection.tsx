import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HelpSectionData } from '@/features/help/content'

interface HelpSectionProps {
  section: HelpSectionData
  illustration: ReactNode
}

/** One visual-first card in the user manual: icon+title, a large diagram,
 * a one-line caption, and a collapsed-by-default "Show details" toggle. */
export function HelpSection({ section, illustration }: HelpSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = section.icon

  return (
    <section
      id={`help-${section.id}`}
      className="scroll-mt-4 space-y-3 border-b pb-6 last:border-b-0"
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{section.title}</h3>
      </div>

      {illustration}

      <p className="text-sm text-muted-foreground">{section.caption}</p>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex items-center gap-1 text-xs font-medium text-primary"
      >
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform',
            expanded && 'rotate-180',
          )}
        />
        {expanded ? 'Hide details' : 'Show details'}
      </button>

      {expanded && (
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
