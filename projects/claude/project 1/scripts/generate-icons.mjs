/**
 * Generates every icon asset the app and installers need, with no image
 * dependencies: a tiny PNG encoder plus a 4x supersampled software rasterizer.
 *
 *   build/icon.png              1024px app icon (electron-builder derives .icns/.ico)
 *   resources/trayTemplate.png  16px macOS menu-bar template (black + alpha)
 *   resources/trayTemplate@2x.png
 *   resources/tray.png          32px colored tray icon for Windows/Linux
 *   resources/tray@2x.png
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/* ---------------------------------------------------------------- PNG ---- */

const crcTable = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/** Encode an RGBA byte buffer as a PNG. */
function encodePng(rgba, width, height) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  // 10..12: deflate / adaptive filtering / no interlace, all zero

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter type: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

/* --------------------------------------------------------- rasterizer ---- */

const SS = 4 // supersampling factor per axis

/** Signed distance to a rounded rectangle centred on (cx, cy). */
function sdRoundRect(px, py, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(px - cx) - (halfW - r)
  const qy = Math.abs(py - cy) - (halfH - r)
  const ox = Math.max(qx, 0)
  const oy = Math.max(qy, 0)
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r
}

function sdCircle(px, py, cx, cy, r) {
  return Math.hypot(px - cx, py - cy) - r
}

/** Signed distance to a line segment, used to stroke the mountain ridge. */
function sdSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby)))
  return Math.hypot(apx - abx * t, apy - aby * t)
}

function mix(a, b, t) {
  return a + (b - a) * t
}

/**
 * Renders the QuickImage mark.
 *
 * `mono` draws a flat black glyph with alpha only, which is what macOS needs
 * for a template image; otherwise it draws the gradient app icon.
 */
function render(size, { mono }) {
  const rgba = Buffer.alloc(size * size * 4)
  const n = size // work in a 0..1 normalised space so geometry is resolution independent

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) / n
          const v = (y + (sy + 0.5) / SS) / n
          const s = sampleUnit(u, v, mono, n * SS)
          r += s[0]
          g += s[1]
          b += s[2]
          a += s[3]
        }
      }

      const samples = SS * SS
      const i = (y * size + x) * 4
      // Un-premultiply: colours were accumulated weighted by coverage.
      const alpha = a / samples
      rgba[i] = alpha > 0 ? Math.round(Math.min(255, r / a) * 255) : 0
      rgba[i + 1] = alpha > 0 ? Math.round(Math.min(255, g / a) * 255) : 0
      rgba[i + 2] = alpha > 0 ? Math.round(Math.min(255, b / a) * 255) : 0
      rgba[i + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    }
  }

  return rgba
}

/**
 * Samples the mark at normalised coordinates. Returns [r, g, b, a] where the
 * colour channels are 0..1 already weighted by `a` (premultiplied), so the
 * caller can average samples correctly.
 */
function sampleUnit(u, v, mono, pixelsPerUnit) {
  // Anti-aliasing width: half a device pixel in normalised units.
  const aa = 0.75 / pixelsPerUnit
  const cov = (d) => 1 - smoothstep(-aa, aa, d)

  if (mono) {
    // Menu-bar glyph: photo frame outline + sun + ridge, black with alpha.
    const frameOuter = sdRoundRect(u, v, 0.5, 0.5, 0.40, 0.34, 0.09)
    const stroke = 0.062
    const frame = Math.max(frameOuter, -(frameOuter + stroke))
    const sun = sdCircle(u, v, 0.355, 0.395, 0.052)
    const ridge =
      Math.max(
        sdSegment(u, v, 0.30, 0.70, 0.47, 0.50) - 0.036,
        // clip the ridge to the inside of the frame
        frameOuter + stroke
      )
    const ridge2 = Math.max(
      sdSegment(u, v, 0.44, 0.545, 0.63, 0.70) - 0.036,
      frameOuter + stroke
    )
    const d = Math.min(frame, sun, ridge, ridge2)
    const alpha = cov(d)
    return [0, 0, 0, alpha]
  }

  // App icon: gradient squircle with a white mark punched into it.
  const plate = sdRoundRect(u, v, 0.5, 0.5, 0.5, 0.5, 0.2305) // iOS-style continuous corner
  const plateA = cov(plate)
  if (plateA <= 0) return [0, 0, 0, 0]

  // Diagonal indigo -> violet gradient with a subtle top-light sheen.
  const t = Math.max(0, Math.min(1, (u * 0.55 + v * 0.85)))
  let cr = mix(0x6e / 255, 0x9d / 255, t)
  let cg = mix(0x6a / 255, 0x74 / 255, t)
  let cb = mix(0xde / 255, 0xf5 / 255, t)
  const sheen = Math.max(0, 1 - v * 2.2) * 0.14
  cr = Math.min(1, cr + sheen)
  cg = Math.min(1, cg + sheen)
  cb = Math.min(1, cb + sheen)

  const frameOuter = sdRoundRect(u, v, 0.5, 0.5, 0.285, 0.243, 0.075)
  const stroke = 0.045
  const frame = Math.max(frameOuter, -(frameOuter + stroke))
  const sun = sdCircle(u, v, 0.403, 0.428, 0.038)
  const ridge = Math.max(sdSegment(u, v, 0.368, 0.638, 0.487, 0.5) - 0.026, frameOuter + stroke)
  const ridge2 = Math.max(sdSegment(u, v, 0.466, 0.527, 0.6, 0.638) - 0.026, frameOuter + stroke)
  const markA = cov(Math.min(frame, sun, ridge, ridge2))

  const outR = mix(cr, 1, markA)
  const outG = mix(cg, 1, markA)
  const outB = mix(cb, 1, markA)

  return [outR * plateA, outG * plateA, outB * plateA, plateA]
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/* -------------------------------------------------------------- write ---- */

function write(relPath, size, opts) {
  const target = resolve(root, relPath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, encodePng(render(size, opts), size, size))
  console.log(`  ✓ ${relPath} (${size}×${size})`)
}

console.log('Generating QuickImage icons…')
write('build/icon.png', 1024, { mono: false })
write('resources/tray.png', 16, { mono: false })
write('resources/tray@2x.png', 32, { mono: false })
write('resources/trayTemplate.png', 16, { mono: true })
write('resources/trayTemplate@2x.png', 32, { mono: true })
console.log('Done.')
