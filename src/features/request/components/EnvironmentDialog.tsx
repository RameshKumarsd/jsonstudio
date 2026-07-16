import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InlineEdit } from '@/components/common/InlineEdit'
import { KeyValueEditor } from '@/features/request/components/KeyValueEditor'
import { useRequestStore } from '@/stores/requestStore'
import { cn } from '@/lib/utils'

interface EnvironmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Create/rename/delete environments and edit each one's variables. */
export function EnvironmentDialog({
  open,
  onOpenChange,
}: EnvironmentDialogProps) {
  const environments = useRequestStore((s) => s.environments)
  const environmentOrder = useRequestStore((s) => s.environmentOrder)
  const createEnvironment = useRequestStore((s) => s.createEnvironment)
  const renameEnvironment = useRequestStore((s) => s.renameEnvironment)
  const deleteEnvironment = useRequestStore((s) => s.deleteEnvironment)
  const setEnvironmentVariables = useRequestStore(
    (s) => s.setEnvironmentVariables,
  )

  const [selectedId, setSelectedId] = useState<string | null>(
    environmentOrder[0] ?? null,
  )
  const [renamingId, setRenamingId] = useState<string | null>(null)

  const selected = selectedId ? environments[selectedId] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Environments</DialogTitle>
        </DialogHeader>

        <div className="flex h-80 gap-3">
          <div className="w-40 shrink-0 space-y-1 overflow-auto border-r pr-2">
            {environmentOrder.map((id) => {
              const env = environments[id]
              if (!env) return null
              return (
                <div
                  key={id}
                  onClick={() => setSelectedId(id)}
                  className={cn(
                    'group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs',
                    selectedId === id ? 'bg-accent' : 'hover:bg-accent/60',
                  )}
                >
                  {renamingId === id ? (
                    <InlineEdit
                      aria-label="Rename environment"
                      initial={env.name}
                      onCommit={(name) => {
                        setRenamingId(null)
                        if (name.trim()) renameEnvironment(id, name.trim())
                      }}
                      onCancel={() => setRenamingId(null)}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => setRenamingId(id)}
                      className="flex-1 truncate"
                    >
                      {env.name}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Delete ${env.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      deleteEnvironment(id)
                      if (selectedId === id) setSelectedId(null)
                    }}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setSelectedId(createEnvironment('New environment'))}
            >
              <Plus /> New
            </Button>
          </div>

          <div className="min-w-0 flex-1 overflow-auto">
            {selected ? (
              <KeyValueEditor
                entries={selected.variables}
                onChange={(variables) =>
                  setEnvironmentVariables(selected.id, variables)
                }
                keyPlaceholder="Variable"
                valuePlaceholder="Value"
              />
            ) : (
              <p className="p-2 text-xs text-muted-foreground">
                Create an environment to define variables like{' '}
                {'{{base_url}}'}, then reference them anywhere in a request.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
