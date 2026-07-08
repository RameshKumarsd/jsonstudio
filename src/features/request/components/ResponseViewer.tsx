import { Copy, FileOutput } from 'lucide-react'
import { toast } from 'sonner'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RouteLoader } from '@/components/common/RouteLoader'
import { copyToClipboard } from '@/lib/browser/clipboard'
import { formatBytes } from '@/features/tools/lib/statistics'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useRequestStore } from '@/stores/requestStore'
import { cn } from '@/lib/utils'

function tryPrettyPrint(body: string, contentType: string | null): string {
  if (!contentType?.includes('json')) return body
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
}

function statusColor(status: number): string {
  if (status >= 500) return 'text-destructive'
  if (status >= 400) return 'text-warning'
  if (status >= 200) return 'text-success'
  return 'text-muted-foreground'
}

/** Displays the most recent response: status, timing, size, body, and headers. */
export function ResponseViewer() {
  const response = useRequestStore((s) => s.lastResponse)
  const createDocument = useWorkspaceStore((s) => s.createDocument)

  if (!response) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Send a request to see the response here.
      </div>
    )
  }

  const bodyText = tryPrettyPrint(response.body, response.contentType)

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center gap-3 border-b px-3 text-xs">
        <span className={cn('font-semibold', statusColor(response.status))}>
          {response.status} {response.statusText}
        </span>
        <span className="text-muted-foreground">
          {Math.round(response.durationMs)} ms
        </span>
        <span className="text-muted-foreground">
          {formatBytes(response.sizeBytes)}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              createDocument({ name: 'response.json', content: bodyText })
              toast.success('Opened in editor')
            }}
          >
            <FileOutput /> Open in editor
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Copy response"
            onClick={() => {
              void copyToClipboard(bodyText)
              toast.success('Copied response')
            }}
          >
            <Copy />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="body" className="min-h-0 flex-1">
        <TabsList className="mx-3 mt-2 w-fit">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">
            Headers ({Object.keys(response.headers).length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="body" className="min-h-0">
          <Editor
            language="json"
            value={bodyText}
            loading={<RouteLoader />}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              fontSize: 13,
            }}
          />
        </TabsContent>
        <TabsContent value="headers" className="overflow-auto p-3">
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(response.headers).map(([key, value]) => (
                <tr key={key} className="border-b">
                  <td className="py-1 pr-3 font-mono text-muted-foreground">
                    {key}
                  </td>
                  <td className="py-1 font-mono break-all">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
