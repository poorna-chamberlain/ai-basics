/**
 * Development screenshot harness. Boots the real app wiring, drives the panel
 * through each state and writes PNGs to `.screenshots/`.
 *
 *   npm run capture
 */
import { app, nativeTheme } from 'electron'
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

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true })

  serveRenderer()

  const store = new Store('quickimage-capture.json')
  store.updateSettings({ providerId: 'wikimedia', theme: 'dark' })

  const overlay = new Overlay(preloadPath(), resolveRendererTarget())
  overlay.create()

  const hotkeys = new HotkeyManager(() => overlay.toggle())
  registerIpc({ store, overlay, hotkeys, onHotkeyChanged: () => {} })

  const window = overlay.browserWindow!
  await new Promise<void>((resolve) => window.webContents.once('did-finish-load', () => resolve()))
  nativeTheme.themeSource = 'dark'
  overlay.show()
  await wait(900)

  const shot = async (name: string): Promise<void> => {
    // Let the window resize settle before grabbing the frame.
    await wait(450)
    const theme = await window.webContents.executeJavaScript(
      `document.documentElement.dataset.theme + '/' + getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()`,
      true
    )
    const image = await window.webContents.capturePage()
    writeFileSync(join(OUT, `${name}.png`), image.toPNG())
    console.log(
      `captured ${name} (${image.getSize().width}×${image.getSize().height}) theme=${theme}`
    )
  }

  const run = (js: string): Promise<unknown> => window.webContents.executeJavaScript(js, true)

  const setTheme = async (theme: 'dark' | 'light'): Promise<void> => {
    nativeTheme.themeSource = theme
    await wait(350)
  }

  /** Polls until `predicate` evaluates truthy in the page, or times out. */
  const until = async (predicate: string, timeoutMs = 25_000): Promise<boolean> => {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await run(predicate)) return true
      await wait(250)
    }
    return false
  }

  // 1. Collapsed launcher
  await shot('01-collapsed-dark')

  // 2. Typing -> results. Setting .value directly would not fire React's
  // onChange, so dispatch through the native setter the way React expects.
  await run(`
    (() => {
      const input = document.querySelector('.search-input');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'mountain lake');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()
  `)
  await shot('02-loading-dark')

  const gotResults = await until(`document.querySelectorAll('.tile').length > 4`)
  console.log(`results rendered: ${gotResults}`)
  await wait(1200) // let thumbnails decode
  await shot('03-results-dark')

  await setTheme('light')
  await shot('04-results-light')
  await setTheme('dark')

  // 3. Settings
  await run(`document.querySelector('[aria-label="Settings"]').click()`)
  await shot('05-settings-dark')
  await setTheme('light')
  await shot('06-settings-light')
  await setTheme('dark')
  await run(`document.querySelector('[aria-label="Settings"]').click()`)

  // 4. Editor
  await run(`document.querySelector('.tile').click()`)
  await until(`document.querySelector('.canvas-frame__img') !== null`, 30_000)
  await wait(1500)
  await shot('07-editor-dark')
  await setTheme('light')
  await shot('08-editor-light')
  await setTheme('dark')

  // 5. History (the editor registers the opened image on the way in)
  await run(`document.querySelector('[aria-label="Back to results"]').click()`)
  await wait(400)
  await run(`document.querySelector('[aria-label="History"]').click()`)
  await shot('09-history-dark')

  // 6. No-results state
  await run(`document.querySelector('[aria-label="History"]').click()`)
  await run(`
    (() => {
      const input = document.querySelector('.search-input');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'zzqqxx nonexistent subject 12345');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()
  `)
  await until(`document.querySelector('.state__title') !== null`, 20_000)
  await shot('10-no-results-dark')

  console.log(`\nScreenshots in ${OUT}`)
  app.exit(0)
}

app.whenReady().then(main)
