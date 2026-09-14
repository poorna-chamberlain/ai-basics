import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  ImageIcon,
  LoaderCircle,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  AppSettings,
  Diagnostics,
  HistoryItem,
  ImageHistoryItem,
  PublicSettings,
  SearchImage
} from '../../shared/types'

type View = 'search' | 'history' | 'settings' | 'edit'
type Background = 'transparent' | 'white' | 'black'

interface EditorImage {
  historyId?: string
  title: string
  sourceUrl: string
  thumbnailUrl: string
  originalDataUrl: string
  cutoutDataUrl?: string
  background: Background
}

function errorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  return raw.replace(/^Error invoking remote method '[^']+': Error: /, '')
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function compositeImage(dataUrl: string, background: Background): Promise<string> {
  if (background === 'transparent') return dataUrl
  const image = new Image()
  image.src = dataUrl
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available.')
  context.fillStyle = background === 'white' ? '#ffffff' : '#000000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0)
  return canvas.toDataURL('image/png')
}

export default function App(): React.JSX.Element {
  const [view, setView] = useState<View>('search')
  const [query, setQuery] = useState('')
  const [images, setImages] = useState<SearchImage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [searchError, setSearchError] = useState('')
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [editor, setEditor] = useState<EditorImage | null>(null)
  const [editorLoading, setEditorLoading] = useState(false)
  const [processing, setProcessing] = useState(0)
  const [toast, setToast] = useState('')
  const [visible, setVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchSequence = useRef(0)

  const refreshHistory = useCallback(async () => {
    setHistory(await window.quickImage.getHistory())
  }, [])

  useEffect(() => {
    void window.quickImage.getSettings().then(setSettings)
    void refreshHistory()
    return window.quickImage.onOverlayVisibility((isVisible) => {
      setVisible(isVisible)
      if (isVisible) setTimeout(() => inputRef.current?.focus(), 70)
    })
  }, [refreshHistory])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      if (view !== 'search') setView('search')
      else void window.quickImage.closeOverlay()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view])

  useEffect(() => {
    const heights: Record<View, number> = { search: query.trim() ? 650 : 126, history: 650, settings: 596, edit: 650 }
    void window.quickImage.resizeOverlay(heights[view])
  }, [view, query])

  useEffect(() => {
    const clean = query.trim()
    const sequence = ++searchSequence.current
    if (!clean) {
      setImages([])
      setSearchError('')
      setLoading(false)
      return
    }
    setLoading(true)
    setSearchError('')
    const timer = setTimeout(async () => {
      try {
        const result = await window.quickImage.search(clean, 1)
        if (sequence !== searchSequence.current) return
        setImages(result.images)
        setPage(1)
        setHasMore(result.hasMore)
        setSettings((current) => current && { ...current, provider: result.provider })
        if (result.images.length) void window.quickImage.addQueryHistory(clean).then(setHistory)
      } catch (error) {
        if (sequence === searchSequence.current) {
          setImages([])
          setSearchError(errorMessage(error))
        }
      } finally {
        if (sequence === searchSequence.current) setLoading(false)
      }
    }, 360)
    return () => clearTimeout(timer)
  }, [query])

  const openImage = useCallback(async (image: SearchImage) => {
    setView('edit')
    setEditorLoading(true)
    setEditor({
      title: image.title,
      sourceUrl: image.fullUrl,
      thumbnailUrl: image.thumbnailUrl,
      originalDataUrl: '',
      background: 'transparent'
    })
    try {
      const originalDataUrl = await window.quickImage.fetchImage(image.fullUrl)
      setEditor((current) => current && { ...current, originalDataUrl })
      setHistory(
        await window.quickImage.saveImageHistory({
          title: image.title,
          sourceUrl: image.fullUrl,
          thumbnailUrl: image.thumbnailUrl,
          background: 'transparent'
        })
      )
      const saved = (await window.quickImage.getHistory()).find(
        (item): item is ImageHistoryItem =>
          item.kind === 'image' && item.sourceUrl === image.fullUrl
      )
      if (saved) setEditor((current) => current && { ...current, historyId: saved.id })
    } catch (error) {
      setToast(errorMessage(error))
      setView('search')
    } finally {
      setEditorLoading(false)
    }
  }, [])

  const openHistoryImage = useCallback(async (item: ImageHistoryItem) => {
    setView('edit')
    setEditorLoading(true)
    setEditor({
      historyId: item.id,
      title: item.title,
      sourceUrl: item.sourceUrl,
      thumbnailUrl: item.thumbnailUrl,
      originalDataUrl: item.editedDataUrl ?? '',
      cutoutDataUrl: item.editedDataUrl,
      background: item.background
    })
    if (!item.editedDataUrl) {
      try {
        const dataUrl = await window.quickImage.fetchImage(item.sourceUrl)
        setEditor((current) => current && { ...current, originalDataUrl: dataUrl })
      } catch (error) {
        setToast(errorMessage(error))
        setView('history')
      }
    }
    setEditorLoading(false)
  }, [])

  const removeBackground = async (): Promise<void> => {
    if (!editor?.originalDataUrl) return
    setProcessing(1)
    try {
      const { removeBackground: remove } = await import('@imgly/background-removal')
      const result = await remove(editor.originalDataUrl, {
        progress: (_key: string, current: number, total: number) => {
          setProcessing(Math.max(2, Math.round((current / total) * 100)))
        }
      })
      const cutoutDataUrl = await blobToDataUrl(result)
      const updated = { ...editor, cutoutDataUrl, background: 'transparent' as const }
      setEditor(updated)
      setHistory(
        await window.quickImage.saveImageHistory({
          id: updated.historyId,
          title: updated.title,
          sourceUrl: updated.sourceUrl,
          thumbnailUrl: updated.thumbnailUrl,
          editedDataUrl: cutoutDataUrl,
          background: updated.background
        })
      )
      setToast('Background removed')
    } catch (error) {
      setToast(`Background removal failed: ${errorMessage(error)}`)
    } finally {
      setProcessing(0)
    }
  }

  const setBackground = async (background: Background): Promise<void> => {
    if (!editor) return
    const updated = { ...editor, background }
    setEditor(updated)
    if (updated.cutoutDataUrl) {
      setHistory(
        await window.quickImage.saveImageHistory({
          id: updated.historyId,
          title: updated.title,
          sourceUrl: updated.sourceUrl,
          thumbnailUrl: updated.thumbnailUrl,
          editedDataUrl: updated.cutoutDataUrl,
          background
        })
      )
    }
  }

  const copyImage = async (): Promise<void> => {
    if (!editor?.originalDataUrl) return
    try {
      const dataUrl = await compositeImage(editor.cutoutDataUrl ?? editor.originalDataUrl, editor.background)
      await window.quickImage.copyImage(dataUrl)
      setToast('Copied image to clipboard')
    } catch (error) {
      setToast(errorMessage(error))
    }
  }

  const loadMore = async (): Promise<void> => {
    setLoadingMore(true)
    try {
      const result = await window.quickImage.search(query.trim(), page + 1)
      setImages((current) => [...current, ...result.images])
      setPage(result.page)
      setHasMore(result.hasMore)
    } catch (error) {
      setSearchError(errorMessage(error))
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timeout)
  }, [toast])

  return (
    <main className={`app-shell ${visible ? 'is-visible' : ''}`}>
      {view === 'search' && (
        <SearchView
          inputRef={inputRef}
          query={query}
          onQuery={setQuery}
          images={images}
          loading={loading}
          error={searchError}
          hasMore={hasMore}
          loadingMore={loadingMore}
          providerName={
            settings?.providers.find((provider) => provider.id === settings.provider)?.label ?? 'Openverse'
          }
          onImage={openImage}
          onLoadMore={loadMore}
          onHistory={() => setView('history')}
          onSettings={() => setView('settings')}
        />
      )}
      {view === 'history' && (
        <HistoryView
          history={history}
          onBack={() => setView('search')}
          onQuery={(value) => {
            setQuery(value)
            setView('search')
          }}
          onImage={openHistoryImage}
          onClear={async () => {
            await window.quickImage.clearHistory()
            setHistory([])
          }}
        />
      )}
      {view === 'settings' && settings && (
        <SettingsView
          settings={settings}
          onBack={() => setView('search')}
          onSave={async (patch) => {
            try {
              const next = await window.quickImage.saveSettings(patch)
              setSettings(next)
              setToast('Settings saved')
              setView('search')
            } catch (error) {
              setToast(errorMessage(error))
            }
          }}
        />
      )}
      {view === 'edit' && editor && (
        <EditView
          editor={editor}
          loading={editorLoading}
          processing={processing}
          onBack={() => setView('search')}
          onRemove={removeBackground}
          onBackground={setBackground}
          onCopy={copyImage}
        />
      )}
      {toast && (
        <div className="toast">
          <Check size={15} /> {toast}
        </div>
      )}
    </main>
  )
}

