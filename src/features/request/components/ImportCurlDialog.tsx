import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRequestStore } from '@/stores/requestStore'
import { parseCurl } from '@/features/request/lib/parseCurl'

interface ImportCurlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PLACEHOLDER = `curl -X POST https://api.example.com/things \\
  -H 'Content-Type: application/json' \\
  -d '{"a":1}'`

/** Paste a cURL command and load it as the active request draft. */
export function ImportCurlDialog({
  open,
  onOpenChange,
}: ImportCurlDialogProps) {
  const updateDraft = useRequestStore((s) => s.updateDraft)
  const [text, setText] = useState('')

  const submit = () => {
    const result = parseCurl(text)
    if (!result.ok) {
      toast.error('Could not parse curl command', { description: result.error })
      return
    }
    updateDraft(result.value)
    toast.success('Imported from curl')
    setText('')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setText('')
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from cURL</DialogTitle>
          <DialogDescription>
            Paste a curl command to load it as the current request.
          </DialogDescription>
        </DialogHeader>

        <textarea
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={PLACEHOLDER}
          rows={8}
          spellCheck={false}
          className="w-full resize-none rounded-md border border-input bg-background p-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!text.trim()}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
