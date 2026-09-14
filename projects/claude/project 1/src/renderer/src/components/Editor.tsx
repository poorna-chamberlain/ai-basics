import { useCallback, useEffect, useRef, useState } from 'react'
import type { HistoryImage, Settings } from '@shared/types'
import { describeRemovalError, removeImageBackground, type RemovalProgress } from '@/lib/bgRemoval'
import { compositeOnBackground, makeThumbnail, type BackingColor } from '@/lib/imaging'
import { BackIcon, CopyIcon, ExternalIcon, WandIcon } from './Icons'

/**
 * Preview + edit view.
 *
 * This renders *inside the overlay window* rather than in a secondary window:
 * the panel simply swaps its contents, so Escape still closes everything and
 * the user never loses the launcher's single-window feel.
 */

export interface EditorTarget {
  id: string
  title: string
  fullUrl: string
  providerId: HistoryImage['providerId']
  sourcePageUrl: string | null
  creator: string | null
  license: string | null
  /** Set when reopened from history: a previously produced transparent cut-out. */
  cutoutDataUrl?: string
}

type Phase = 'loading' | 'ready' | 'processing' | 'failed'

interface Props {
  target: EditorTarget
  settings: Settings
  onBack: () => void
  onToast: (text: string, tone?: 'success' | 'error') => void
  onSaveToHistory: (image: HistoryImage) => void
}

