import { removeBackground, type Config } from '@imgly/background-removal'
import { blobToDataUrl, dataUrlToBlob, downscaleIfHuge } from './imaging'

/**
 * Background removal via @imgly/background-removal.
 *
 * The ISNet segmentation model runs locally through ONNX Runtime compiled to
 * WASM — no image ever leaves the machine and there is no paid API involved.
 * The model weights themselves are fetched once from img.ly's CDN and then live
 * in the renderer's Cache Storage, so subsequent runs are fully offline.
 */

export interface RemovalProgress {
  /** 0..1, or null while the stage has no measurable total. */
  ratio: number | null
  label: string
  detail: string | null
}

export type ProgressHandler = (progress: RemovalProgress) => void

/** Turns the library's raw `(key, current, total)` events into UI copy. */
function describe(key: string, current: number, total: number): RemovalProgress {
  const ratio = total > 0 ? Math.min(1, current / total) : null

  if (key.startsWith('fetch:')) {
    const asset = key.slice('fetch:'.length)
    const isModel = asset.includes('/models/')
    return {
      ratio,
      label: isModel ? 'Downloading the model' : 'Preparing the engine',
      detail: isModel
        ? 'One-time download (~44 MB). Future edits run instantly and offline.'
        : null
    }
  }

  if (key.startsWith('compute:')) {
    return { ratio, label: 'Removing the background', detail: 'Running locally on your machine.' }
  }

  return { ratio, label: 'Working…', detail: null }
}

export interface RemoveOptions {
  model: 'isnet_quint8' | 'isnet_fp16'
  onProgress?: ProgressHandler
  signal?: AbortSignal
}

/**
 * Removes the background from a data URL and returns a transparent PNG data URL.
 */
export async function removeImageBackground(
  sourceDataUrl: string,
  { model, onProgress, signal }: RemoveOptions
): Promise<string> {
  // Cap the working resolution: the model gains nothing above ~2K and the extra
  // pixels cost seconds of CPU time.
  const prepared = await downscaleIfHuge(sourceDataUrl, 2048)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const config: Config = {
    model,
    // GPU (WebGPU) is not reliably available inside Electron's renderer yet and
    // silently falls back mid-run; CPU/WASM is slower but predictable.
    device: 'cpu',
    // Keeps inference off the UI thread so the progress bar keeps animating.
    proxyToWorker: true,
    output: { format: 'image/png' },
    progress: onProgress
      ? (key: string, current: number, total: number) => onProgress(describe(key, current, total))
      : undefined
  }

  const input = await dataUrlToBlob(prepared)
  const result = await removeBackground(input, config)

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  return blobToDataUrl(result)
}

/** Maps library failures onto something worth showing a user. */
export function describeRemovalError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') return 'Cancelled.'

  const message = error instanceof Error ? error.message : String(error)
  if (/fetch|network|Failed to fetch/i.test(message)) {
    return 'Could not download the background-removal model. Check your connection and try again.'
  }
  if (/memory|allocat/i.test(message)) {
    return 'Ran out of memory processing this image. Try a smaller one.'
  }
  return `Background removal failed: ${message}`
}
