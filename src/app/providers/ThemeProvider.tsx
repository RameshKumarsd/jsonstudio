import { useEffect, type ReactNode } from 'react'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'

/**
 * Applies the resolved theme to the document root by toggling the `.dark`
 * class, which drives every design token (shadcn, Tailwind, and — via
 * MonacoProvider — the editor).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const resolvedTheme = useResolvedTheme()

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  return children
}
