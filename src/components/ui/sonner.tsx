import type { CSSProperties } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'

/**
 * Sonner toaster wired to the app theme. (The stock shadcn version reads
 * next-themes; JSON Studio owns theme state itself.)
 */
function Toaster(props: ToasterProps) {
  const theme = useResolvedTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      richColors
      closeButton
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
