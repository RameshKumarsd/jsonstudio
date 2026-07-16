import { useState, type ClipboardEvent } from 'react'
import {
  ChevronDown,
  FileInput,
  Loader2,
  Save,
  Send,
  Terminal,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ToolbarButton } from '@/components/common/ToolbarButton'
import { copyToClipboard } from '@/lib/browser/clipboard'
import { toCurl } from '@/features/request/lib/curl'
import { parseCurl } from '@/features/request/lib/parseCurl'
import { selectActiveDraft, useRequestStore } from '@/stores/requestStore'
import { useSendRequest } from '@/features/request/hooks/useSendRequest'
import { SaveRequestDialog } from '@/features/request/components/SaveRequestDialog'
import { ImportCurlDialog } from '@/features/request/components/ImportCurlDialog'
import type { HttpMethod } from '@/features/request/types'

const METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]

const METHOD_COLOR: Record<HttpMethod, string> = {
  GET: 'text-success',
  POST: 'text-warning',
  PUT: 'text-primary',
  PATCH: 'text-primary',
  DELETE: 'text-destructive',
  HEAD: 'text-muted-foreground',
  OPTIONS: 'text-muted-foreground',
}

/** Method picker, URL input, and the primary request actions. */
export function RequestBar() {
  const draft = useRequestStore(selectActiveDraft)
  const updateDraft = useRequestStore((s) => s.updateDraft)
  const sendRequest = useSendRequest()
  const [saveOpen, setSaveOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const send = () => {
    if (draft.url.trim()) sendRequest.mutate(draft)
  }

  /**
   * Pasting a full curl command into the URL bar imports it directly
   * (method, headers, auth, body, ...) instead of pasting it as a literal
   * URL — mirroring Postman's "paste cURL in the request bar to import".
   */
  const handleUrlPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text')
    if (!/^\s*curl\s/i.test(pasted)) return

    event.preventDefault()
    const result = parseCurl(pasted)
    if (!result.ok) {
      toast.error('Could not parse pasted curl command', {
        description: result.error,
      })
      return
    }
    updateDraft(result.value)
    toast.success('Imported from curl')
  }

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-24 justify-between">
            <span className={METHOD_COLOR[draft.method]}>{draft.method}</span>
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {METHODS.map((method) => (
            <DropdownMenuItem
              key={method}
              onSelect={() => updateDraft({ method })}
            >
              <span className={METHOD_COLOR[method]}>{method}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Input
        value={draft.url}
        placeholder="https://api.example.com/resource (paste a curl command to import it)"
        onChange={(event) => updateDraft({ url: event.target.value })}
        onKeyDown={(event) => {
          if (event.key === 'Enter') send()
        }}
        onPaste={handleUrlPaste}
        className="flex-1 font-mono"
      />

      <Button
        onClick={send}
        disabled={!draft.url.trim() || sendRequest.isPending}
      >
        {sendRequest.isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Send />
        )}
        Send
      </Button>

      <Button variant="outline" onClick={() => setSaveOpen(true)}>
        <Save /> Save
      </Button>

      <ToolbarButton
        label="Import from cURL"
        onClick={() => setImportOpen(true)}
      >
        <FileInput />
      </ToolbarButton>

      <ToolbarButton
        label="Copy as cURL"
        onClick={() => {
          void copyToClipboard(toCurl(draft))
          toast.success('Copied as cURL')
        }}
      >
        <Terminal />
      </ToolbarButton>

      <SaveRequestDialog open={saveOpen} onOpenChange={setSaveOpen} />
      <ImportCurlDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
