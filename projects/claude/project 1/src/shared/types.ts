/** Types shared across the main process, the preload bridge and the renderer. */

export type ProviderId = 'wikimedia' | 'openverse' | 'google'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface Settings {
  /** Accelerator string in Electron's format, e.g. `Alt+Shift+I`. */
  hotkey: string
  providerId: ProviderId
  /** When the active provider fails, silently retry with another key-less one. */
  autoFallback: boolean
  googleApiKey: string
  googleCx: string
  theme: ThemePreference
  /** Quantised model is a 44 MB download; fp16 is sharper but ~88 MB. */
  bgRemovalModel: 'isnet_quint8' | 'isnet_fp16'
  launchAtLogin: boolean
}

/** One image returned by a search provider. */
export interface ImageResult {
  id: string
  /** Small, fast-loading URL used in the results grid. */
  thumbnailUrl: string
  /** Best-quality URL, loaded only when the image is opened. */
  fullUrl: string
  title: string
  width: number | null
  height: number | null
  /** Attribution: who made it. */
  creator: string | null
  /** Human-readable licence, e.g. `CC BY 4.0`. */
  license: string | null
  /** Page a user can open to see the original in context. */
  sourcePageUrl: string | null
  providerId: ProviderId
}

export interface SearchResponse {
  results: ImageResult[]
  /** Total matches if the provider reports one. */
  totalCount: number | null
  hasMore: boolean
  /** Which provider actually served this response (may differ after fallback). */
  servedBy: ProviderId
  /** Set when `servedBy` differs from the provider the user selected. */
  fellBackFrom?: ProviderId
}

export type SearchErrorKind =
  | 'network'
  | 'rate_limit'
  | 'unauthorized'
  | 'not_configured'
  | 'unknown'

export interface HistoryQuery {
  query: string
  at: number
}

export interface HistoryImage {
  /** Stable id so repeated saves of the same image update rather than duplicate. */
  id: string
  title: string
  providerId: ProviderId
  sourcePageUrl: string | null
  /** Downscaled JPEG/PNG data URL, persisted so history survives restarts. */
  thumbnailDataUrl: string
  /** Remote original, used to re-open the editor at full resolution. */
  fullUrl: string
  /** Present once the user has edited the image (background removed/recoloured). */
  editedDataUrl?: string
  at: number
}

export interface HistoryState {
  queries: HistoryQuery[]
  images: HistoryImage[]
}

export interface ProviderStatus {
  id: ProviderId
  label: string
  description: string
  /** False until the user supplies credentials (Google). */
  configured: boolean
  requiresKey: boolean
}

/** Result of an IPC image download, base64 so it can cross the bridge. */
export interface FetchedImage {
  dataUrl: string
  mimeType: string
  byteLength: number
}

export const DEFAULT_SETTINGS: Settings = {
  hotkey: 'Alt+Shift+I',
  providerId: 'wikimedia',
  autoFallback: true,
  googleApiKey: '',
  googleCx: '',
  theme: 'system',
  bgRemovalModel: 'isnet_quint8',
  launchAtLogin: false
}
