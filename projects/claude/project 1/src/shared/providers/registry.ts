import type { ProviderId, ProviderStatus, SearchResponse, Settings } from '../types'
import { GoogleCustomSearchProvider } from './google'
import { OpenverseProvider } from './openverse'
import { SearchError, type HttpClient, type ImageSearchProvider } from './types'
import { WikimediaCommonsProvider } from './wikimedia'

/**
 * Builds the provider registry. Everything the UI knows about providers comes
 * from here, so a new source only has to be constructed in this one list.
 */
export function createProviderRegistry(http: HttpClient): ProviderRegistry {
  return new ProviderRegistry([
    new WikimediaCommonsProvider(http),
    new OpenverseProvider(http),
    new GoogleCustomSearchProvider(http)
  ])
}

/**
 * Providers tried, in order, when the selected one fails and `autoFallback`
 * is on. Only key-less providers belong here: falling back to a metered,
 * user-billed API without being asked would be rude.
 */
const FALLBACK_ORDER: ProviderId[] = ['wikimedia', 'openverse']

/** Failures worth retrying elsewhere. A genuinely empty result set is not one. */
const FALLBACK_KINDS = new Set(['network', 'rate_limit', 'unauthorized', 'not_configured', 'unknown'])

export class ProviderRegistry {
  private readonly byId: Map<ProviderId, ImageSearchProvider>

  constructor(private readonly providers: ImageSearchProvider[]) {
    this.byId = new Map(providers.map((p) => [p.id, p]))
  }

  get(id: ProviderId): ImageSearchProvider {
    const provider = this.byId.get(id)
    if (!provider) throw new Error(`Unknown image provider: ${id}`)
    return provider
  }

  /** Metadata for the settings picker and the active-provider chip. */
  describe(settings: Settings): ProviderStatus[] {
    return this.providers.map((p) => ({
      id: p.id,
      label: p.label,
      description: p.description,
      configured: p.isConfigured(settings),
      requiresKey: p.requiresKey
    }))
  }

  /**
   * Runs a search against the selected provider, transparently retrying with a
   * key-less provider when it fails. The response records who actually served
   * it so the UI can say "Openverse is down, showing Wikimedia Commons".
   */
  async search(
    query: string,
    page: number,
    settings: Settings,
    signal?: AbortSignal
  ): Promise<SearchResponse> {
    const selected = this.get(settings.providerId)

    try {
      return await selected.search(query, page, settings, signal)
    } catch (error) {
      const searchError =
        error instanceof SearchError
          ? error
          : new SearchError('unknown', selected.id, 'Search failed.', { cause: error })

      const abortedByUser = signal?.aborted === true
      if (abortedByUser || !settings.autoFallback || !FALLBACK_KINDS.has(searchError.kind)) {
        throw searchError
      }

      for (const candidateId of FALLBACK_ORDER) {
        if (candidateId === selected.id) continue
        const candidate = this.byId.get(candidateId)
        if (!candidate || !candidate.isConfigured(settings)) continue

        try {
          const response = await candidate.search(query, page, settings, signal)
          return { ...response, servedBy: candidate.id, fellBackFrom: selected.id }
        } catch {
          // Try the next candidate; the original error is what we surface.
        }
      }

      throw searchError
    }
  }
}

export { SearchError }
export type { HttpClient, ImageSearchProvider }
