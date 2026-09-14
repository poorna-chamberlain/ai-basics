import type { ProviderId, SearchErrorKind, SearchResponse, Settings } from '../types'

/**
 * Providers never call `fetch` directly. Requests are proxied through the main
 * process (see `src/main/net.ts`) so they are not subject to renderer CORS
 * rules and so every provider gets the same timeout/abort behaviour for free.
 */
export interface HttpRequestInit {
  timeoutMs?: number
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface HttpClient {
  getJson<T>(url: string, init?: HttpRequestInit): Promise<T>
}

/** Thrown by providers so the UI can distinguish rate limits from real errors. */
export class SearchError extends Error {
  readonly kind: SearchErrorKind
  readonly providerId: ProviderId
  readonly status?: number

  constructor(
    kind: SearchErrorKind,
    providerId: ProviderId,
    message: string,
    options?: { status?: number; cause?: unknown }
  ) {
    super(message, { cause: options?.cause })
    this.name = 'SearchError'
    this.kind = kind
    this.providerId = providerId
    this.status = options?.status
  }
}

/**
 * The single seam every image source implements. Adding a fourth provider means
 * writing one of these and registering it — no UI file needs to change, because
 * the settings panel and the "active provider" chip are both driven by the
 * registry's metadata.
 */
export interface ImageSearchProvider {
  readonly id: ProviderId
  /** Shown in the settings picker and the active-provider chip. */
  readonly label: string
  /** One-line explanation shown under the label in settings. */
  readonly description: string
  /** True if the provider needs user-supplied credentials before it can run. */
  readonly requiresKey: boolean
  /** Results requested per page. */
  readonly pageSize: number

  /** Whether the current settings contain everything this provider needs. */
  isConfigured(settings: Settings): boolean

  /**
   * Runs a search. `page` is 1-based.
   * Must throw `SearchError` (never a bare Error) on failure.
   */
  search(query: string, page: number, settings: Settings, signal?: AbortSignal): Promise<SearchResponse>
}
