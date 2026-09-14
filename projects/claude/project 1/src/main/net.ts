import { net } from 'electron'
import type { FetchedImage } from '@shared/types'
import type { HttpClient, HttpRequestInit } from '@shared/providers/types'

/**
 * All outbound HTTP happens here, in the main process, using Electron's `net`
 * module (Chromium's stack: real system proxy support, no renderer CORS rules).
 */

/** Carries the HTTP status and body so providers can decode API error envelopes. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
    url: string
  ) {
    super(`HTTP ${status} for ${url}`)
    this.name = 'HttpError'
  }
}

const DEFAULT_TIMEOUT_MS = 12_000

/**
 * Openverse's edge sits behind a bot filter that stalls unrecognised user
 * agents, and Wikimedia asks API clients to identify themselves. A plain,
 * honest browser-ish UA satisfies both.
 */
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) QuickImage/1.0 Safari/537.36'

async function request(
  url: string,
  init: HttpRequestInit & { accept?: string } = {}
): Promise<{ body: Buffer; contentType: string }> {
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const controller = new AbortController()

  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const onExternalAbort = (): void => controller.abort()
  init.signal?.addEventListener('abort', onExternalAbort, { once: true })

  try {
    const response = await net.fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: init.accept ?? 'application/json',
        ...init.headers
      }
    })

    const buffer = Buffer.from(await response.arrayBuffer())
    if (!response.ok) {
      throw new HttpError(response.status, buffer.toString('utf8').slice(0, 2000), url)
    }

    return { body: buffer, contentType: response.headers.get('content-type') ?? '' }
  } finally {
    clearTimeout(timer)
    init.signal?.removeEventListener('abort', onExternalAbort)
  }
}

export const httpClient: HttpClient = {
  async getJson<T>(url: string, init?: HttpRequestInit): Promise<T> {
    const { body } = await request(url, init)
    return JSON.parse(body.toString('utf8')) as T
  }
}

/** Cap on downloaded originals; full-resolution Commons scans can be enormous. */
const MAX_IMAGE_BYTES = 40 * 1024 * 1024

/**
 * Downloads an image and returns it as a data URL. Going through the main
 * process means the renderer can draw it to a canvas without tainting it,
 * which is what makes background removal and clipboard export possible.
 */
export async function fetchImageAsDataUrl(
  url: string,
  signal?: AbortSignal
): Promise<FetchedImage> {
  const { body, contentType } = await request(url, {
    accept: 'image/*',
    timeoutMs: 30_000,
    signal
  })

  if (body.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`Image is too large to edit (${Math.round(body.byteLength / 1024 / 1024)} MB).`)
  }

  const mimeType = contentType.split(';')[0]?.trim() || guessMimeFromUrl(url)
  if (!mimeType.startsWith('image/')) {
    throw new Error('That URL did not return an image.')
  }

  return {
    dataUrl: `data:${mimeType};base64,${body.toString('base64')}`,
    mimeType,
    byteLength: body.byteLength
  }
}

function guessMimeFromUrl(url: string): string {
  const ext = new URL(url).pathname.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    default:
      return 'image/jpeg'
  }
}
