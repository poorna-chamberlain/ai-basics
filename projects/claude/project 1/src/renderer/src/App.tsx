import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AppInfo } from '@shared/ipc'
import {
  DEFAULT_SETTINGS,
  type HistoryImage,
  type HistoryState,
  type ImageResult,
  type ProviderStatus,
  type Settings
} from '@shared/types'
import { Editor, type EditorTarget } from './components/Editor'
import { HistoryView } from './components/HistoryView'
import { HistoryIcon, SearchIcon, SettingsIcon } from './components/Icons'
import { ResultsGrid, SkeletonGrid } from './components/ResultsGrid'
import { SettingsPanel } from './components/SettingsPanel'
import { EmptyState, ErrorState, NoResultsState } from './components/States'
import { Toast, type ToastMessage } from './components/Toast'
import { useAutoHeight } from './hooks/useAutoHeight'
import { useDebounced } from './hooks/useDebounced'
import { useSearch } from './hooks/useSearch'
import { useTheme } from './hooks/useTheme'
import { formatAccelerator } from './lib/accelerator'

type Tab = 'search' | 'history'
type View = { kind: 'browse' } | { kind: 'settings' } | { kind: 'editor'; target: EditorTarget }

const EMPTY_HISTORY: HistoryState = { queries: [], images: [] }

