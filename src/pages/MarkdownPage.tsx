import { MonacoProvider } from '@/app/providers/MonacoProvider'
import { MarkdownView } from '@/features/markdown/components/MarkdownView'

/**
 * Markdown editor with a live, GFM-rendered preview. MonacoProvider scopes
 * Monaco setup to this route (only the source editor uses it).
 */
export function MarkdownPage() {
  return (
    <MonacoProvider>
      <MarkdownView />
    </MonacoProvider>
  )
}
