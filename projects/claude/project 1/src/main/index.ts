import { app, nativeTheme, Tray } from 'electron'
import { registerIpc } from './ipc'
import { Overlay, preloadPath, resolveRendererTarget } from './overlay'
import { registerAppScheme, serveRenderer } from './protocol'
import { HotkeyManager } from './shortcuts'
import { createTray, refreshTray } from './tray'
import { Store } from './store'
import { DEFAULT_SETTINGS, type Settings } from '@shared/types'

/**
 * QuickImage main process.
 *
 * The app is a background agent: no dock icon, no ordinary window. It lives in
 * the tray and shows a single overlay panel when the global hotkey fires.
 */

registerAppScheme()

// A second instance would fight over the global shortcut and the data file.
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

let overlay: Overlay | null = null
let tray: Tray | null = null
let hotkeys: HotkeyManager | null = null

app.on('second-instance', () => overlay?.show())

/**
 * Local-development convenience: `.env` can supply Google credentials so they
 * do not have to be typed into Settings on every fresh profile. Values already
 * saved in Settings always win, and nothing is ever written to the repo.
 */
function seedGoogleCredentialsFromEnv(store: Store): void {
  const apiKey = import.meta.env['MAIN_VITE_GOOGLE_API_KEY']?.trim()
  const cx = import.meta.env['MAIN_VITE_GOOGLE_CX']?.trim()
  if (!apiKey && !cx) return

  const current = store.getSettings()
  const patch: Partial<Settings> = {}
  if (apiKey && !current.googleApiKey) patch.googleApiKey = apiKey
  if (cx && !current.googleCx) patch.googleCx = cx
  if (Object.keys(patch).length > 0) store.updateSettings(patch)
}

async function bootstrap(): Promise<void> {
  // Accessory app: keep QuickImage out of the dock and the alt-tab switcher.
  if (process.platform === 'darwin') app.dock?.hide()

  serveRenderer()

  const store = new Store()
  seedGoogleCredentialsFromEnv(store)
  const settings = store.getSettings()

  nativeTheme.themeSource = settings.theme

  overlay = new Overlay(preloadPath(), resolveRendererTarget())
  overlay.create()

  hotkeys = new HotkeyManager(() => overlay?.toggle())
  const registration = hotkeys.register(settings.hotkey)
  if (!registration.ok) {
    console.warn(`[quickimage] ${registration.error ?? 'hotkey registration failed'}`)
    // Persist the fallback so Settings shows what is really bound.
    store.updateSettings({ hotkey: hotkeys.accelerator ?? DEFAULT_SETTINGS.hotkey })
  }

  registerIpc({
    store,
    overlay,
    hotkeys,
    onHotkeyChanged: () => refreshTray(tray)
  })

  tray = createTray(
    {
      onToggle: () => overlay?.toggle(),
      onOpenSettings: () => {
        overlay?.show()
        overlay?.browserWindow?.webContents.send('overlay:open-settings')
      },
      onQuit: () => {
        store.persistNow()
        app.quit()
      }
    },
    () => hotkeys?.accelerator ?? null
  )

  // Re-emit OS theme flips so the renderer can react without polling.
  nativeTheme.on('updated', () => {
    overlay?.browserWindow?.webContents.send('theme:updated', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors
    })
  })
}

app.whenReady().then(bootstrap)

// The overlay closing is normal operation, not a reason to exit.
app.on('window-all-closed', () => {
  // Intentionally empty: QuickImage keeps running in the tray.
})

app.on('will-quit', () => {
  hotkeys?.unregisterAll()
  tray?.destroy()
  overlay?.destroy()
})
