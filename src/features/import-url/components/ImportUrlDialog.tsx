import { useState } from 'react'
import { DownloadCloud, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useImportUrl } from '@/features/import-url/hooks/useImportUrl'
import { filenameFromUrl } from '@/features/import-url/api/fetchRemoteText'

type ImportTarget = 'document' | 'schema'

/**
 * Fetch remote JSON or a JSON Schema by URL (Axios + React Query) and either
 * open it as a new document or attach it as the active document's schema.
 */
export function ImportUrlDialog() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [target, setTarget] = useState<ImportTarget>('document')

  const createDocument = useWorkspaceStore((s) => s.createDocument)
  const setSchema = useWorkspaceStore((s) => s.setSchema)
  const activeId = useWorkspaceStore((s) => s.activeId)
  const importUrl = useImportUrl()

  const submit = () => {
    const trimmed = url.trim()
    if (!trimmed) return
    importUrl.mutate(trimmed, {
      onSuccess: (text) => {
        if (target === 'schema') {
          setSchema(activeId, text)
          toast.success('Schema imported for current document')
        } else {
          createDocument({ name: filenameFromUrl(trimmed), content: text })
          toast.success('Document imported')
        }
        setOpen(false)
        setUrl('')
      },
      onError: (error) => {
        toast.error('Import failed', { description: error.message })
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Import from URL">
          <DownloadCloud />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from URL</DialogTitle>
          <DialogDescription>
            Fetch remote JSON or a JSON Schema over HTTP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            autoFocus
            value={url}
            placeholder="https://example.com/data.json"
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
          />

          <div className="flex gap-4 text-sm">
            {(['document', 'schema'] as const).map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  name="import-target"
                  checked={target === value}
                  onChange={() => setTarget(value)}
                />
                {value === 'document'
                  ? 'As new document'
                  : 'As schema for current document'}
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={importUrl.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!url.trim() || importUrl.isPending}
          >
            {importUrl.isPending && <Loader2 className="animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
