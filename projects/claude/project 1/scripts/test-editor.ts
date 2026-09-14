/**
 * End-to-end check of the editing pipeline: search -> open -> remove
 * background -> recolour -> copy. Verifies actual pixel transparency rather
 * than just that the buttons are clickable.
 *
 *   npm run test:editor
 */
import { app, clipboard, nativeTheme } from 'electron'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { registerIpc } from '../src/main/ipc'
import { Overlay, preloadPath, resolveRendererTarget } from '../src/main/overlay'
import { registerAppScheme, serveRenderer } from '../src/main/protocol'
import { HotkeyManager } from '../src/main/shortcuts'
import { Store } from '../src/main/store'

registerAppScheme()

const OUT = join(app.getAppPath(), '.screenshots')
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

let failures = 0
function report(name: string, ok: boolean, detail: string): void {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(40)} ${detail}`)
}

/** Measures how much of the displayed image is actually transparent. */
const MEASURE = `
(() => {
  const img = document.querySelector('.canvas-frame__img');
  if (!img) return JSON.stringify({ error: 'no image' });
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let clear = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 16) clear++;
  const total = d.length / 4;
  return JSON.stringify({
    w: c.width, h: c.height,
    transparentPct: +(100 * clear / total).toFixed(1),
    kind: img.src.slice(0, 22)
  });
})()
`

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  serveRenderer()

  const store = new Store('quickimage-editor-test.json')
  store.updateSettings({ providerId: 'wikimedia', bgRemovalModel: 'isnet_quint8' })

  const overlay = new Overlay(preloadPath(), resolveRendererTarget())
  overlay.create()
  const hotkeys = new HotkeyManager(() => overlay.toggle())
  registerIpc({ store, overlay, hotkeys, onHotkeyChanged: () => {} })

  const window = overlay.browserWindow!
  window.webContents.on('console-message', (event) => {
    const text = String(event.message)
    if (event.level === 'error' || event.level === 'warning') {
      console.log(`   console[${event.level}]: ${text.slice(0, 300)}`)
    }
  })
  await new Promise<void>((r) => window.webContents.once('did-finish-load', () => r()))
  nativeTheme.themeSource = 'dark'
  overlay.show()
  await wait(800)

  const run = (js: string): Promise<unknown> => window.webContents.executeJavaScript(js, true)
  const until = async (js: string, timeoutMs: number, label: string): Promise<boolean> => {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await run(js)) return true
      await wait(400)
    }
    console.log(`   (timed out waiting for ${label})`)
    return false
  }
  const shot = async (name: string): Promise<void> => {
    await wait(400)
    writeFileSync(join(OUT, `${name}.png`), (await window.webContents.capturePage()).toPNG())
  }

  // A subject on a plain background gives an unambiguous cut-out.
  await run(`
    (() => {
      const input = document.querySelector('.search-input');
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      set.call(input, 'golden retriever dog portrait');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()
  `)
  const gotResults = await until(`document.querySelectorAll('.tile').length > 3`, 25_000, 'results')
  report('search returns results', gotResults, '')
  if (!gotResults) return finish()

  await run(`document.querySelector('.tile').click()`)
  const opened = await until(
    `!!document.querySelector('.canvas-frame__img')?.complete`,
    40_000,
    'editor image'
  )
  report('editor opens full image', opened, '')
  if (!opened) return finish()

  const before = JSON.parse(String(await run(MEASURE)))
  report(
    'original is opaque',
    before.transparentPct < 2,
    `${before.w}×${before.h}, ${before.transparentPct}% transparent`
  )

  console.log('\n   running background removal (first run downloads a 44 MB model)…')
  const started = Date.now()
  await run(
    `Array.from(document.querySelectorAll('.button')).find(b => /background/i.test(b.textContent)).click()`
  )

  // Progress overlay should appear, then disappear when inference completes.
  await until(`!!document.querySelector('.editor__overlay')`, 15_000, 'progress overlay')
  await shot('11-removing-background')

  // Surface what the panel is showing while we wait, so a stall is diagnosable.
  // Polled fast, because an error toast only stays on screen for a few seconds.
  let lastSeen = ''
  const ticker = setInterval(() => {
    void run(
      `document.querySelector('.progress-label')?.textContent
         ?? document.querySelector('.toast')?.textContent
         ?? 'idle'`
    ).then((value) => {
      const text = String(value)
      if (text !== lastSeen) {
        lastSeen = text
        console.log(`      …${text}`)
      }
    })
  }, 500)

  const done = await until(
    `!document.querySelector('.editor__overlay') && document.querySelector('.canvas-frame__img')?.src.startsWith('data:image/png')`,
    180_000,
    "background removal"
  )
  report('background removal completes', done, `${((Date.now() - started) / 1000).toFixed(1)}s`)
  clearInterval(ticker)
  if (!done) return finish()

  await wait(1200)
  const after = JSON.parse(String(await run(MEASURE)))
  report(
    'cut-out has real transparency',
    after.transparentPct > 15,
    `${after.transparentPct}% transparent (was ${before.transparentPct}%)`
  )
  await shot('12-cutout-transparent')

  // White backing must fill every transparent pixel.
  await run(`document.querySelector('.swatch--white').click()`)
  await wait(1800)
  const white = JSON.parse(String(await run(MEASURE)))
  report('white backing fills alpha', white.transparentPct < 1, `${white.transparentPct}% transparent`)
  await shot('13-cutout-white')

  await run(`document.querySelector('.swatch--black').click()`)
  await wait(1800)
  const black = JSON.parse(String(await run(MEASURE)))
  report('black backing fills alpha', black.transparentPct < 1, `${black.transparentPct}% transparent`)
  await shot('14-cutout-black')

  // Back to transparent: must restore alpha, proving compositing is lossless.
  await run(`document.querySelector('.swatch--transparent').click()`)
  await wait(1800)
  const restored = JSON.parse(String(await run(MEASURE)))
  report(
    'transparent restores alpha',
    Math.abs(restored.transparentPct - after.transparentPct) < 1,
    `${restored.transparentPct}% transparent`
  )

  // Clipboard.
  clipboard.clear()
  await run(
    `Array.from(document.querySelectorAll('.button')).find(b => /copy to clipboard/i.test(b.textContent)).click()`
  )
  // Checked promptly: the success toast auto-dismisses after ~1.9s.
  await wait(700)
  const hasPng = await clipboard.has('image/png')
  report('copy puts a PNG on the clipboard', hasPng, '')

  const toasted = await run(`!!document.querySelector('.toast')`)
  report('copy shows a confirmation toast', Boolean(toasted), String(await run(`document.querySelector('.toast')?.textContent ?? ''`)))
  await shot('15-copied-toast')

  finish()
}

function finish(): void {
  console.log(`\n${failures === 0 ? 'ALL EDITOR CHECKS PASSED' : `${failures} CHECK(S) FAILED`}\n`)
  app.exit(failures === 0 ? 0 : 1)
}

app.whenReady().then(main)