interface SearchViewProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  query: string
  onQuery: (query: string) => void
  images: SearchImage[]
  loading: boolean
  error: string
  hasMore: boolean
  loadingMore: boolean
  providerName: string
  onImage: (image: SearchImage) => void
  onLoadMore: () => void
  onHistory: () => void
  onSettings: () => void
}

function SearchView(props: SearchViewProps): React.JSX.Element {
  return (
    <>
      <header className="search-header">
        <Search className="search-icon" size={23} strokeWidth={1.8} />
        <input
          ref={props.inputRef}
          value={props.query}
          onChange={(event) => props.onQuery(event.target.value)}
          placeholder="Search for any image…"
          autoComplete="off"
          spellCheck={false}
        />
        {props.query && (
          <button className="icon-button quiet" onClick={() => props.onQuery('')} aria-label="Clear search">
            <X size={17} />
          </button>
        )}
        <span className="provider-pill">{props.providerName}</span>
        <button className="icon-button" onClick={props.onHistory} aria-label="History">
          <Clock3 size={18} />
        </button>
        <button className="icon-button" onClick={props.onSettings} aria-label="Settings">
          <Settings2 size={18} />
        </button>
      </header>
      {props.query.trim() && (
        <section className="results">
          {props.loading ? (
            <div className="image-grid skeleton-grid">
              {Array.from({ length: 12 }, (_, index) => <div className="skeleton" key={index} />)}
            </div>
          ) : props.error ? (
            <Status icon={<ImageIcon />} title="Search unavailable" detail={props.error} tone="error" />
          ) : !props.images.length ? (
            <Status icon={<Search />} title="No images found" detail="Try a broader or different search." />
          ) : (
            <>
              <div className="image-grid">
                {props.images.map((image) => (
                  <button className="image-card" key={image.id} onClick={() => props.onImage(image)}>
                    <img src={image.thumbnailUrl} alt={image.title} loading="lazy" />
                    <span>{image.title}</span>
                  </button>
                ))}
              </div>
              {props.hasMore && (
                <button className="load-more" onClick={props.onLoadMore} disabled={props.loadingMore}>
                  {props.loadingMore ? <LoaderCircle className="spin" size={16} /> : null}
                  {props.loadingMore ? 'Loading' : 'Show more'}
                </button>
              )}
            </>
          )}
        </section>
      )}
    </>
  )
}

