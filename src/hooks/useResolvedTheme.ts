import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

export type ResolvedTheme = 'light' | 'dark'

const MEDIA_QUERY = '(prefers-color-scheme: dark)'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
}

/**
 * Resolve the user's theme preference into a concrete 'light' | 'dark' value,
 * reacting to OS changes when the mode is 'system'.
 */
export function useResolvedTheme(): ResolvedTheme {
  const theme = useSettingsStore((state) => state.theme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  useEffect(() => {
    const media = window.matchMedia(MEDIA_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return theme === 'system' ? systemTheme : theme
}
