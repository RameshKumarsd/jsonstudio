import { useMemo, useState } from 'react'
import { FileOutput } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { decodeJwt } from '@/features/tools/lib/jwt'
import { cn } from '@/lib/utils'

function formatExpiry(expiresAt: Date | null, isExpired: boolean): string {
  if (!expiresAt) return 'No expiration claim'
  const diffMs = Math.abs(expiresAt.getTime() - Date.now())
  const minutes = Math.round(diffMs / 60_000)
  const hours = Math.round(diffMs / 3_600_000)
  const days = Math.round(diffMs / 86_400_000)
  const magnitude =
    days >= 1 ? `${days}d` : hours >= 1 ? `${hours}h` : `${minutes}m`
  return isExpired ? `Expired ${magnitude} ago` : `Expires in ${magnitude}`
}

/** Paste a JWT and see its decoded header/payload as JSON (does not verify
 * the signature — this is an inspection tool, not an auth check). */
export function JwtDecoderPanel() {
  const [token, setToken] = useState('')
  const createDocument = useWorkspaceStore((s) => s.createDocument)

  const decoded = useMemo(
    () => (token.trim() ? decodeJwt(token.trim()) : null),
    [token],
  )

  return (
    <div className="space-y-2">
      <textarea
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="Paste a JWT (eyJhbGc...)"
        rows={3}
        spellCheck={false}
        className="w-full resize-none rounded-md border border-input bg-background p-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      />

      {decoded && !decoded.ok && (
        <p className="text-xs text-destructive">{decoded.error}</p>
      )}

      {decoded && decoded.ok && (
        <div className="space-y-2">
          <p
            className={cn(
              'text-xs font-medium',
              decoded.value.isExpired ? 'text-destructive' : 'text-success',
            )}
          >
            {formatExpiry(decoded.value.expiresAt, decoded.value.isExpired)}
          </p>

          <div>
            <span className="text-[11px] text-muted-foreground">Header</span>
            <pre className="mt-1 max-h-32 overflow-auto rounded-md border bg-muted/30 p-2 text-xs">
              {JSON.stringify(decoded.value.header, null, 2)}
            </pre>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground">Payload</span>
            <pre className="mt-1 max-h-48 overflow-auto rounded-md border bg-muted/30 p-2 text-xs">
              {JSON.stringify(decoded.value.payload, null, 2)}
            </pre>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              createDocument({
                name: 'jwt-payload.json',
                content: JSON.stringify(decoded.value.payload, null, 2),
              })
              toast.success('Payload opened in a new tab')
            }}
          >
            <FileOutput /> Open payload in editor
          </Button>
        </div>
      )}
    </div>
  )
}