function Status({
  icon,
  title,
  detail,
  tone
}: {
  icon: React.ReactNode
  title: string
  detail: string
  tone?: 'error'
}): React.JSX.Element {
  return (
    <div className={`status ${tone ?? ''}`}>
      <div className="status-icon">{icon}</div>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}

function PanelHeader({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }): React.JSX.Element {
  return (
    <header className="panel-header">
      <button className="icon-button" onClick={onBack} aria-label="Back"><ArrowLeft size={19} /></button>
      <h1>{title}</h1>
      <div className="panel-action">{action}</div>
    </header>
  )
}

function HistoryView({
  history,
  onBack,
  onQuery,
  onImage,
  onClear
}: {
  history: HistoryItem[]
  onBack: () => void
  onQuery: (query: string) => void
  onImage: (item: ImageHistoryItem) => void
  onClear: () => void
}): React.JSX.Element {
  const queries = history.filter((item) => item.kind === 'query')
  const imageItems = history.filter((item): item is ImageHistoryItem => item.kind === 'image')
  return (
    <>
      <PanelHeader
        title="History"
        onBack={onBack}
        action={history.length ? <button className="text-button danger" onClick={onClear}><Trash2 size={14} /> Clear</button> : null}
      />
      <section className="panel-scroll history-panel">
        {!history.length ? (
          <Status icon={<Clock3 />} title="Nothing here yet" detail="Your searches and selected images will appear here." />
        ) : (
          <>
            {queries.length > 0 && (
              <div className="history-section">
                <h2>Recent searches</h2>
                <div className="query-list">
                  {queries.slice(0, 12).map((item) => item.kind === 'query' && (
                    <button key={item.id} onClick={() => onQuery(item.query)}>
                      <Search size={15} /><span>{item.query}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {imageItems.length > 0 && (
              <div className="history-section">
                <h2>Selected images</h2>
                <div className="history-grid">
                  {imageItems.map((item) => (
                    <button key={item.id} onClick={() => onImage(item)}>
                      <img src={item.editedDataUrl ?? item.thumbnailUrl} alt={item.title} loading="lazy" />
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}

function SettingsView({
  settings,
  onBack,
  onSave
}: {
  settings: PublicSettings
  onBack: () => void
  onSave: (patch: Partial<AppSettings>) => void
}): React.JSX.Element {
  const [provider, setProvider] = useState(settings.provider)
  const [hotkey, setHotkey] = useState(settings.hotkey)
  const [googleApiKey, setGoogleApiKey] = useState(settings.googleApiKey)
  const [googleCx, setGoogleCx] = useState(settings.googleCx)
  const [recording, setRecording] = useState(false)
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null)
  const configured = Boolean(googleApiKey.trim() && googleCx.trim())

  const refreshDiagnostics = useCallback(() => {
    void window.quickImage.getDiagnostics().then(setDiagnostics)
  }, [])

  useEffect(refreshDiagnostics, [refreshDiagnostics])

  const captureHotkey = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    event.preventDefault()
    const modifier = event.metaKey || event.ctrlKey || event.altKey || event.shiftKey
    if (!modifier || ['Meta', 'Control', 'Alt', 'Shift'].includes(event.key)) return
    const parts = [
      event.metaKey && 'CommandOrControl',
      event.ctrlKey && !event.metaKey && 'Ctrl',
      event.altKey && 'Alt',
      event.shiftKey && 'Shift',
      event.key.length === 1 ? event.key.toUpperCase() : event.key
    ].filter(Boolean)
    setHotkey(parts.join('+'))
    setRecording(false)
  }

  return (
    <>
      <PanelHeader title="Settings" onBack={onBack} />
      <section className="settings-panel panel-scroll">
        <div className="setting-group">
          <label>Image provider</label>
          <div className="segmented">
            {settings.providers.map((option) => {
              const usable = option.id === 'google' ? configured : option.configured
              return (
                <button
                  key={option.id}
                  className={provider === option.id ? 'active' : ''}
                  onClick={() => usable && setProvider(option.id)}
                  disabled={!usable}
                  title={option.description}
                >
                  {option.label} <small>{usable ? 'Ready' : 'Needs setup'}</small>
                </button>
              )
            })}
          </div>
          <p>Openverse works without an account. Google is an optional upgrade.</p>
        </div>
        <div className="setting-group">
          <label htmlFor="hotkey">Global shortcut</label>
          <input
            id="hotkey"
            className={`field hotkey-field ${recording ? 'recording' : ''}`}
            value={recording ? 'Press your shortcut…' : hotkey}
            onFocus={() => setRecording(true)}
            onBlur={() => setRecording(false)}
            onKeyDown={captureHotkey}
            readOnly
          />
        </div>
        <div className="setting-group google-fields">
          <div className="label-row"><label>Google Custom Search</label><span>Optional</span></div>
          <input
            className="field"
            type="password"
            value={googleApiKey}
            onChange={(event) => setGoogleApiKey(event.target.value)}
            placeholder="API key"
            autoComplete="off"
          />
          <input
            className="field"
            value={googleCx}
            onChange={(event) => setGoogleCx(event.target.value)}
            placeholder="Search engine ID (cx)"
            autoComplete="off"
          />
        </div>
        <div className="setting-group diagnostics">
          <div className="label-row">
            <label>Diagnostics</label>
            <button className="text-button" onClick={refreshDiagnostics}>Refresh logs</button>
          </div>
          <p className="log-path">{diagnostics?.path ?? 'Loading log location…'}</p>
          <pre>
            {diagnostics?.lines.slice(-12).join('\n') || 'No diagnostic events yet.'}
          </pre>
        </div>
        <button
          className="primary-button save-button"
          onClick={() => onSave({ provider: provider === 'google' && !configured ? 'openverse' : provider, hotkey, googleApiKey, googleCx })}
        >
          Save changes
        </button>
      </section>
    </>
  )
}

function EditView({
  editor,
  loading,
  processing,
  onBack,
  onRemove,
  onBackground,
  onCopy
}: {
  editor: EditorImage
  loading: boolean
  processing: number
  onBack: () => void
  onRemove: () => void
  onBackground: (background: Background) => void
  onCopy: () => void
}): React.JSX.Element {
  const displayImage = editor.cutoutDataUrl ?? editor.originalDataUrl
  const previewStyle = useMemo(
    () => editor.background === 'transparent' ? undefined : { backgroundColor: editor.background },
    [editor.background]
  )
  return (
    <>
      <PanelHeader title={editor.title} onBack={onBack} />
      <section className="editor-panel">
        <div className={`preview checkerboard bg-${editor.background}`} style={previewStyle}>
          {loading || !displayImage ? (
            <LoaderCircle className="spin preview-loader" size={28} />
          ) : (
            <img src={displayImage} alt={editor.title} />
          )}
          {processing > 0 && (
            <div className="processing">
              <Sparkles size={20} />
              <strong>Removing background</strong>
              <div className="progress"><span style={{ width: `${processing}%` }} /></div>
              <small>{processing}% · Runs locally on this device</small>
            </div>
          )}
        </div>
        <div className="editor-controls">
          <button className="secondary-button" onClick={onRemove} disabled={loading || processing > 0}>
            <Sparkles size={17} /> {editor.cutoutDataUrl ? 'Remove again' : 'Remove background'}
          </button>
          <div className="background-picker" aria-label="Image background">
            {(['transparent', 'white', 'black'] as Background[]).map((background) => (
              <button
                key={background}
                className={`${background} ${editor.background === background ? 'active' : ''}`}
                onClick={() => onBackground(background)}
                disabled={!editor.cutoutDataUrl}
              >
                <span />{background[0].toUpperCase() + background.slice(1)}
              </button>
            ))}
          </div>
          <button className="primary-button copy-button" onClick={onCopy} disabled={loading || processing > 0}>
            <Copy size={17} /> Copy to clipboard
          </button>
        </div>
      </section>
    </>
  )
}
