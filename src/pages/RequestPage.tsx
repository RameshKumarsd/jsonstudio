import { MonacoProvider } from '@/app/providers/MonacoProvider'
import { RequestClient } from '@/features/request/components/RequestClient'

/**
 * Postman-style HTTP request client: build, send, and inspect requests.
 * MonacoProvider scopes Monaco setup to this route (body/response editors).
 */
export function RequestPage() {
  return (
    <MonacoProvider>
      <RequestClient />
    </MonacoProvider>
  )
}
