import type { ImageResult, SearchResponse, Settings } from '../types'
import { SearchError, type HttpClient, type ImageSearchProvider } from './types'

/**
 * Google Programmable Search (Custom Search JSON API) with `searchType=image`.
 *
 * Optional upgrade: stays unusable until the user supplies both an API key and
 * a Search Engine ID. Credentials come from settings (persisted) or, in dev,
 * from `.env` — they are never hardcoded, and Google's HTML is never scraped.
 */

interface GoogleItem {
  title?: string
  link?: string
  mime?: string
  image?: {
    thumbnailLink?: string
    width?: number
    height?: number
    contextLink?: string
  }
  displayLink?: string
}

interface GoogleResponse {
  items?: GoogleItem[]
  searchInformation?: { totalResults?: string }
  queries?: { nextPage?: unknown[] }
  error?: { code?: number; message?: string; status?: string }
}

const ENDPOINT = 'https://www.googleapis.com/customsearch/v1'
/** The API hard-caps `num` at 10 and refuses `start` beyond 91. */
const PAGE_SIZE = 10
const MAX_START = 91

export class GoogleCustomSearchProvider implements ImageSearchProvider {
  readonly id = 'google' as const
  readonly label = 'Google Images'
  readonly description = 'Google Programmable Search. Requires an API key and Search Engine ID.'
  readonly requiresKey = true
  readonly pageSize = PAGE_SIZE

  constructor(private readonly http: HttpClient) {}

  isConfigured(settings: Settings): boolean {
    return settings.googleApiKey.trim().length > 0 && settings.googleCx.trim().length > 0
  }

  async search(
    query: string,
    page: number,
    settings: Settings,
    signal?: AbortSignal
  ): Promise<SearchResponse> {
    const key = settings.googleApiKey.trim()
    const cx = settings.googleCx.trim()

    if (!key || !cx) {
      throw new SearchError(
        'not_configured',
        this.id,
        'Add a Google API key and Search Engine ID in Settings to use this provider.'
      )
    }

    const start = Math.max(0, page - 1) * PAGE_SIZE + 1
    if (start > MAX_START) {
      return { results: [], totalCount: null, hasMore: false, servedBy: this.id }
    }

    const params = new URLSearchParams({
      key,
      cx,
      q: query,
      searchType: 'image',
      num: String(PAGE_SIZE),
      start: String(start),
      safe: 'active',
      imgSize: 'large'
    })

    let data: GoogleResponse
    try {
      data = await this.http.getJson<GoogleResponse>(`${ENDPOINT}?${params.toString()}`, {
        timeoutMs: 12_000,
        signal
      })
    } catch (error) {
      throw this.toSearchError(error)
    }

    if (data.error) {
      throw this.fromApiError(data.error)
    }

    const results: ImageResult[] = []
    for (const [index, item] of (data.items ?? []).entries()) {
      const link = item.link
      if (!link) continue
      results.push({
        id: `google:${start + index}:${link}`,
        thumbnailUrl: item.image?.thumbnailLink ?? link,
        fullUrl: link,
        title: item.title?.trim() || 'Untitled',
        width: item.image?.width ?? null,
        height: item.image?.height ?? null,
        creator: item.displayLink ?? null,
        license: null,
        sourcePageUrl: item.image?.contextLink ?? null,
        providerId: this.id
      })
    }

    const total = Number.parseInt(data.searchInformation?.totalResults ?? '', 10)
    return {
      results,
      totalCount: Number.isFinite(total) ? total : null,
      hasMore: Boolean(data.queries?.nextPage?.length) && start + PAGE_SIZE <= MAX_START,
      servedBy: this.id
    }
  }

  private fromApiError(error: NonNullable<GoogleResponse['error']>): SearchError {
    const message = error.message ?? 'Google Custom Search returned an error.'
    if (error.code === 429 || error.status === 'RESOURCE_EXHAUSTED') {
      return new SearchError(
        'rate_limit',
        this.id,
        'Google daily quota exhausted (free tier allows 100 searches/day).',
        { status: 429 }
      )
    }
    if (error.code === 400 || error.code === 403) {
      return new SearchError('unauthorized', this.id, message, { status: error.code })
    }
    return new SearchError('unknown', this.id, message, { status: error.code })
  }

  private toSearchError(error: unknown): SearchError {
    if (error instanceof SearchError) return error
    const status = (error as { status?: number } | null)?.status
    const body = (error as { body?: string } | null)?.body

    // Google returns its error envelope with a non-2xx status, so recover the
    // real reason from the response body when there is one.
    if (body) {
      try {
        const parsed = JSON.parse(body) as GoogleResponse
        if (parsed.error) return this.fromApiError(parsed.error)
      } catch {
        // fall through to the generic mapping below
      }
    }
    if (status === 429) {
      return new SearchError('rate_limit', this.id, 'Google daily quota exhausted.', { status })
    }
    if (status === 400 || status === 401 || status === 403) {
      return new SearchError(
        'unauthorized',
        this.id,
        'Google rejected the credentials. Check the API key and Search Engine ID.',
        { status }
      )
    }
    return new SearchError('network', this.id, 'Could not reach Google Custom Search.', {
      cause: error
    })
  }
}
