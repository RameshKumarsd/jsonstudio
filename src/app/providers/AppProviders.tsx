import type { ReactNode } from 'react'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

/**
 * Single composition point for every app-wide provider. Monaco is intentionally
 * NOT set up here — it's scoped to the editor surfaces via MonacoProvider so its
 * (large) core stays out of the initial bundle.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
