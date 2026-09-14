import type { ProviderId, SearchErrorKind } from './types'

/** Channel names shared by the main process and the preload bridge. */
export const IPC = {
  appInfo: 'app:info',
  openExternal: 'app:open-external',

  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',

  providersList: 'providers:list',
  searchRun: 'search:run',

  imageFetch: 'image:fetch',
  clipboardWriteImage: 'clipboard:write-image',

  historyGet: 'history:get',
  historyAddQuery: 'history:add-query',
  historyAddImage: 'history:add-image',
  historyRemoveImage: 'history:remove-image',
  historyClear: 'history:clear',

  overlayHide: 'overlay:hide',
  overlaySetHeight: 'overlay:set-height'
} as const

/** Main -> renderer pushes. */
export const IPC_EVENTS = {
  shown: 'overlay:shown',
  hidden: 'overlay:hidden',
  openSettings: 'overlay:open-settings',
  settingsChanged: 'settings:changed',
  themeUpdated: 'theme:updated'
} as const

/**
 * IPC rejections lose everything but the message, so failures are returned as
 * values. This is what lets the UI tell a rate limit apart from an outage.
 */
export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { kind: SearchErrorKind; message: string; providerId?: ProviderId } }

export interface AppInfo {
  platform: NodeJS.Platform
  /** Which backdrop technique the window ended up using. */
  surfaceMode: 'vibrancy' | 'acrylic' | 'fallback'
  version: string
  isPackaged: boolean
}

export interface HotkeyUpdateResult {
  ok: boolean
  error?: string
  /** The accelerator actually in force after the update. */
  active: string | null
}
