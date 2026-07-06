import { useEffect, type ReactNode } from 'react'
import { monaco } from '@/lib/monaco/monaco'
import { setupMonaco } from '@/lib/monaco/setup'
import { MONACO_DARK, MONACO_LIGHT } from '@/lib/monaco/themes'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'

// Runs once when this (lazily-loaded) module is imported — before any editor
// mounts. `setupMonaco` is idempotent.
setupMonaco()

/**
 * Keeps Monaco's theme in lockstep with the app theme for every editor rendered
 * beneath it. Scoped to editor surfaces so Monaco's core stays code-split.
 */
export function MonacoProvider({ children }: { children: ReactNode }) {
  const resolvedTheme = useResolvedTheme()

  useEffect(() => {
    monaco.editor.setTheme(
      resolvedTheme === 'dark' ? MONACO_DARK : MONACO_LIGHT,
    )
  }, [resolvedTheme])

  return children
}
