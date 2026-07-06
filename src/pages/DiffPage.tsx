import { MonacoProvider } from '@/app/providers/MonacoProvider'
import { DiffView } from '@/features/diff/components/DiffView'

/**
 * Compare two JSON documents side by side with a structural change summary.
 * MonacoProvider scopes Monaco setup to this route.
 */
export function DiffPage() {
  return (
    <MonacoProvider>
      <DiffView />
    </MonacoProvider>
  )
}
