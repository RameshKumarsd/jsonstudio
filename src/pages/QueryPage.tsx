import { MonacoProvider } from '@/app/providers/MonacoProvider'
import { QueryView } from '@/features/query/components/QueryView'

/**
 * Run JSONPath queries against the active document. MonacoProvider scopes Monaco
 * setup to this route.
 */
export function QueryPage() {
  return (
    <MonacoProvider>
      <QueryView />
    </MonacoProvider>
  )
}