export default function App(): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [history, setHistory] = useState<HistoryState>(EMPTY_HISTORY)

  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('search')
  const [view, setView] = useState<View>({ kind: 'browse' })
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [hotkeyError, setHotkeyError] = useState<string | null>(null)
  const [entering, setEntering] = useState(true)

  useTheme(appInfo)
  useAutoHeight(panelRef)

  const isMac = appInfo?.platform === 'darwin'
  const debouncedQuery = useDebounced(query, 260)

  // Re-runs the active query when the provider or its credentials change.
  const settingsToken = `${settings.providerId}:${settings.autoFallback}:${settings.googleApiKey ? 'k' : ''}${settings.googleCx ? 'c' : ''}`
  const search = useSearch(tab === 'search' ? debouncedQuery : '', settingsToken)

  const showToast = useCallback((text: string, tone: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), text, tone })
  }, [])

  /* ------------------------------------------------------------ bootstrap -- */

  useEffect(() => {
    void (async () => {
      const [info, loadedSettings, loadedHistory] = await Promise.all([
        window.quickImage.getAppInfo(),
        window.quickImage.getSettings(),
        window.quickImage.getHistory()
      ])
      setAppInfo(info)
      setSettings(loadedSettings)
      setHistory(loadedHistory)
      setProviders(await window.quickImage.listProviders())
    })()
  }, [])

  // Provider metadata (the "configured" flags) depends on current settings.
  useEffect(() => {
    void window.quickImage.listProviders().then(setProviders)
  }, [settings.googleApiKey, settings.googleCx])

  /* ------------------------------------------------------- window signals -- */

  useEffect(() => {
    const offShown = window.quickImage.onShown(() => {
      setEntering(true)
      // Replay the enter animation and put the caret back in the field.
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    })

    const offHidden = window.quickImage.onHidden(() => {
      // The view is deliberately left alone: tearing down the editor here would
      // abandon an in-flight background removal the moment the panel lost
      // focus, and reopening should land the user back where they were.
      setToast(null)
    })

    const offSettings = window.quickImage.onOpenSettings(() => setView({ kind: 'settings' }))
    const offChanged = window.quickImage.onSettingsChanged(setSettings)

    return () => {
      offShown()
      offHidden()
      offSettings()
      offChanged()
    }
  }, [])

  // Autofocus on first mount too, not just on subsequent shows.
  useEffect(() => {
    inputRef.current?.focus()
    const timer = setTimeout(() => setEntering(false), 220)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!entering) return
    const timer = setTimeout(() => setEntering(false), 220)
    return () => clearTimeout(timer)
  }, [entering])

  /* --------------------------------------------------------------- keys --- */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        // Escape peels back one layer at a time, closing only from the top.
        if (view.kind !== 'browse') {
          setView({ kind: 'browse' })
          requestAnimationFrame(() => inputRef.current?.focus())
        } else if (query) {
          setQuery('')
        } else {
          window.quickImage.hideOverlay()
        }
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault()
        setView((current) => (current.kind === 'settings' ? { kind: 'browse' } : { kind: 'settings' }))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view.kind, query])

  /* ------------------------------------------------------------ settings -- */

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const { settings: next, hotkey } = await window.quickImage.updateSettings(patch)
      setSettings(next)
      setHotkeyError(hotkey.ok ? null : (hotkey.error ?? 'That shortcut could not be registered.'))
      if (patch.hotkey && hotkey.ok) showToast('Shortcut updated')
    },
    [showToast]
  )

  /* ------------------------------------------------------------- history -- */

  const saveToHistory = useCallback((image: HistoryImage) => {
    void window.quickImage.addHistoryImage(image).then(setHistory)
  }, [])

  // Record the search term once it has actually returned something.
  useEffect(() => {
    if (search.status === 'ready' && debouncedQuery.trim().length >= 2) {
      void window.quickImage.addHistoryQuery(debouncedQuery).then(setHistory)
    }
  }, [search.status, debouncedQuery])

  /* ------------------------------------------------------------ handlers -- */

  const openResult = useCallback((result: ImageResult) => {
    setView({
      kind: 'editor',
      target: {
        id: result.id,
        title: result.title,
        fullUrl: result.fullUrl,
        providerId: result.providerId,
        sourcePageUrl: result.sourcePageUrl,
        creator: result.creator,
        license: result.license
      }
    })
  }, [])

  const openHistoryImage = useCallback((image: HistoryImage) => {
    setView({
      kind: 'editor',
      target: {
        id: image.id,
        title: image.title,
        fullUrl: image.fullUrl,
        providerId: image.providerId,
        sourcePageUrl: image.sourcePageUrl,
        creator: null,
        license: null,
        ...(image.editedDataUrl ? { cutoutDataUrl: image.editedDataUrl } : {})
      }
    })
  }, [])

  const rerunQuery = useCallback((next: string) => {
    setQuery(next)
    setTab('search')
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  /* ---------------------------------------------------------- derived UI -- */

  const activeProvider = useMemo(() => {
    const servedId = search.servedBy ?? settings.providerId
    return providers.find((p) => p.id === servedId) ?? null
  }, [providers, search.servedBy, settings.providerId])

  const providerState = search.fellBackFrom ? 'degraded' : search.status === 'error' ? 'error' : 'ok'

  const providerTitle = search.fellBackFrom
    ? `${providers.find((p) => p.id === search.fellBackFrom)?.label ?? 'The selected provider'} was unavailable — showing results from ${activeProvider?.label ?? 'another source'}`
    : `Searching ${activeProvider?.label ?? '…'}. Click to change.`

  // The panel collapses to just the search field when there is nothing to show.
  const hasBody =
    view.kind !== 'browse' ||
    tab === 'history' ||
    search.status !== 'idle' ||
    query.trim().length > 0

  return (
    <div className="panel" ref={panelRef} data-entering={entering}>
      {view.kind === 'editor' ? (
        <Editor
          target={view.target}
          settings={settings}
          onBack={() => setView({ kind: 'browse' })}
          onToast={showToast}
          onSaveToHistory={saveToHistory}
        />
      ) : (
        <>
          <div className="header">
            <span className="header__glyph">
              <SearchIcon size={18} />
            </span>
            <input
              ref={inputRef}
              className="search-input"
              type="text"
              placeholder="Search for an image…"
              value={query}
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value)
                setTab('search')
                if (view.kind === 'settings') setView({ kind: 'browse' })
              }}
            />
            <div className="header__actions">
              <button
                type="button"
                className="icon-button"
                data-active={tab === 'history' && view.kind === 'browse'}
                aria-label="History"
                title="History"
                onClick={() => {
                  setView({ kind: 'browse' })
                  setTab((current) => (current === 'history' ? 'search' : 'history'))
                }}
              >
                <HistoryIcon />
              </button>
              <button
                type="button"
                className="icon-button"
                data-active={view.kind === 'settings'}
                aria-label="Settings"
                title={`Settings (${isMac ? '⌘,' : 'Ctrl + ,'})`}
                onClick={() =>
                  setView((current) =>
                    current.kind === 'settings' ? { kind: 'browse' } : { kind: 'settings' }
                  )
                }
              >
                <SettingsIcon />
              </button>
            </div>
          </div>

          {hasBody && (
            <>
              <div className="divider" />
              <div className="content">
                {view.kind === 'settings' ? (
                  <SettingsPanel
                    settings={settings}
                    providers={providers}
                    isMac={Boolean(isMac)}
                    hotkeyError={hotkeyError}
                    onChange={updateSettings}
                  />
                ) : tab === 'history' ? (
                  <HistoryView
                    history={history}
                    onPickQuery={rerunQuery}
                    onPickImage={openHistoryImage}
                    onRemoveImage={(id) => {
                      void window.quickImage.removeHistoryImage(id).then(setHistory)
                    }}
                    onClear={() => {
                      void window.quickImage.clearHistory().then(setHistory)
                    }}
                  />
                ) : (
                  <SearchBody
                    query={query}
                    search={search}
                    onSelect={openResult}
                    onOpenSettings={() => setView({ kind: 'settings' })}
                  />
                )}
              </div>
            </>
          )}

          {hasBody && (
            <div className="footer">
              <div className="footer__group">
                <button
                  type="button"
                  className="provider-chip"
                  title={providerTitle}
                  onClick={() => setView({ kind: 'settings' })}
                >
                  <span className="provider-chip__dot" data-state={providerState} />
                  <span className="provider-chip__label">
                    {activeProvider?.label ?? 'No provider'}
                  </span>
                </button>
              </div>

              <div className="footer__group">
                {view.kind === 'browse' && tab === 'search' && search.results.length > 0 && (
                  <span className="hint">
                    <span className="kbd">↵</span> open
                  </span>
                )}
                <span className="hint">
                  <span className="kbd">esc</span> close
                </span>
                <span className="hint" title="Global shortcut">
                  <span className="kbd">{formatAccelerator(settings.hotkey, Boolean(isMac))}</span>
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

/** Chooses between skeletons, results, and the three non-result states. */
function SearchBody({
  query,
  search,
  onSelect,
  onOpenSettings
}: {
  query: string
  search: ReturnType<typeof useSearch>
  onSelect: (result: ImageResult) => void
  onOpenSettings: () => void
}): React.JSX.Element {
  if (search.status === 'loading') return <SkeletonGrid />

  if (search.status === 'error' && search.error) {
    return (
      <ErrorState
        kind={search.error.kind}
        message={search.error.message}
        onRetry={search.retry}
        onOpenSettings={onOpenSettings}
      />
    )
  }

  if (search.status === 'idle') return <EmptyState />
  if (search.status === 'empty') return <NoResultsState query={query} />

  return (
    <ResultsGrid
      results={search.results}
      loadingMore={search.status === 'loadingMore'}
      hasMore={search.hasMore}
      onSelect={onSelect}
      onLoadMore={search.loadMore}
    />
  )
}
