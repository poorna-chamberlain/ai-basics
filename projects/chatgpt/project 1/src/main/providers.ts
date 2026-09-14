import { net } from 'electron'
import type { AppSettings, ImageSearchProvider, ProviderDescriptor, SearchResponse } from '../shared/types.js'

async function requestJson<T>(url: URL): Promise<T> {
  let response: Response
  try {
    response = await net.fetch(url.toString(), { signal: AbortSignal.timeout(12_000) })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Network request failed: ${reason}`, { cause: error })
  }
  if (response.status === 429) throw new Error('RATE_LIMITED')
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`The image service returned HTTP ${response.status}${body ? `: ${body.slice(0, 240)}` : '.'}`)
  }
  try {
    return await response.json() as T
  } catch (error) {
    throw new Error('The image service returned an invalid response.', { cause: error })
  }
}

interface OpenversePayload {
  result_count: number
  page_count: number
  results: Array<{
    id: string
    title: string | null
    thumbnail: string
    url: string
    width?: number
    height?: number
    creator?: string | null
    foreign_landing_url?: string
  }>
}

export class OpenverseProvider implements ImageSearchProvider {
  readonly id = 'openverse' as const

  async search(query: string, page: number): Promise<SearchResponse> {
    const url = new URL('https://api.openverse.org/v1/images/')
    url.searchParams.set('q', query)
    url.searchParams.set('page', String(page))
    url.searchParams.set('page_size', '30')
    const data = await requestJson<OpenversePayload>(url)
    return {
      provider: this.id,
      page,
      hasMore: page < data.page_count,
      images: data.results
        .filter((image) => image.thumbnail && image.url)
        .map((image) => ({
          id: image.id,
          title: image.title || 'Untitled image',
          thumbnailUrl: image.thumbnail,
          fullUrl: image.url,
          width: image.width,
          height: image.height,
          creator: image.creator || undefined,
          sourceUrl: image.foreign_landing_url
        }))
    }
  }
}

interface GooglePayload {
  queries?: { nextPage?: unknown[] }
  items?: Array<{
    cacheId?: string
    link: string
    title: string
    image?: {
      thumbnailLink: string
      width?: number
      height?: number
      contextLink?: string
    }
  }>
  error?: { message: string; code: number }
}

export class GoogleCustomSearchProvider implements ImageSearchProvider {
  readonly id = 'google' as const

  constructor(private readonly settings: Pick<AppSettings, 'googleApiKey' | 'googleCx'>) {}

  async search(query: string, page: number): Promise<SearchResponse> {
    if (!this.settings.googleApiKey || !this.settings.googleCx) throw new Error('GOOGLE_NOT_CONFIGURED')
    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', this.settings.googleApiKey)
    url.searchParams.set('cx', this.settings.googleCx)
    url.searchParams.set('searchType', 'image')
    url.searchParams.set('q', query)
    url.searchParams.set('num', '10')
    url.searchParams.set('start', String((page - 1) * 10 + 1))
    const data = await requestJson<GooglePayload>(url)
    if (data.error) throw new Error(data.error.message)
    return {
      provider: this.id,
      page,
      hasMore: Boolean(data.queries?.nextPage?.length),
      images: (data.items ?? []).map((item) => ({
        id: item.cacheId ?? item.link,
        title: item.title,
        thumbnailUrl: item.image?.thumbnailLink ?? item.link,
        fullUrl: item.link,
        width: item.image?.width,
        height: item.image?.height,
        sourceUrl: item.image?.contextLink
      }))
    }
  }
}

export function providerFor(settings: AppSettings): ImageSearchProvider {
  return settings.provider === 'google'
    ? new GoogleCustomSearchProvider(settings)
    : new OpenverseProvider()
}

export function providerDescriptors(settings: AppSettings): ProviderDescriptor[] {
  return [
    {
      id: 'openverse',
      label: 'Openverse',
      configured: true,
      description: 'Ready without an account'
    },
    {
      id: 'google',
      label: 'Google',
      configured: Boolean(settings.googleApiKey.trim() && settings.googleCx.trim()),
      description: 'Custom Search JSON API'
    }
  ]
}
