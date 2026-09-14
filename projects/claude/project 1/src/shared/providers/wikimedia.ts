import type { ImageResult, SearchResponse, Settings } from '../types'
import { SearchError, type HttpClient, type ImageSearchProvider } from './types'

/**
 * Wikimedia Commons — the zero-configuration default.
 *
 * Uses the MediaWiki Action API's `generator=search` against the File namespace,
 * asking for a 500px-wide server-rendered thumbnail per hit. No key, no signup,
 * no quota beyond ordinary politeness limits.
 */

interface MwImageInfo {
  thumburl?: string
  thumbwidth?: number
  thumbheight?: number
  url?: string
  descriptionurl?: string
  width?: number
  height?: number
  mime?: string
  extmetadata?: Record<string, { value?: string } | undefined>
}

interface MwPage {
  pageid: number
  title: string
  index?: number
  imageinfo?: MwImageInfo[]
}

interface MwResponse {
  query?: { pages?: Record<string, MwPage> }
  continue?: { gsroffset?: number }
  error?: { code?: string; info?: string }
}

const ENDPOINT = 'https://commons.wikimedia.org/w/api.php'
const PAGE_SIZE = 40

/** Commons metadata fields arrive as small HTML fragments; render them as text. */
function stripHtml(value: string | undefined): string | null {
  if (!value) return null
  const text = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 0 ? text : null
}

/** `File:Some_photo.jpg` -> `Some photo`. */
function prettyTitle(title: string): string {
  return title
    .replace(/^File:/, '')
    .replace(/\.(jpe?g|png|gif|webp|tiff?|svg)$/i, '')
    .replace(/_/g, ' ')
    .trim()
}

export class WikimediaCommonsProvider implements ImageSearchProvider {
  readonly id = 'wikimedia' as const
  readonly label = 'Wikimedia Commons'
  readonly description = 'Millions of freely licensed images. No API key required.'
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
    const offset = Math.max(0, page - 1) * PAGE_SIZE

    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '1',
      // `filetype:bitmap` keeps out SVGs, PDFs and video stills, which cannot be
      // fed to the background-removal model.
      generator: 'search',
      gsrsearch: `filetype:bitmap ${query}`,
      gsrnamespace: '6',
      gsrlimit: String(PAGE_SIZE),
      gsroffset: String(offset),
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '500',
      // Commons only sends CORS headers when asked; harmless from the main process.
      origin: '*'
    })

    let data: MwResponse
    try {
      data = await this.http.getJson<MwResponse>(`${ENDPOINT}?${params.toString()}`, {
        timeoutMs: 12_000,
        signal
      })
    } catch (error) {
      throw this.toSearchError(error)
    }

    if (data.error) {
      throw new SearchError('unknown', this.id, data.error.info ?? 'Wikimedia returned an error.')
    }

    const pages = Object.values(data.query?.pages ?? {})
    // `generator=search` returns pages keyed by id in arbitrary order; `index`
    // carries the relevance ranking.
    pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))

    const results: ImageResult[] = []
    for (const p of pages) {
      const info = p.imageinfo?.[0]
      if (!info?.thumburl || !info.url) continue
      if (info.mime && !/^image\/(jpeg|png|webp|gif)$/.test(info.mime)) continue

      results.push({
        id: `wikimedia:${p.pageid}`,
        thumbnailUrl: info.thumburl,
        fullUrl: info.url,
        title: prettyTitle(p.title),
        width: info.width ?? null,
        height: info.height ?? null,
        creator: stripHtml(info.extmetadata?.Artist?.value),
        license: stripHtml(info.extmetadata?.LicenseShortName?.value),
        sourcePageUrl: info.descriptionurl ?? null,
        providerId: this.id
      })
    }

    return {
      results,
      totalCount: null,
      hasMore: typeof data.continue?.gsroffset === 'number',
      servedBy: this.id
    }
  }

  private toSearchError(error: unknown): SearchError {
    if (error instanceof SearchError) return error
    const status = (error as { status?: number } | null)?.status
    if (status === 429) {
      return new SearchError('rate_limit', this.id, 'Wikimedia is rate limiting requests.', { status })
    }
    return new SearchError('network', this.id, 'Could not reach Wikimedia Commons.', { cause: error })
  }
}
