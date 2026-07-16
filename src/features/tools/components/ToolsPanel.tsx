import { Button } from '@/components/ui/button'
import { useToolTransforms } from '@/features/tools/hooks/useToolTransforms'
import {
  beautify,
  escapeJson,
  flatten,
  format,
  minify,
  removeDuplicateKeys,
  removeEmptyValues,
  sortKeys,
  unescapeJson,
  unflatten,
  type TransformError,
} from '@/features/tools/lib/transformers'
import { repairJson } from '@/features/tools/lib/repair'
import { StatisticsPanel } from '@/features/tools/components/StatisticsPanel'
import type { Result } from '@/types/json'

type Tool = {
  label: string
  fn: (text: string, indent?: number) => Result<string, TransformError>
}

const TOOLS: Tool[] = [
  { label: 'Format', fn: format },
  { label: 'Minify', fn: minify },
  { label: 'Beautify', fn: beautify },
  { label: 'Repair', fn: repairJson },
  { label: 'Sort Keys', fn: sortKeys },
  { label: 'Remove Empty Values', fn: removeEmptyValues },
  { label: 'Remove Duplicate Keys', fn: removeDuplicateKeys },
  { label: 'Flatten JSON', fn: flatten },
  { label: 'Unflatten JSON', fn: unflatten },
  { label: 'Escape JSON', fn: escapeJson },
  { label: 'Unescape JSON', fn: unescapeJson },
]

/** Transform toolbox plus live document statistics. */
export function ToolsPanel() {
  const apply = useToolTransforms()

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3">
      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Transform
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map((tool) => (
            <Button
              key={tool.label}
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => apply(tool.label, tool.fn)}
            >
              {tool.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Statistics
        </h3>
        <StatisticsPanel />
      </section>
    </div>
  )
}
