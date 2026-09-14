import { contextBridge, ipcRenderer } from 'electron'
import { IPC, IPC_EVENTS, type AppInfo, type HotkeyUpdateResult, type IpcResult } from '@shared/ipc'
import type {
  FetchedImage,
  HistoryImage,
  HistoryState,
  ProviderStatus,
  SearchResponse,
  Settings
} from '@shared/types'

/**
 * The only surface the renderer gets. Node stays off in the renderer and
 * `contextIsolation` is on, so everything crosses through this explicit,
 * hand-written API — no `ipcRenderer` escape hatch is exposed.
 */

/** Subscribes to a main-process event and returns an unsubscribe function. */
function on<T>(channel: string, handler: (payload: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T): void => handler(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const api = {
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IPC.appInfo),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC.openExternal, url),

  getSettings: (): Promise<Settings> => ipcRenderer.invoke(IPC.settingsGet),
  updateSettings: (
    patch: Partial<Settings>
  ): Promise<{ settings: Settings; hotkey: HotkeyUpdateResult }> =>
    ipcRenderer.invoke(IPC.settingsUpdate, patch),

  listProviders: (): Promise<ProviderStatus[]> => ipcRenderer.invoke(IPC.providersList),
  search: (query: string, page: number): Promise<IpcResult<SearchResponse>> =>
    ipcRenderer.invoke(IPC.searchRun, { query, page }),

  fetchImage: (url: string): Promise<IpcResult<FetchedImage>> =>
    ipcRenderer.invoke(IPC.imageFetch, url),
  copyImageToClipboard: (dataUrl: string): Promise<IpcResult<boolean>> =>
    ipcRenderer.invoke(IPC.clipboardWriteImage, dataUrl),

  getHistory: (): Promise<HistoryState> => ipcRenderer.invoke(IPC.historyGet),
  addHistoryQuery: (query: string): Promise<HistoryState> =>
    ipcRenderer.invoke(IPC.historyAddQuery, query),
  addHistoryImage: (image: HistoryImage): Promise<HistoryState> =>
    ipcRenderer.invoke(IPC.historyAddImage, image),
  removeHistoryImage: (id: string): Promise<HistoryState> =>
    ipcRenderer.invoke(IPC.historyRemoveImage, id),
  clearHistory: (): Promise<HistoryState> => ipcRenderer.invoke(IPC.historyClear),

  hideOverlay: (): void => ipcRenderer.send(IPC.overlayHide),
  setOverlayHeight: (height: number): void => ipcRenderer.send(IPC.overlaySetHeight, height),

  onShown: (handler: () => void): (() => void) => on(IPC_EVENTS.shown, handler),
  onHidden: (handler: () => void): (() => void) => on(IPC_EVENTS.hidden, handler),
  onOpenSettings: (handler: () => void): (() => void) => on(IPC_EVENTS.openSettings, handler),
  onSettingsChanged: (handler: (settings: Settings) => void): (() => void) =>
    on(IPC_EVENTS.settingsChanged, handler),
  onThemeUpdated: (handler: (payload: { shouldUseDarkColors: boolean }) => void): (() => void) =>
    on(IPC_EVENTS.themeUpdated, handler)
}

export type QuickImageApi = typeof api

contextBridge.exposeInMainWorld('quickImage', api)
