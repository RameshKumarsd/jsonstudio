import { ChevronsDownUp, ChevronsUpDown, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ToolbarButton } from '@/components/common/ToolbarButton'

interface TreeToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function TreeToolbar({
  searchTerm,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
}: TreeToolbarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b px-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search keys and values"
          className="h-7 pr-7 pl-7 text-xs"
        />
        {searchTerm && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <ToolbarButton label="Expand all" onClick={onExpandAll}>
        <ChevronsUpDown />
      </ToolbarButton>
      <ToolbarButton label="Collapse all" onClick={onCollapseAll}>
        <ChevronsDownUp />
      </ToolbarButton>
    </div>
  )
}
