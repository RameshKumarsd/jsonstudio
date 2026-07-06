import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * App-wide error boundary. Catches render-time errors so a single broken
 * feature never blanks the whole studio.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled error in JSON Studio:', error, info.componentStack)
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) return this.props.fallback(error, this.reset)

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {error.message}
          </p>
        </div>
        <Button onClick={this.reset}>Try again</Button>
      </div>
    )
  }
}
