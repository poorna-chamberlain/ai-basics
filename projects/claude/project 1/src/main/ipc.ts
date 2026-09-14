import { BrowserWindow, ClipboardItem, app, clipboard, ipcMain, nativeImage, shell } from 'electron'
import { IPC, type AppInfo, type HotkeyUpdateResult, type IpcResult } from '@shared/ipc'
import { SearchError } from '@shared/providers/types'
import { createProviderRegistry } from '@shared/providers/registry'
import type {
  FetchedImage,
  HistoryImage,
  HistoryState,
  ProviderStatus,
  SearchResponse,
  Settings
} from '@shared/types'
import { fetchImageAsDataUrl, httpClient } from './net'
import type { Overlay } from './overlay'
import { surfaceMode } from './overlay'
import type { HotkeyManager } from './shortcuts'
import type { Store } from './store'

interface IpcDeps {
  store: Store
  overlay: Overlay
  hotkeys: HotkeyManager
  onHotkeyChanged: () => void
}

/** Wraps a handler so any throw becomes a typed `IpcResult` failure. */
function guard<A extends unknown[], T>(
  fn: (...args: A) => Promise<T> | T
): (...args: A) => Promise<IpcResult<T>> {
  return async (...args: A) => {
    try {
      return { ok: true, data: await fn(...args) }
    } catch (error) {
      if (error instanceof SearchError) {
        return {
          ok: false,
          error: { kind: error.kind, message: error.message, providerId: error.providerId }
        }
      }
      const message = error instanceof Error ? error.message : String(error)
      return { ok: false, error: { kind: 'unknown', message } }
    }
  }
}

export function registerIpc({ store, overlay, hotkeys, onHotkeyChanged }: IpcDeps): void {
  const providers = createProviderRegistry(httpClient)

  /** Cancels the previous search when a new keystroke supersedes it. */
  let inFlight: AbortController | null = null

  const broadcastSettings = (settings: Settings): void => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('settings:changed', settings)
    }
  }

  ipcMain.handle(IPC.appInfo, (): AppInfo => {
    return {
      platform: process.platform,
      surfaceMode,
      version: app.getVersion(),
      isPackaged: app.isPackaged
    }
  })

  ipcMain.handle(IPC.openExternal, async (_event, url: string) => {
    if (/^https?:\/\//i.test(url)) await shell.openExternal(url)
  })

  /* ------------------------------------------------------------ settings -- */

  ipcMain.handle(IPC.settingsGet, (): Settings => store.getSettings())

  ipcMain.handle(
    IPC.settingsUpdate,
    (_event, patch: Partial<Settings>): { settings: Settings; hotkey: HotkeyUpdateResult } => {
      const previous = store.getSettings()
      let hotkeyResult: HotkeyUpdateResult = { ok: true, active: hotkeys.accelerator }

      if (patch.hotkey && patch.hotkey !== previous.hotkey) {
        const outcome = hotkeys.register(patch.hotkey)
        hotkeyResult = { ...outcome, active: hotkeys.accelerator }
        // Persist whatever actually got registered, not what was requested, so
        // settings never advertise a shortcut that does nothing.
        patch = { ...patch, hotkey: hotkeys.accelerator ?? previous.hotkey }
        onHotkeyChanged()
      }

      if (patch.launchAtLogin !== undefined && patch.launchAtLogin !== previous.launchAtLogin) {
        app.setLoginItemSettings({ openAtLogin: patch.launchAtLogin })
      }

      const settings = store.updateSettings(patch)
      broadcastSettings(settings)
      return { settings, hotkey: hotkeyResult }
    }
  )

  /* -------------------------------------------------------------- search -- */

  ipcMain.handle(IPC.providersList, (): ProviderStatus[] => providers.describe(store.getSettings()))

  ipcMain.handle(
    IPC.searchRun,
    guard(async (_event: unknown, payload: { query: string; page: number }): Promise<SearchResponse> => {
      inFlight?.abort()
      const controller = new AbortController()
      inFlight = controller

      try {
        return await providers.search(
          payload.query,
          payload.page,
          store.getSettings(),
          controller.signal
        )
      } finally {
        if (inFlight === controller) inFlight = null
      }
    })
  )

  /* --------------------------------------------------------------- image -- */

  ipcMain.handle(
    IPC.imageFetch,
    guard((_event: unknown, url: string): Promise<FetchedImage> => fetchImageAsDataUrl(url))
  )

  ipcMain.handle(
    IPC.clipboardWriteImage,
    guard(async (_event: unknown, dataUrl: string): Promise<boolean> => {
      // Round-tripping through nativeImage both validates the data URL and
      // normalises whatever came in into a well-formed PNG.
      const image = nativeImage.createFromDataURL(dataUrl)
      if (image.isEmpty()) throw new Error('Could not read the edited image.')

      const png = new Uint8Array(image.toPNG())
      // `image/png` is the flavour every target app understands as a pasteable
      // picture — Slack, Docs, Figma and Mail all take it directly.
      await clipboard.write([
        new ClipboardItem({ 'image/png': new Blob([png], { type: 'image/png' }) })
      ])
      return true
    })
  )

  /* ------------------------------------------------------------- history -- */

  ipcMain.handle(IPC.historyGet, (): HistoryState => store.getHistory())
  ipcMain.handle(IPC.historyAddQuery, (_event, query: string): HistoryState => store.addQuery(query))
  ipcMain.handle(IPC.historyAddImage, (_event, image: HistoryImage): HistoryState =>
    store.addImage(image)
  )
  ipcMain.handle(IPC.historyRemoveImage, (_event, id: string): HistoryState => store.removeImage(id))
  ipcMain.handle(IPC.historyClear, (): HistoryState => store.clearHistory())

  /* ------------------------------------------------------------- overlay -- */

  ipcMain.on(IPC.overlayHide, () => overlay.hide())
  ipcMain.on(IPC.overlaySetHeight, (_event, height: number) => {
    if (Number.isFinite(height)) overlay.setContentHeight(height)
  })
}
