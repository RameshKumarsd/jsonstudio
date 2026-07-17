import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { selectActiveDraft, useRequestStore } from '@/stores/requestStore'

interface SaveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const UNSORTED = '__unsorted__'

/** Names the draft request and optionally files it into a collection. */
export function SaveRequestDialog({
  open,
  onOpenChange,
}: SaveRequestDialogProps) {
  const draft = useRequestStore(selectActiveDraft)
  const collections = useRequestStore((s) => s.collections)
  const collectionOrder = useRequestStore((s) => s.collectionOrder)
  const createCollection = useRequestStore((s) => s.createCollection)
  const saveDraft = useRequestStore((s) => s.saveDraft)

  const [name, setName] = useState(draft.name)
  const [collectionId, setCollectionId] = useState<string>(UNSORTED)
  const [newCollectionName, setNewCollectionName] = useState('')

  const submit = () => {
    if (!name.trim()) return
    let targetId = collectionId
    if (targetId === UNSORTED && newCollectionName.trim()) {
      targetId = createCollection(newCollectionName.trim())
    }
    saveDraft(name.trim(), targetId === UNSORTED ? '' : targetId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save request</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Request name"
          />

          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value={UNSORTED}>No collection</option>
            {collectionOrder.map((id) => (
              <option key={id} value={id}>
                {collections[id]?.name}
              </option>
            ))}
          </select>

          {collectionId === UNSORTED && (
            <Input
              value={newCollectionName}
              onChange={(event) => setNewCollectionName(event.target.value)}
              placeholder="Or create a new collection (optional)"
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
