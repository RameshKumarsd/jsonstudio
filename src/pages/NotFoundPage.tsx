import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/app/router/routes'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist."
      action={
        <Button asChild>
          <Link to={ROUTES.editor}>Go to editor</Link>
        </Button>
      }
    />
  )
}
