import type { ImageResult, SearchResponse, Settings } from '../types'
import { SearchError, type HttpClient, type ImageSearchProvider } from './types'

/**
 * Openverse — 800M+ openly licensed images, no key needed for anonymous use.
 *
 * Anonymous access is rate limited and the public API has noticeably patchy
 * uptime, so `autoFallback` in settings lets a failed Openverse query fall
 * through to Wikimedia Commons instead of showing the user an error.
 */

interface OpenverseItem {
  id: string
  title?: string
  url?: string
  thumbnail?: string
  width?: number
  height?: number
  creator?: string
  license?: string
  license_version?: string
  foreign_landing_url?: string
  filetype?: string
}

interface OpenverseResponse {
  result_count?: number
  page_count?: number
  page?: number
  results?: OpenverseItem[]
  detail?: string
}

const ENDPOINT = 'https://api.openverse.org/v1/images/'
const PAGE_SIZE = 40

export class OpenverseProvider implements ImageSearchProvider {
  readonly id = 'openverse' as const
  readonly label = 'Openverse'
  readonly description = 'Openly licensed media from across the web. No API key required.'
  readonly requiresKey = false
  readonly pageSize = PAGE_SIZE

  constructor(private readonly http: HttpClient) {}

  isConfigured(): boolean {
    return true
  }

  async search(
    query: string,
    page: number,
    _settings: Settings,
    signal?: AbortSignal
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      page: String(Math.max(1, page)),
      page_size: String(PAGE_SIZE),
      // Only formats the canvas/editor pipeline can decode.
      extension: 'jpg,png,webp',
      mature: 'false'
    })

    let data: OpenverseResponse
    try {
      data = await this.http.getJson<OpenverseResponse>(`${ENDPOINT}?${params.toString()}`, {
        // Openverse frequently stalls rather than erroring, so fail fast enough
        // that the fallback provider still feels instant.
        timeoutMs: 8_000,
        signal
      })
    } catch (error) {
      throw this.toSearchError(error)
    }

    const items = data.results ?? []
    const results: ImageResult[] = []
    for (const item of items) {
      const full = item.url
      if (!full) continue
      results.push({
        id: `openverse:${item.id}`,
        thumbnailUrl: item.thumbnail ?? full,
        fullUrl: full,
        title: item.title?.trim() || 'Untitled',
        width: item.width ?? null,
        height: item.height ?? null,
        creator: item.creator?.trim() || null,
        license: formatLicense(item.license, item.license_version),
        sourcePageUrl: item.foreign_landing_url ?? null,
        providerId: this.id
      })
    }

    const pageCount = data.page_count ?? 0
    return {
      results,
      totalCount: typeof data.result_count === 'number' ? data.result_count : null,
      hasMore: page < pageCount,
      servedBy: this.id
    }
  }

  private toSearchError(error: unknown): SearchError {
    if (error instanceof SearchError) return error
    const status = (error as { status?: number } | null)?.status
    if (status === 429) {
      return new SearchError(
        'rate_limit',
        this.id,
        'Openverse rate limit reached. Try again shortly.',
        { status }
      )
    }
    if (status === 401 || status === 403) {
      return new SearchError('unauthorized', this.id, 'Openverse rejected the request.', { status })
    }
    return new SearchError('network', this.id, 'Openverse is not responding.', { cause: error })
  }
}

function formatLicense(license?: string, version?: string): string | null {
  if (!license) return null
  const name = license.toUpperCase().replace(/_/g, '-')
  // `cc0` has no meaningful version suffix to show.
  if (name === 'CC0') return 'CC0'
  return version ? `${name} ${version}` : name
}
