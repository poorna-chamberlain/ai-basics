import { useEffect, useState } from 'react'
import type { AppInfo } from '@shared/ipc'

/**
 * Drives `data-theme` and `data-surface` on <html>.
 *
 * The main process sets `nativeTheme.themeSource` from the user's preference,
 * so `prefers-color-scheme` here already reflects "system", "light" or "dark" —
 * the renderer just has to follow it.
 */
export function useTheme(appInfo: AppInfo | null): 'light' | 'dark' {
  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (): void => setResolved(media.matches ? 'dark' : 'light')

    media.addEventListener('change', apply)
    // Re-read after subscribing: a change landing between the initial render
    // and this effect would otherwise be missed for good.
    apply()
    // The OS-level notification can land before the media query updates.
    const off = window.quickImage.onThemeUpdated(({ shouldUseDarkColors }) =>
      setResolved(shouldUseDarkColors ? 'dark' : 'light')
    )

    return () => {
      media.removeEventListener('change', apply)
      off()
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset['theme'] = resolved
  }, [resolved])

  useEffect(() => {
    if (appInfo) document.documentElement.dataset['surface'] = appInfo.surfaceMode
  }, [appInfo])

  return resolved
}
