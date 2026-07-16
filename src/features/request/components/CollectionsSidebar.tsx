import { useState } from 'react'
import { toast } from 'sonner'
import {
  Folder,
  FolderPlus,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InlineEdit } from '@/components/common/InlineEdit'
import { useRequestStore } from '@/stores/requestStore'
import { pickTextFile } from '@/lib/browser/file'
import { parsePostmanCollection } from '@/features/request/lib/postmanCollection'
import { EnvironmentDialog } from '@/features/request/components/EnvironmentDialog'
import { cn } from '@/lib/utils'

interface RequestRowProps {
  name: string
  active: boolean
  onClick: () => void
  onDelete: () => void
}

function RequestRow({ name, active, onClick, onDelete }: RequestRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs',
        active ? 'bg-accent' : 'hover:bg-accent/60',
      )}
    >
      <span className="flex-1 truncate">{name}</span>
      <button
        type="button"
        aria-label={`Delete ${name}`}
        onClick={(event) => {
          event.stopPropagation()
          onDelete()
        }}
        className="text-muted-foreground opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  )
}

/**
 * Left rail for the request client: saved collections/requests (or send
 * history, toggled), Postman collection import, and the CORS proxy-prefix
 * field.
 */
export function CollectionsSidebar() {
  const requests = useRequestStore((s) => s.requests)
  const collections = useRequestStore((s) => s.collections)
  const collectionOrder = useRequestStore((s) => s.collectionOrder)
  const history = useRequestStore((s) => s.history)
  const draft = useRequestStore((s) => s.draft)
  const proxyPrefix = useRequestStore((s) => s.proxyPrefix)
  const environments = useRequestStore((s) => s.environments)
  const environmentOrder = useRequestStore((s) => s.environmentOrder)
  const activeEnvironmentId = useRequestStore((s) => s.activeEnvironmentId)
  const setActiveEnvironment = useRequestStore((s) => s.setActiveEnvironment)

  const createCollection = useRequestStore((s) => s.createCollection)
  const renameCollection = useRequestStore((s) => s.renameCollection)
  const deleteCollection = useRequestStore((s) => s.deleteCollection)
  const deleteRequest = useRequestStore((s) => s.deleteRequest)
  const loadRequest = useRequestStore((s) => s.loadRequest)
  const loadFromHistory = useRequestStore((s) => s.loadFromHistory)
  const clearHistory = useRequestStore((s) => s.clearHistory)
  const setProxyPrefix = useRequestStore((s) => s.setProxyPrefix)
  const importRequests = useRequestStore((s) => s.importRequests)

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [environmentDialogOpen, setEnvironmentDialogOpen] = useState(false)

  const inAnyCollection = new Set(
    collectionOrder.flatMap((id) => collections[id]?.requestIds ?? []),
  )
  const unsorted = Object.values(requests).filter(
    (r) => !inAnyCollection.has(r.id),
  )

  const importPostmanCollection = async () => {
    const picked = await pickTextFile('.json,application/json')
    if (!picked) return

    const result = parsePostmanCollection(picked.content)
    if (!result.ok) {
      toast.error('Could not import collection', { description: result.error })
      return
    }

    importRequests(result.value.name, result.value.requests)
    toast.success(
      `Imported ${result.value.requests.length} request${result.value.requests.length === 1 ? '' : 's'}`,
      result.value.skippedCount > 0
        ? {
            description: `${result.value.skippedCount} used an unsupported auth/body type and imported partially.`,
          }
        : undefined,
    )
  }

  if (collapsed) {
    return (
      <div className="flex h-full w-10 shrink-0 flex-col items-center gap-1 border-r py-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Expand sidebar"
          onClick={() => setCollapsed(false)}
        >
          <PanelLeftOpen className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={showHistory ? 'Show collections' : 'Show history'}
          onClick={() => setShowHistory((v) => !v)}
        >
          <History className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Manage environments"
          onClick={() => setEnvironmentDialogOpen(true)}
        >
          <Settings2 className="size-3.5" />
        </Button>
        <EnvironmentDialog
          open={environmentDialogOpen}
          onOpenChange={setEnvironmentDialogOpen}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between border-b p-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase">
          {showHistory ? 'History' : 'Collections'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label={showHistory ? 'Show collections' : 'Show history'}
            onClick={() => setShowHistory((v) => !v)}
          >
            <History className="size-3.5" />
          </Button>
          {!showHistory && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                aria-label="Import Postman collection"
                onClick={() => void importPostmanCollection()}
              >
                <Upload className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                aria-label="New collection"
                onClick={() => createCollection('New collection')}
              >
                <FolderPlus className="size-3.5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label="Collapse sidebar"
            onClick={() => setCollapsed(true)}
          >
            <PanelLeftClose className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2">
        {showHistory ? (
          <div className="space-y-1">
            {history.length === 0 && (
              <p className="p-2 text-xs text-muted-foreground">
                No requests sent yet.
              </p>
            )}
            {history.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => loadFromHistory(entry.id)}
                className="flex w-full flex-col items-start rounded-md px-2 py-1 text-left text-xs hover:bg-accent/60"
              >
                <span className="flex w-full items-center gap-1.5">
                  <span className="font-mono font-semibold">
                    {entry.request.method}
                  </span>
                  <span className="flex-1 truncate">
                    {entry.request.url || '(empty URL)'}
                  </span>
                </span>
                <span
                  className={cn(
                    'text-[10px]',
                    entry.status && entry.status < 400
                      ? 'text-success'
                      : 'text-destructive',
                  )}
                >
                  {entry.status ?? 'failed'}
                </span>
              </button>
            ))}
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="w-full"
              >
                Clear history
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {collectionOrder.map((id) => {
              const collection = collections[id]
              if (!collection) return null
              return (
                <div key={id}>
                  <div className="group flex items-center gap-1 px-1">
                    <Folder className="size-3.5 shrink-0 text-muted-foreground" />
                    {renamingId === id ? (
                      <InlineEdit
                        aria-label="Rename collection"
                        initial={collection.name}
                        onCommit={(name) => {
                          setRenamingId(null)
                          if (name.trim()) renameCollection(id, name.trim())
                        }}
                        onCancel={() => setRenamingId(null)}
                      />
                    ) : (
                      <span
                        onDoubleClick={() => setRenamingId(id)}
                        className="flex-1 truncate text-xs font-medium"
                      >
                        {collection.name}
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Delete ${collection.name}`}
                      onClick={() => deleteCollection(id)}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                  <div className="mt-1 space-y-0.5 pl-4">
                    {collection.requestIds.map((reqId) => {
                      const request = requests[reqId]
                      if (!request) return null
                      return (
                        <RequestRow
                          key={reqId}
                          name={request.name}
                          active={draft.id === reqId}
                          onClick={() => loadRequest(reqId)}
                          onDelete={() => deleteRequest(reqId)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {unsorted.length > 0 && (
              <div>
                <div className="px-1 text-xs font-medium text-muted-foreground">
                  Unsorted
                </div>
                <div className="mt-1 space-y-0.5">
                  {unsorted.map((request) => (
                    <RequestRow
                      key={request.id}
                      name={request.name}
                      active={draft.id === request.id}
                      onClick={() => loadRequest(request.id)}
                      onDelete={() => deleteRequest(request.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {collectionOrder.length === 0 && unsorted.length === 0 && (
              <p className="p-2 text-xs text-muted-foreground">
                No saved requests yet. Build a request and click Save.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1 border-t p-2">
        <label className="text-[11px] text-muted-foreground">
          Environment
        </label>
        <div className="flex items-center gap-1">
          <select
            value={activeEnvironmentId ?? ''}
            onChange={(event) =>
              setActiveEnvironment(event.target.value || null)
            }
            className="h-7 w-full rounded-md border border-input bg-transparent px-2 text-[11px]"
          >
            <option value="">No environment</option>
            {environmentOrder.map((id) => (
              <option key={id} value={id}>
                {environments[id]?.name}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label="Manage environments"
            onClick={() => setEnvironmentDialogOpen(true)}
          >
            <Settings2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 border-t p-2">
        <label className="text-[11px] text-muted-foreground">
          CORS proxy (optional)
        </label>
        <Input
          value={proxyPrefix}
          placeholder="https://corsproxy.io/?{url}"
          onChange={(event) => setProxyPrefix(event.target.value)}
          className="h-7 font-mono text-[11px]"
        />
      </div>

      <EnvironmentDialog
        open={environmentDialogOpen}
        onOpenChange={setEnvironmentDialogOpen}
      />
    </div>
  )
}
