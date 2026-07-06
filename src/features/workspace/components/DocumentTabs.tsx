import { useState } from 'react'
import { Copy, Plus, X } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { InlineEdit } from '@/components/common/InlineEdit'
import { ToolbarButton } from '@/components/common/ToolbarButton'
import { cn } from '@/lib/utils'

/**
 * Tabbed document strip: switch, rename (double-click), close, and create
 * documents. Backed by the persisted workspace store.
 */
export function DocumentTabs() {
  const documents = useWorkspaceStore((s) => s.documents)
  const order = useWorkspaceStore((s) => s.order)
  const activeId = useWorkspaceStore((s) => s.activeId)
  const setActive = useWorkspaceStore((s) => s.setActive)
  const closeDocument = useWorkspaceStore((s) => s.closeDocument)
  const createDocument = useWorkspaceStore((s) => s.createDocument)
  const duplicateDocument = useWorkspaceStore((s) => s.duplicateDocument)
  const renameDocument = useWorkspaceStore((s) => s.renameDocument)

  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="flex h-9 shrink-0 items-center gap-1 border-b bg-muted/30 px-1">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {order.map((id) => {
          const doc = documents[id]
          if (!doc) return null
          const isActive = id === activeId
          return (
            <div
              key={id}
              onClick={() => setActive(id)}
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
                  aria-label="Rename document"
                  initial={doc.name}
                  onCommit={(name) => {
                    setEditingId(null)
                    if (name.trim()) renameDocument(id, name.trim())
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <span className="max-w-40 truncate">{doc.name}</span>
              )}
              <button
                type="button"
                aria-label={`Close ${doc.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  closeDocument(id)
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
          label="Duplicate document"
          onClick={() => duplicateDocument(activeId)}
        >
          <Copy />
        </ToolbarButton>
        <ToolbarButton label="New document" onClick={() => createDocument()}>
          <Plus />
        </ToolbarButton>
      </div>
    </div>
  )
}
