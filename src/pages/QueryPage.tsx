import { Search } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

export function QueryPage() {
  return (
    <EmptyState
      icon={Search}
      title="Query"
      description="Run JSONPath queries against your document and inspect live results. This surface is wired and ready — the query engine ships in an upcoming phase."
    />
  )
}
