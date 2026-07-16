import { useState } from 'react'
import { Copy, Plus, X } from 'lucide-react'
import { useRequestStore } from '@/stores/requestStore'
import { InlineEdit } from '@/components/common/InlineEdit'
import { ToolbarButton } from '@/components/common/ToolbarButton'
import { cn } from '@/lib/utils'

/**
 * Tabbed request strip: switch, rename (double-click), close, duplicate, and
 * create request drafts. Mirrors the Editor's DocumentTabs — same pattern,
 * backed by the persisted request store instead of the workspace store.
 */
export function RequestTabs() {
  const drafts = useRequestStore((s) => s.drafts)
  const draftOrder = useRequestStore((s) => s.draftOrder)
  const activeDraftId = useRequestStore((s) => s.activeDraftId)
  const setActiveDraftTab = useRequestStore((s) => s.setActiveDraftTab)
  const closeDraftTab = useRequestStore((s) => s.closeDraftTab)
  const createDraftTab = useRequestStore((s) => s.createDraftTab)
  const duplicateDraftTab = useRequestStore((s) => s.duplicateDraftTab)
  const renameDraftTab = useRequestStore((s) => s.renameDraftTab)

  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="flex h-9 shrink-0 items-center gap-1 border-b bg-muted/30 px-1">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {draftOrder.map((id) => {
          const draft = drafts[id]
          if (!draft) return null
          const isActive = id === activeDraftId
          return (
            <div
              key={id}
              onClick={() => setActiveDraftTab(id)}
              onDoubleClick={() => setEditingId(id)}
              className={cn(
                'group flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-xs',
                isActive
                  ? 'border-border bg-background'
                  : 'border-transparent hover:bg-background/60',
              )}
            >
              {editingId === id ? (
                <InlineEdit
                  aria-label="Rename request"
                  initial={draft.name}
                  onCommit={(name) => {
                    setEditingId(null)
                    if (name.trim()) renameDraftTab(id, name.trim())
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <span className="max-w-40 truncate">
                  <span
                    className={cn(
                      'mr-1 font-mono font-semibold',
                      draft.method === 'GET' && 'text-success',
                      draft.method === 'POST' && 'text-warning',
                      draft.method === 'DELETE' && 'text-destructive',
                    )}
                  >
                    {draft.method}
                  </span>
                  {draft.name}
                </span>
              )}
              <button
                type="button"
                aria-label={`Close ${draft.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  closeDraftTab(id)
                }}
                className={cn(
                  'flex size-4 items-center justify-center rounded-sm hover:bg-muted-foreground/20',
                  isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-70',
                )}
              >
                <X className="size-3" />
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex shrink-0 items-center">
        <ToolbarButton
          label="Duplicate request"
          onClick={() => duplicateDraftTab(activeDraftId)}
        >
          <Copy />
        </ToolbarButton>
        <ToolbarButton label="New request" onClick={() => createDraftTab()}>
          <Plus />
        </ToolbarButton>
      </div>
    </div>
  )
}
