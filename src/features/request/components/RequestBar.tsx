import { useState } from 'react'
import { ChevronDown, Loader2, Save, Send, Terminal } from 'lucide-react'
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
import { useRequestStore } from '@/stores/requestStore'
import { useSendRequest } from '@/features/request/hooks/useSendRequest'
import { SaveRequestDialog } from '@/features/request/components/SaveRequestDialog'
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
  const draft = useRequestStore((s) => s.draft)
  const updateDraft = useRequestStore((s) => s.updateDraft)
  const sendRequest = useSendRequest()
  const [saveOpen, setSaveOpen] = useState(false)

  const send = () => {
    if (draft.url.trim()) sendRequest.mutate(draft)
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
        placeholder="https://api.example.com/resource"
        onChange={(event) => updateDraft({ url: event.target.value })}
        onKeyDown={(event) => {
          if (event.key === 'Enter') send()
        }}
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
        label="Copy as cURL"
        onClick={() => {
          void copyToClipboard(toCurl(draft))
          toast.success('Copied as cURL')
        }}
      >
        <Terminal />
      </ToolbarButton>

      <SaveRequestDialog open={saveOpen} onOpenChange={setSaveOpen} />
    </div>
  )
}
