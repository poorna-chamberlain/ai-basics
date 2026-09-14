/**
 * Canvas helpers for the editor.
 *
 * Every source image arrives as a data URL fetched by the main process, so the
 * canvas is never tainted and `toDataURL` always succeeds — which is what makes
 * clipboard export work regardless of the image's origin.
 */

export type BackingColor = 'transparent' | 'white' | 'black'

export const BACKING_HEX: Record<Exclude<BackingColor, 'transparent'>, string> = {
  white: '#ffffff',
  black: '#101014'
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The image could not be decoded.'))
    image.src = src
  })
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Chunked conversion: spreading a multi-megabyte array into
  // String.fromCharCode blows the call stack.
  let binary = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }

  return `data:${blob.type || 'image/png'};base64,${btoa(binary)}`
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Paints `src` over a solid colour (or leaves it transparent) and returns a PNG
 * data URL. PNG is required: JPEG has no alpha, so a "transparent" export would
 * silently come out black.
 */
export async function compositeOnBackground(
  src: string,
  backing: BackingColor
): Promise<string> {
  const image = await loadImage(src)
  const canvas = createCanvas(image.naturalWidth, image.naturalHeight)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is unavailable.')

  if (backing !== 'transparent') {
    ctx.fillStyle = BACKING_HEX[backing]
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(image, 0, 0)
  return canvas.toDataURL('image/png')
}

/** Downscales an image for the history strip so the store stays small. */
export async function makeThumbnail(src: string, maxEdge = 288): Promise<string> {
  const image = await loadImage(src)
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight))

  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is unavailable.')

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, width, height)

  // PNG preserves the cut-out alpha of an edited image; JPEG would not.
  return canvas.toDataURL('image/png')
}

/**
 * Very large originals make background removal slow and can exceed the model's
 * useful input size, so they are capped before processing.
 */
export async function downscaleIfHuge(src: string, maxEdge = 2048): Promise<string> {
  const image = await loadImage(src)
  const longest = Math.max(image.naturalWidth, image.naturalHeight)
  if (longest <= maxEdge) return src

  const scale = maxEdge / longest
  const canvas = createCanvas(
    Math.round(image.naturalWidth * scale),
    Math.round(image.naturalHeight * scale)
  )
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is unavailable.')

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}

export function formatDimensions(width: number | null, height: number | null): string | null {
  if (!width || !height) return null
  return `${width} × ${height}`
}
