import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { RouteLoader } from '@/components/common/RouteLoader'

/**
 * App frame: fixed header on top, primary nav rail on the left, routed content
 * in the remaining space. The routed area is wrapped in an error boundary so a
 * crash in one surface doesn't take down the shell.
 */
export function RootLayout() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <main className="min-w-0 flex-1 overflow-hidden">
          <ErrorBoundary>
            <Suspense fallback={<RouteLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