export function Editor({
  target,
  settings,
  onBack,
  onToast,
  onSaveToHistory
}: Props): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState<string | null>(null)

  /** The untouched original, as downloaded. */
  const [original, setOriginal] = useState<string | null>(null)
  /** Transparent PNG produced by the model; null until the background is removed. */
  const [cutout, setCutout] = useState<string | null>(target.cutoutDataUrl ?? null)
  const [backing, setBacking] = useState<BackingColor>('transparent')
  /** Exactly what is on screen and what "Copy" will put on the clipboard. */
  const [preview, setPreview] = useState<string | null>(target.cutoutDataUrl ?? null)

  const [progress, setProgress] = useState<RemovalProgress | null>(null)
  const [copying, setCopying] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  // Guards against setState after the user has navigated away mid-download.
  const aliveRef = useRef(true)

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  /* ------------------------------------------------ download the original -- */

  useEffect(() => {
    let cancelled = false
    setPhase(target.cutoutDataUrl ? 'ready' : 'loading')
    setError(null)

    void (async () => {
      const response = await window.quickImage.fetchImage(target.fullUrl)
      if (cancelled || !aliveRef.current) return

      if (!response.ok) {
        setError(response.error.message)
        setPhase('failed')
        return
      }

      setOriginal(response.data.dataUrl)
      // A history item already has its cut-out; don't clobber it with the original.
      setPreview((current) => current ?? response.data.dataUrl)
      setPhase('ready')
    })()

    return () => {
      cancelled = true
    }
  }, [target.fullUrl, target.cutoutDataUrl])

  /* -------------------------------------------------------- history entry -- */

  const persist = useCallback(
    async (nextCutout: string | null, visible: string) => {
      try {
        const thumbnailDataUrl = await makeThumbnail(visible)
        onSaveToHistory({
          id: target.id,
          title: target.title,
          providerId: target.providerId,
          sourcePageUrl: target.sourcePageUrl,
          thumbnailDataUrl,
          fullUrl: target.fullUrl,
          ...(nextCutout ? { editedDataUrl: nextCutout } : {}),
          at: Date.now()
        })
      } catch {
        // History is a convenience; a thumbnail failure must not break editing.
      }
    },
    [onSaveToHistory, target]
  )

  // Record the image in history as soon as it is openable.
  useEffect(() => {
    if (phase === 'ready' && preview) void persist(cutout, preview)
    // Deliberately keyed on the image, not on every preview tweak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, target.id])

  /* ------------------------------------------------------ remove background -- */

  const handleRemoveBackground = useCallback(async () => {
    if (!original || phase === 'processing') return

    const controller = new AbortController()
    abortRef.current = controller

    setPhase('processing')
    setError(null)
    setProgress({ ratio: null, label: 'Starting up', detail: null })

    try {
      const result = await removeImageBackground(original, {
        model: settings.bgRemovalModel,
        signal: controller.signal,
        onProgress: (value) => {
          if (aliveRef.current) setProgress(value)
        }
      })
      if (!aliveRef.current || controller.signal.aborted) return

      setCutout(result)
      setBacking('transparent')
      setPreview(result)
      setPhase('ready')
      setProgress(null)
      onToast('Background removed')
      void persist(result, result)
    } catch (failure) {
      if (!aliveRef.current) return
      const message = describeRemovalError(failure)
      setProgress(null)
      setPhase('ready')
      if (message !== 'Cancelled.') {
        setError(message)
        onToast(message, 'error')
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }, [original, phase, settings.bgRemovalModel, onToast, persist])

  /* ---------------------------------------------------------- backing colour -- */

  const handleBacking = useCallback(
    async (next: BackingColor) => {
      if (!cutout) return
      setBacking(next)
      try {
        // Compositing from the cut-out every time keeps the operation lossless:
        // white -> black never stacks two layers of paint.
        const composited =
          next === 'transparent' ? cutout : await compositeOnBackground(cutout, next)
        if (!aliveRef.current) return
        setPreview(composited)
      } catch {
        onToast('Could not apply that background.', 'error')
      }
    },
    [cutout, onToast]
  )

  /* ------------------------------------------------------------------ copy -- */

  const handleCopy = useCallback(async () => {
    if (!preview || copying) return
    setCopying(true)
    try {
      const response = await window.quickImage.copyImageToClipboard(preview)
      if (response.ok) {
        onToast('Copied to clipboard')
        void persist(cutout, preview)
      } else {
        onToast(response.error.message, 'error')
      }
    } finally {
      if (aliveRef.current) setCopying(false)
    }
  }, [preview, copying, onToast, persist, cutout])

  // Cmd/Ctrl+C copies the edited image even when nothing is focused.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        void handleCopy()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleCopy])

  /* ------------------------------------------------------------------ view -- */

  const subtitle = [target.creator, target.license].filter(Boolean).join(' · ')
  const busy = phase === 'processing'

  return (
    <div className="editor">
      <div className="editor__toolbar">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Back to results">
          <BackIcon />
        </button>

        <div className="editor__title">
          <div className="editor__title-text">{target.title}</div>
          {subtitle && <div className="editor__subtitle">{subtitle}</div>}
        </div>

        {target.sourcePageUrl && (
          <button
            type="button"
            className="icon-button"
            aria-label="Open the original page"
            title="Open the original page"
            onClick={() => window.quickImage.openExternal(target.sourcePageUrl as string)}
          >
            <ExternalIcon />
          </button>
        )}
      </div>

      <div className="divider" />

      <div className="editor__stage">
        {phase === 'loading' && <div className="skeleton" style={{ width: 300, height: 220 }} />}

        {phase === 'failed' && (
          <div className="state">
            <span className="state__title">Could not load this image</span>
            <span className="state__body">{error}</span>
            <div className="state__actions">
              <button type="button" className="button button--secondary" onClick={onBack}>
                Back to results
              </button>
            </div>
          </div>
        )}

        {preview && phase !== 'failed' && (
          <div className="canvas-frame">
            <img
              className="canvas-frame__img"
              src={preview}
              alt={target.title}
              draggable={false}
              style={{ maxHeight: 288 }}
            />
          </div>
        )}

        {busy && (
          <div className="editor__overlay">
            <span className="progress-label">{progress?.label ?? 'Working…'}</span>
            <div className="progress">
              <div
                className="progress__bar"
                data-indeterminate={progress?.ratio == null}
                style={{ width: `${Math.round((progress?.ratio ?? 0) * 100)}%` }}
              />
            </div>
            {progress?.detail && <span className="progress-sublabel">{progress.detail}</span>}
          </div>
        )}
      </div>

      <div className="editor__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={handleRemoveBackground}
          disabled={!original || busy}
          title={cutout ? 'Run background removal again' : 'Remove the background'}
        >
          {busy ? <span className="spinner" /> : <WandIcon size={14} />}
          {cutout ? 'Redo removal' : 'Remove background'}
        </button>

        {/* Backing colour is meaningless until there is transparency to fill. */}
        <div
          className="swatches"
          role="group"
          aria-label="Background colour"
          style={{ opacity: cutout ? 1 : 0.4, pointerEvents: cutout ? 'auto' : 'none' }}
        >
          {(['transparent', 'white', 'black'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`swatch swatch--${value}`}
              data-active={backing === value}
              aria-label={`${value} background`}
              title={`${value[0]!.toUpperCase()}${value.slice(1)} background`}
              onClick={() => handleBacking(value)}
            />
          ))}
        </div>

        <div className="spacer" />

        <button
          type="button"
          className="button button--primary"
          onClick={handleCopy}
          disabled={!preview || busy || copying}
        >
          <CopyIcon size={14} />
          Copy to clipboard
        </button>
      </div>
    </div>
  )
}
