import { Loader2 } from 'lucide-react'

/**
 * Fallback shown while a lazily-loaded route chunk is fetched.
 */
export function RouteLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
