import { useCallback, useEffect, useRef, useState } from 'react'
import type { ImageResult, ProviderId, SearchErrorKind } from '@shared/types'

export type SearchStatus = 'idle' | 'loading' | 'loadingMore' | 'ready' | 'empty' | 'error'

export interface SearchState {
  status: SearchStatus
  results: ImageResult[]
  hasMore: boolean
  /** Which provider actually answered; differs from the selected one after fallback. */
  servedBy: ProviderId | null
  fellBackFrom: ProviderId | null
  error: { kind: SearchErrorKind; message: string } | null
}

const INITIAL: SearchState = {
  status: 'idle',
  results: [],
  hasMore: false,
  servedBy: null,
  fellBackFrom: null,
  error: null
}

/**
 * Runs a search whenever `query` changes and exposes paging.
 *
 * A monotonically increasing request id guards against out-of-order responses:
 * a slow provider answering an old query must never overwrite a newer one.
 * `settingsToken` changes when the active provider or its credentials change,
 * which re-runs the current query against the new provider.
 */
export function useSearch(query: string, settingsToken: string) {
  const [state, setState] = useState<SearchState>(INITIAL)
  const requestId = useRef(0)
  const page = useRef(1)

  const run = useCallback(async (q: string, nextPage: number, append: boolean) => {
    const id = ++requestId.current

    setState((prev) =>
      append
        ? { ...prev, status: 'loadingMore' }
        : { ...INITIAL, status: 'loading' }
    )

    const response = await window.quickImage.search(q, nextPage)
    if (id !== requestId.current) return

    if (!response.ok) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        // Keep already-visible results on a failed "load more".
        results: append ? prev.results : [],
        hasMore: false,
        error: { kind: response.error.kind, message: response.error.message }
      }))
      return
    }

    const { results, hasMore, servedBy, fellBackFrom } = response.data
    setState((prev) => {
      const merged = append ? dedupe([...prev.results, ...results]) : results
      return {
        status: merged.length === 0 ? 'empty' : 'ready',
        results: merged,
        hasMore,
        servedBy,
        fellBackFrom: fellBackFrom ?? null,
        error: null
      }
    })
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    page.current = 1

    if (trimmed.length < 2) {
      requestId.current++
      setState(INITIAL)
      return
    }

    void run(trimmed, 1, false)
  }, [query, settingsToken, run])

  const loadMore = useCallback(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return
    if (state.status === 'loading' || state.status === 'loadingMore' || !state.hasMore) return

    page.current += 1
    void run(trimmed, page.current, true)
  }, [query, run, state.status, state.hasMore])

  const retry = useCallback(() => {
    const trimmed = query.trim()
    if (trimmed.length >= 2) {
      page.current = 1
      void run(trimmed, 1, false)
    }
  }, [query, run])

  return { ...state, loadMore, retry }
}

/** Providers occasionally return the same asset on consecutive pages. */
function dedupe(results: ImageResult[]): ImageResult[] {
  const seen = new Set<string>()
  return results.filter((result) => {
    if (seen.has(result.id)) return false
    seen.add(result.id)
    return true
  })
}
