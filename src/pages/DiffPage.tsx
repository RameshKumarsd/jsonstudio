import { GitCompare } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

export function DiffPage() {
  return (
    <EmptyState
      icon={GitCompare}
      title="Diff"
      description="Compare two JSON documents side by side with a structural summary. This surface is wired and ready — the diff engine ships in an upcoming phase."
    />
  )
}
