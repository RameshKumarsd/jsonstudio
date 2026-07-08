import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createKeyValueEntry } from '@/features/request/lib/defaults'
import type { KeyValueEntry } from '@/features/request/types'

interface KeyValueEditorProps {
  entries: KeyValueEntry[]
  onChange: (entries: KeyValueEntry[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

/** Editable key/value/enabled rows, shared by the Params and Headers tabs. */
export function KeyValueEditor({
  entries,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
  const update = (id: string, patch: Partial<KeyValueEntry>) =>
    onChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    )

  const remove = (id: string) =>
    onChange(entries.filter((entry) => entry.id !== id))

  const add = () => onChange([...entries, createKeyValueEntry()])

  return (
    <div className="space-y-1 p-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={entry.enabled}
            onChange={(event) =>
              update(entry.id, { enabled: event.target.checked })
            }
            aria-label="Enabled"
          />
          <Input
            value={entry.key}
            placeholder={keyPlaceholder}
            onChange={(event) => update(entry.id, { key: event.target.value })}
            className="h-8 flex-1 font-mono text-xs"
          />
          <Input
            value={entry.value}
            placeholder={valuePlaceholder}
            onChange={(event) =>
              update(entry.id, { value: event.target.value })
            }
            className="h-8 flex-1 font-mono text-xs"
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Remove row"
            onClick={() => remove(entry.id)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add}>
        <Plus /> Add
      </Button>
    </div>
  )
}
